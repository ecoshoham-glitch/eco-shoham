// AR חי עם שליטה אמיתית בזמן session פעיל (סיבוב + הגדלה/הקטנה
// באחוזים, עם בקרת מהירות) — מנוע WebXR עצמאי, כתוב ידנית, בלי
// model-viewer ובלי ספרייה חדשה. הסיבה: נבדק בפועל (בדיקת קוד המקור של
// vendor/model-viewer.min.js) שאין שם API ציבורי לשינוי scale/מיקום
// בזמן session WebXR שהספרייה עצמה מפעילה — הדרך היחידה למימוש אמיתי
// היא session עצמאי שהעמוד הזה מנהל בעצמו מקצה לקצה.
//
// היקף מכוון: זו חלופה נוספת לכפתורי ה-AR הישירים הקיימים (Adjustable/
// Stable ב-Scene Viewer, Quick Look ב-iOS) — לא מחליפה אותם. WebXR
// immersive-ar אינו קיים ב-Safari/iOS בכלל, ותמיכתו באנדרואיד תלויה
// במכשיר/גרסת Chrome/ARCore — לכן הכפתור הזה מוצג רק כש-navigator.xr
// מדווח בפועל על תמיכה ב-'immersive-ar' (ראו checkWebXrStatus ב-
// ar-viewer.js). כשל בפועל בזמן ריצה (למשל hit-test לא נתמך, המשתמש
// דוחה הרשאת מצלמה) מטופל כאן ומדווח דרך logArDiag הקיים — לא נכשל בשקט.

const WEBXR_ROTATE_RAD_PER_SEC = 1.2; // ~69°/שנייה במהירות "רגיל" (מכפלת מהירות 1) — כפתורי החזק-לחצן
const WEBXR_ZOOM_STEP_PERCENT = 10; // אחוז שינוי-גודל אחד לכל לחיצה, במהירות "רגיל"
const WEBXR_SCALE_MIN = 0.3;
const WEBXR_SCALE_MAX = 3.0;
const WEBXR_FALLBACK_PLACEMENT_DISTANCE_M = 0.6; // כשאין hit-test: ממקמים ישירות מול הצופה
// גרירה באצבע אחת: רוחב מסך מלא = סיבוב אחד מלא (360°). ללא הגבלה על
// כמות הסיבובים (rotationY מצטבר ללא תקרה) — גרירה חוזרת ממשיכה לסובב.
const WEBXR_DRAG_ROTATE_SENSITIVITY = 1.0;

let webxrArState = null; // null כשאין session פעיל — נבנה מחדש בכל הפעלה

// ==================== בניית גיאומטריה חיה מתוך הרצף הנוכחי (לא GLB
// סטטי): loadAllTemplates/PeptideGeometry (molecule-viewer.js, כבר
// גלובלי) + buildMoleculeMesh (mesh-builder.js, אותה לוגיקה בדיוק
// שמשמשת גם את tools/glb-export.mjs) — כדי לתמוך בכל רצף שהמשתמש בונה
// בפועל (לא רק בחומצה בודדת/שני הרצפים הקבועים שיש להם GLB מוכן), כולל
// הוספת חומצות תוך כדי session AR פעיל (addResidueToLiveAr). ====================
function meshToTypedArrays(mesh) {
  const useShort = mesh.positions.length / 3 <= 65536; // תואם בדיוק ל-useShort ב-tools/glb-export.mjs
  return {
    positions: Float32Array.from(mesh.positions),
    normals: Float32Array.from(mesh.normals),
    colors: Float32Array.from(mesh.colors),
    indices: useShort ? Uint16Array.from(mesh.indices) : Uint32Array.from(mesh.indices),
  };
}

async function buildLiveArMeshData(sequenceIds) {
  const templates = await loadAllTemplates(sequenceIds); // molecule-viewer.js
  const result = PeptideGeometry.buildPeptide(sequenceIds, templates);
  const validation = PeptideGeometry.validatePeptide(result, sequenceIds.length);
  if (!validation.ok) throw new Error('בעיה כימית: ' + validation.errors.join('; '));
  const mesh = buildMoleculeMesh(PeptideGeometry, result, { applyArScale: true }); // mesh-builder.js
  return meshToTypedArrays(mesh);
}

function deleteWebxrMeshBuffers(gl, buffers) {
  gl.deleteBuffer(buffers.position);
  if (buffers.normal) gl.deleteBuffer(buffers.normal);
  if (buffers.color) gl.deleteBuffer(buffers.color);
  gl.deleteBuffer(buffers.index);
}

// ==================== מתמטיקת מטריצות 4x4 מינימלית (column-major, כמו
// WebGL/glTF/WebXR) — בלי ספריית מטריצות חיצונית. ====================
function mat4Identity() {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function mat4Multiply(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

function mat4RotationY(radians) {
  const c = Math.cos(radians), s = Math.sin(radians);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
}

function mat4UniformScale(factor) {
  return new Float32Array([factor, 0, 0, 0, 0, factor, 0, 0, 0, 0, factor, 0, 0, 0, 0, 1]);
}

function mat4Translation(x, y, z) {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

// סיבוב+קנה-מידה אחיד לא משנים כיוון נורמלים אחרי נירמול, אז מטריצת
// הנורמלים היא פשוט החלק הליניארי (3x3) של pose*rotationY, בלי scale.
function mat3FromMat4Linear(m) {
  return new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]);
}

// ==================== WebGL: shader מינימלי, Lambertian פשוט + צבע-קודקוד ====================
const WEBXR_VERTEX_SHADER_SOURCE = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec3 aColor;
  uniform mat4 uModelMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat3 uNormalMatrix;
  varying vec3 vNormal;
  varying vec3 vColor;
  void main() {
    vNormal = uNormalMatrix * aNormal;
    vColor = aColor;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
  }
`;
const WEBXR_FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  varying vec3 vNormal;
  varying vec3 vColor;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 lightDir = normalize(vec3(0.4, 0.8, 0.6));
    float ndotl = max(dot(n, lightDir), 0.0);
    float ambient = 0.45;
    gl_FragColor = vec4(vColor * (ambient + (1.0 - ambient) * ndotl), 1.0);
  }
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('קומפילציית shader נכשלה: ' + info);
  }
  return shader;
}

function createWebxrProgram(gl) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, WEBXR_VERTEX_SHADER_SOURCE);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, WEBXR_FRAGMENT_SHADER_SOURCE);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('קישור תוכנית WebGL נכשל: ' + gl.getProgramInfoLog(program));
  }
  return {
    program,
    attribLocations: {
      position: gl.getAttribLocation(program, 'aPosition'),
      normal: gl.getAttribLocation(program, 'aNormal'),
      color: gl.getAttribLocation(program, 'aColor'),
    },
    uniformLocations: {
      model: gl.getUniformLocation(program, 'uModelMatrix'),
      view: gl.getUniformLocation(program, 'uViewMatrix'),
      projection: gl.getUniformLocation(program, 'uProjectionMatrix'),
      normalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
    },
  };
}

function createWebxrMeshBuffers(gl, meshData) {
  function makeBuffer(target, data) {
    const buf = gl.createBuffer();
    gl.bindBuffer(target, buf);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return buf;
  }
  return {
    position: makeBuffer(gl.ARRAY_BUFFER, meshData.positions),
    normal: meshData.normals ? makeBuffer(gl.ARRAY_BUFFER, meshData.normals) : null,
    color: meshData.colors ? makeBuffer(gl.ARRAY_BUFFER, meshData.colors) : null,
    index: makeBuffer(gl.ELEMENT_ARRAY_BUFFER, meshData.indices),
    indexCount: meshData.indices.length,
    indexType: meshData.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
  };
}

function drawWebxrMesh(gl, programInfo, buffers, modelMatrix, normalMatrix, viewMatrix, projectionMatrix) {
  gl.useProgram(programInfo.program);
  gl.uniformMatrix4fv(programInfo.uniformLocations.model, false, modelMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.view, false, viewMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.projection, false, projectionMatrix);
  gl.uniformMatrix3fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.enableVertexAttribArray(programInfo.attribLocations.position);
  gl.vertexAttribPointer(programInfo.attribLocations.position, 3, gl.FLOAT, false, 0, 0);

  if (buffers.normal && programInfo.attribLocations.normal >= 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.enableVertexAttribArray(programInfo.attribLocations.normal);
    gl.vertexAttribPointer(programInfo.attribLocations.normal, 3, gl.FLOAT, false, 0, 0);
  }
  if (buffers.color && programInfo.attribLocations.color >= 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.enableVertexAttribArray(programInfo.attribLocations.color);
    gl.vertexAttribPointer(programInfo.attribLocations.color, 3, gl.FLOAT, false, 0, 0);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
  gl.drawElements(gl.TRIANGLES, buffers.indexCount, buffers.indexType, 0);
}

// ==================== שליטה: סיבוב מתמשך (החזק-לחצן) + הגדלה/הקטנה
// באחוזים לכל לחיצה, שתיהן מוכפלות במהירות הנבחרת. ====================
function webxrSpeedMultiplier() {
  const select = document.getElementById('webxr-speed-select');
  return select ? parseFloat(select.value) || 1 : 1;
}

function updateWebxrScaleReadout() {
  const readout = document.getElementById('webxr-scale-readout');
  if (readout && webxrArState) readout.textContent = Math.round(webxrArState.scale * 100) + '%';
}

// ==================== הוספת חומצה תוך כדי session AR פעיל: בונים מחדש
// את הגיאומטריה (רצף ארוך יותר), מחליפים buffers WebGL — בלי לצאת
// מ-AR, בלי לאבד את המיקום/סיבוב/גודל הנוכחיים שהמשתמש כבר קבע. ====================
function setWebxrAddButtonsDisabled(disabled) {
  ['webxr-add-gly', 'webxr-add-ala', 'webxr-add-ser', 'webxr-add-phe'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = disabled;
  });
}

async function addResidueToLiveAr(residueId) {
  const state = webxrArState;
  if (!state || state.rebuilding) return; // session לא פעיל, או כבר באמצע בנייה מהקלקה קודמת
  state.rebuilding = true;
  setWebxrAddButtonsDisabled(true);
  const nextSequence = state.sequenceIds.concat([residueId]);
  try {
    const meshData = await buildLiveArMeshData(nextSequence);
    const oldBuffers = state.buffers;
    state.buffers = createWebxrMeshBuffers(state.gl, meshData);
    deleteWebxrMeshBuffers(state.gl, oldBuffers);
    state.sequenceIds = nextSequence;
    logArDiag('AR חי: נוספה חומצה (' + residueId + ') — רצף נוכחי: ' + nextSequence.join('-'));
  } catch (err) {
    logArDiag('AR חי: הוספת חומצה נכשלה — ' + err.message);
  } finally {
    state.rebuilding = false;
    setWebxrAddButtonsDisabled(false);
  }
}

// ==================== גרירה באצבע אחת לסיבוב 360° חופשי ====================
// מאזינים על שכבת ה-DOM Overlay עצמה (לא הכפתורים) — פועלת רק אחרי
// מיקום (webxr-ar-overlay--placed, ראו CSS), כדי לא להתנגש עם מגע-להצבה
// (tap-to-place, מגיע כאירוע select של WebXR עצמו, לא DOM — נופל דרך
// ה-overlay רק כשה-pointer-events שלה עדיין none, לפני מיקום). דילוג
// מפורש על מגעים שהתחילו בתוך אזור הכפתורים (.webxr-ar-controls) —
// אחרת גם לחיצה על כפתור הייתה מתחילה "גרירה" בטעות.
function setupWebxrDragRotate() {
  const overlay = document.getElementById('webxr-ar-overlay');
  if (!overlay) return;

  overlay.addEventListener('pointerdown', (ev) => {
    if (ev.target.closest('.webxr-ar-controls')) return;
    if (!webxrArState || !webxrArState.placed) return;
    webxrArState.dragPointerId = ev.pointerId;
    webxrArState.dragLastX = ev.clientX;
    if (overlay.setPointerCapture) overlay.setPointerCapture(ev.pointerId);
  });
  overlay.addEventListener('pointermove', (ev) => {
    if (!webxrArState || webxrArState.dragPointerId !== ev.pointerId) return;
    const deltaX = ev.clientX - webxrArState.dragLastX;
    webxrArState.dragLastX = ev.clientX;
    const screenWidth = window.innerWidth || 1;
    // רוחב מסך מלא = סיבוב מלא (2π); rotationY מצטבר בלי תקרה, כך
    // שגרירות חוזרות באותו כיוון ממשיכות לסובב מעבר ל-360° בודדים.
    webxrArState.rotationY += (deltaX / screenWidth) * 2 * Math.PI * WEBXR_DRAG_ROTATE_SENSITIVITY;
  });
  function endDrag(ev) {
    if (webxrArState && webxrArState.dragPointerId === ev.pointerId) webxrArState.dragPointerId = null;
  }
  overlay.addEventListener('pointerup', endDrag);
  overlay.addEventListener('pointercancel', endDrag);
}

function setupWebxrControlListeners() {
  const rotateLeft = document.getElementById('webxr-rotate-left');
  const rotateRight = document.getElementById('webxr-rotate-right');
  const zoomIn = document.getElementById('webxr-zoom-in');
  const zoomOut = document.getElementById('webxr-zoom-out');
  const exitBtn = document.getElementById('webxr-ar-exit');

  function startRotate(direction) {
    return function (ev) {
      ev.preventDefault();
      // Pointer Capture: בלי זה, יד רועדת קלות (טבעי כשמחזיקים טלפון
      // מורם ל-AR) יכולה להזיז את האצבע רגע מחוץ לכפתור העגול (56px)
      // באמצע ההחזקה — זה מייצר pointerleave ומפסיק את הסיבוב באמצע,
      // בדיוק התסמין שדווח ("לא ניתן לסובב"). עם setPointerCapture,
      // pointerup/pointercancel עדיין מגיעים לכפתור הזה גם אם האצבע
      // זזה החוצה, כל עוד לא הורמה — לא צריך פעם עוד להסתמך על pointerleave.
      if (ev.target.setPointerCapture) ev.target.setPointerCapture(ev.pointerId);
      if (webxrArState) webxrArState.rotateDirection = direction;
    };
  }
  function stopRotate() {
    if (webxrArState) webxrArState.rotateDirection = 0;
  }
  function zoomBy(factorUp) {
    return function () {
      if (!webxrArState) return;
      const step = (WEBXR_ZOOM_STEP_PERCENT * webxrSpeedMultiplier()) / 100;
      const next = webxrArState.scale * (factorUp ? 1 + step : 1 / (1 + step));
      webxrArState.scale = Math.min(WEBXR_SCALE_MAX, Math.max(WEBXR_SCALE_MIN, next));
      updateWebxrScaleReadout();
    };
  }

  [rotateLeft, rotateRight].forEach((btn, i) => {
    if (!btn) return;
    const dir = i === 0 ? -1 : 1;
    btn.addEventListener('pointerdown', startRotate(dir));
    btn.addEventListener('pointerup', stopRotate);
    btn.addEventListener('pointercancel', stopRotate);
  });
  if (zoomIn) zoomIn.addEventListener('click', zoomBy(true));
  if (zoomOut) zoomOut.addEventListener('click', zoomBy(false));
  if (exitBtn) exitBtn.addEventListener('click', () => { if (webxrArState) webxrArState.session.end(); });

  [['webxr-add-gly', 'gly'], ['webxr-add-ala', 'ala'], ['webxr-add-ser', 'ser'], ['webxr-add-phe', 'phe']].forEach(([elementId, residueId]) => {
    const btn = document.getElementById(elementId);
    if (btn) btn.addEventListener('click', () => addResidueToLiveAr(residueId));
  });

  setupWebxrDragRotate();
}

// ==================== מחזור חיים: הפעלה/סיום session ====================
// title: לתצוגה באבחון בלבד. הרצף עצמו נקרא ישירות מ-sequence (app.js,
// כבר גלובלי) — לא GLB סטטי — כך ש-AR חי תמיד משקף את השרשרת שנבנתה
// בפועל (כל שילוב, לא רק חומצה בודדת/gly-gly/gly-ala-ser הקבועים).
async function startLiveAr(title) {
  const overlay = document.getElementById('webxr-ar-overlay');
  const canvas = document.getElementById('webxr-ar-canvas');
  const hint = document.getElementById('webxr-ar-hint');
  if (!overlay || !canvas) return;
  if (hint) hint.hidden = false; // איפוס בין הפעלות — session קודם יכול היה להסתיר אותה אחרי מיקום

  if (!(navigator.xr && navigator.xr.requestSession)) {
    logArDiag('AR חי: navigator.xr לא זמין במכשיר הזה');
    return;
  }
  if (!sequence || sequence.length === 0) {
    logArDiag('AR חי: אין רצף פעיל להצגה');
    return;
  }

  let session;
  try {
    session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['local'],
      optionalFeatures: ['hit-test', 'dom-overlay'],
      domOverlay: { root: overlay },
    });
  } catch (err) {
    logArDiag('AR חי: בקשת session נכשלה — ' + err.message);
    return;
  }

  let gl;
  try {
    gl = canvas.getContext('webgl', { xrCompatible: true }) || canvas.getContext('experimental-webgl', { xrCompatible: true });
    if (!gl) throw new Error('הדפדפן לא מספק הקשר WebGL');
    await gl.makeXRCompatible();
  } catch (err) {
    logArDiag('AR חי: אתחול WebGL נכשל — ' + err.message);
    await session.end();
    return;
  }

  const initialSequence = sequence.slice();
  let meshData, programInfo, buffers;
  try {
    meshData = await buildLiveArMeshData(initialSequence);
    programInfo = createWebxrProgram(gl);
    buffers = createWebxrMeshBuffers(gl, meshData);
  } catch (err) {
    logArDiag('AR חי: בניית המולקולה נכשלה — ' + err.message);
    await session.end();
    return;
  }

  session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });
  const referenceSpace = await session.requestReferenceSpace('local');
  const viewerSpace = await session.requestReferenceSpace('viewer');

  let hitTestSource = null;
  try {
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
  } catch (err) {
    logArDiag('AR חי: hit-test לא נתמך במכשיר זה — מיקום קבוע מול המצלמה במקום זאת');
  }

  webxrArState = {
    session, gl, programInfo, buffers,
    referenceSpace, hitTestSource,
    sequenceIds: initialSequence,
    rebuilding: false,
    placed: false,
    placementMatrix: null,
    scale: 1.0,
    rotationY: 0,
    rotateDirection: 0,
    dragPointerId: null, // גרירה באצבע אחת לסיבוב — ראו setupWebxrDragRotate
    lastFrameTimeMs: null,
  };

  session.addEventListener('select', () => {
    if (!webxrArState || webxrArState.placed || !webxrArState.lastReticleMatrix) return;
    webxrArState.placementMatrix = webxrArState.lastReticleMatrix;
    webxrArState.placed = true;
    if (hint) hint.hidden = true;
    overlay.classList.add('webxr-ar-overlay--placed'); // מפעיל גרירה-לסיבוב על כל המסך — רק אחרי שיש מה לסובב
  });
  session.addEventListener('end', onLiveArSessionEnd);

  overlay.classList.add('webxr-ar-overlay--active');
  canvas.hidden = false;
  updateWebxrScaleReadout();
  logArDiag('AR חי: session התחיל (' + title + ')');

  session.requestAnimationFrame(onLiveArFrame);
}

function onLiveArSessionEnd() {
  const overlay = document.getElementById('webxr-ar-overlay');
  const canvas = document.getElementById('webxr-ar-canvas');
  // חובה להסיר גם --placed: בלי זה, ה-pointer-events:auto שהיא מפעילה
  // על כל המסך היה נשאר תקוע גם אחרי סיום ה-session (השכבה הופכת
  // שקופה אבל עדיין "בשכבה" מבחינת אירועי מגע) — חוסם בלי כוונה כל
  // לחיצה על עמוד הנחיתה שמתחתיה.
  if (overlay) overlay.classList.remove('webxr-ar-overlay--active', 'webxr-ar-overlay--placed');
  if (canvas) canvas.hidden = true;
  webxrArState = null;
}

function onLiveArFrame(time, frame) {
  const state = webxrArState;
  if (!state) return; // session הסתיים בין frame ל-frame
  state.session.requestAnimationFrame(onLiveArFrame);

  const pose = frame.getViewerPose(state.referenceSpace);
  if (!pose) return;

  const dt = state.lastFrameTimeMs == null ? 0 : Math.min((time - state.lastFrameTimeMs) / 1000, 0.1);
  state.lastFrameTimeMs = time;

  if (!state.placed) {
    if (state.hitTestSource) {
      const hitResults = frame.getHitTestResults(state.hitTestSource);
      if (hitResults.length > 0) {
        state.lastReticleMatrix = hitResults[0].getPose(state.referenceSpace).transform.matrix;
      }
    } else {
      // אין hit-test: ממקמים אוטומטית מול הצופה בפריים הראשון, בלי לחכות ל-tap
      const forward = new Float32Array(pose.transform.matrix);
      state.placementMatrix = mat4Multiply(forward, mat4Translation(0, 0, -WEBXR_FALLBACK_PLACEMENT_DISTANCE_M));
      state.placed = true;
      const hint = document.getElementById('webxr-ar-hint');
      if (hint) hint.hidden = true;
      const overlay = document.getElementById('webxr-ar-overlay');
      if (overlay) overlay.classList.add('webxr-ar-overlay--placed');
    }
  }

  if (state.rotateDirection !== 0) {
    state.rotationY += state.rotateDirection * WEBXR_ROTATE_RAD_PER_SEC * webxrSpeedMultiplier() * dt;
  }

  const glLayer = state.session.renderState.baseLayer;
  const gl = state.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  const placementBase = state.placed ? state.placementMatrix : state.lastReticleMatrix;
  if (!placementBase) return; // עדיין לא נמצאה נקודת הצבה כלל — כלום לא מצויר

  const poseRotation = mat4Multiply(placementBase, mat4RotationY(state.rotationY));
  const modelMatrix = mat4Multiply(poseRotation, mat4UniformScale(state.scale));
  const normalMatrix = mat3FromMat4Linear(poseRotation);

  for (const view of pose.views) {
    const viewport = glLayer.getViewport(view);
    gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
    drawWebxrMesh(gl, state.programInfo, state.buffers, modelMatrix, normalMatrix, view.transform.inverse.matrix, view.projectionMatrix);
  }
}
