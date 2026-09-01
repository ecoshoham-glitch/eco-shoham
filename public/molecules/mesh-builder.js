// בניית מש משולשים (כדורים לאטומים, גלילים לקשרים) מתוך תוצאת
// PeptideGeometry.buildPeptide — קוד משותף לדפדפן (webxr-ar.js, AR חי)
// ולכלי הפקת ה-GLB האופליין (tools/glb-export.mjs, שטוען את הקובץ הזה
// דרך vm, בדיוק כמו שהוא כבר טוען peptide-geometry.js/cpk-colors-data.js —
// כדי שלא יהיה פיצול בין צבעים/רדיוסים/קנה-מידה בין GLB סטטי ל-AR חי
// דינמי). דורש ש-CPK_HEX (מ-cpk-colors-data.js) כבר נטען כ-global לפני
// קובץ זה — בדיוק כמו בדף עצמו.

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function cpkColor(element) {
  const hex = CPK_HEX[element] || 'ff69b4'; // ורוד — יסוד לא-צפוי, עקבי עם molecule-viewer.js
  return [
    srgbToLinear(parseInt(hex.substring(0, 2), 16) / 255),
    srgbToLinear(parseInt(hex.substring(2, 4), 16) / 255),
    srgbToLinear(parseInt(hex.substring(4, 6), 16) / 255),
  ];
}

// רדיוסי "כדור" בסגנון Ball-and-Stick — קטנים בהרבה מ-Van der Waals
// מלא, עקביים בין היסודות (ערכים קבועים בלבד, לא טבלת VDW מלאה).
const MESH_BALL_RADIUS = { C: 0.35, H: 0.25, O: 0.35, N: 0.35, S: 0.45 };
function atomRadius(element) {
  return MESH_BALL_RADIUS[element] || 0.35;
}
const MESH_STICK_RADIUS = 0.15; // תואם בדיוק ל-stick.radius ב-applyStandardStyle (molecule-viewer.js)

function uvSphereMesh(PG, center, radius, color, latSegments, lonSegments) {
  const positions = [];
  const normals = [];
  const colors = [];
  const indices = [];

  for (let lat = 0; lat <= latSegments; lat++) {
    const theta = (lat * Math.PI) / latSegments; // 0..π
    const sinT = Math.sin(theta), cosT = Math.cos(theta);
    for (let lon = 0; lon <= lonSegments; lon++) {
      const phi = (lon * 2 * Math.PI) / lonSegments; // 0..2π
      const nx = sinT * Math.cos(phi);
      const ny = cosT;
      const nz = sinT * Math.sin(phi);
      positions.push(center.x + radius * nx, center.y + radius * ny, center.z + radius * nz);
      normals.push(nx, ny, nz);
      colors.push(color[0], color[1], color[2]);
    }
  }
  const stride = lonSegments + 1;
  for (let lat = 0; lat < latSegments; lat++) {
    for (let lon = 0; lon < lonSegments; lon++) {
      const a = lat * stride + lon;
      const b = a + stride;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return { positions, normals, colors, indices };
}

// מיושר בין שתי נקודות בעזרת אותה לוגיקת מסגרת (buildFrame) שכבר
// משמשת ל-NeRF ב-peptide-geometry.js.
function cylinderMesh(PG, start, end, radius, color, segments) {
  const axis = PG.vSub(end, start);
  const length = PG.vLen(axis);
  if (length < 1e-6) return { positions: [], normals: [], colors: [], indices: [] };
  const dir = PG.vNorm(axis);

  let arbitrary = Math.abs(dir.x) < 0.9 ? PG.v(1, 0, 0) : PG.v(0, 1, 0);
  const side1 = PG.vNorm(PG.vCross(dir, arbitrary));
  const side2 = PG.vCross(dir, side1);

  const positions = [];
  const normals = [];
  const colors = [];
  const indices = [];

  for (let ring = 0; ring <= 1; ring++) {
    const center = ring === 0 ? start : end;
    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const nx = Math.cos(angle) * side1.x + Math.sin(angle) * side2.x;
      const ny = Math.cos(angle) * side1.y + Math.sin(angle) * side2.y;
      const nz = Math.cos(angle) * side1.z + Math.sin(angle) * side2.z;
      positions.push(center.x + radius * nx, center.y + radius * ny, center.z + radius * nz);
      normals.push(nx, ny, nz);
      colors.push(color[0], color[1], color[2]);
    }
  }
  const stride = segments + 1;
  for (let i = 0; i < segments; i++) {
    const a = i, b = i + stride;
    indices.push(a, b, a + 1, a + 1, b, b + 1);
  }
  return { positions, normals, colors, indices };
}

function mergeMeshes(meshes) {
  const positions = [], normals = [], colors = [], indices = [];
  let vertexOffset = 0;
  meshes.forEach((m) => {
    positions.push(...m.positions);
    normals.push(...m.normals);
    colors.push(...m.colors);
    m.indices.forEach((idx) => indices.push(idx + vertexOffset));
    vertexOffset += m.positions.length / 3;
  });
  return { positions, normals, colors, indices };
}

// תקן glTF מגדיר במפורש: יחידה אחת = מטר אחד. הקואורדינטות הכימיות שלנו
// (ממקור PubChem/NeRF) הן באנגסטרם — כתיבתן כמו-שהן יוצרת מולקולה
// "פיזית" בגודל 5–8 מטר. זהו תיקון ליחידות התצוגה ב-AR/WebGL בלבד — לא
// נוגע בשום קואורדינטה כימית, זווית, אורך קשר או מנגנון בניית השרשרת.
function targetMaxDimensionMeters(residueCount) {
  if (residueCount <= 1) return 0.18;
  if (residueCount === 2) return 0.25;
  return Math.min(0.45, 0.25 + (residueCount - 2) * 0.05); // רצפים עתידיים: טווח 0.20–0.45 מ'
}

// ממרכז ב-X/Z, מניח את הנקודה הנמוכה ביותר על Y=0 (להצבה על משטח),
// וממיר לקנה מידה אחיד כך שהממד הארוך ביותר בפועל (כולל רדיוסי הקצוות,
// לא רק מרכזי האטומים) יגיע ליעד.
function applyEducationalArScale(mesh, residueCount) {
  const n = mesh.positions.length / 3;
  if (n === 0) return mesh;
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < mesh.positions.length; i += 3) {
    for (let c = 0; c < 3; c++) {
      const v = mesh.positions[i + c];
      if (v < min[c]) min[c] = v;
      if (v > max[c]) max[c] = v;
    }
  }
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const maxDim = Math.max(size[0], size[1], size[2]) || 1;
  const scale = targetMaxDimensionMeters(residueCount) / maxDim;
  const centerX = (min[0] + max[0]) / 2;
  const centerZ = (min[2] + max[2]) / 2;
  const minY = min[1];

  const positions = new Array(mesh.positions.length);
  for (let i = 0; i < mesh.positions.length; i += 3) {
    positions[i] = (mesh.positions[i] - centerX) * scale;
    positions[i + 1] = (mesh.positions[i + 1] - minY) * scale;
    positions[i + 2] = (mesh.positions[i + 2] - centerZ) * scale;
  }
  // normals: וקטורי כיוון בלבד — קנה מידה אחיד וחיובי לא משנה כיוון.
  return { positions, normals: mesh.normals, colors: mesh.colors, indices: mesh.indices };
}

function buildMoleculeMesh(PG, result, options) {
  const opts = options || {};
  const latSeg = opts.sphereLatSegments || 10;
  const lonSeg = opts.sphereLonSegments || 14;
  const cylSeg = opts.cylinderSegments || 10;

  const meshes = [];
  result.atoms.forEach((atom) => {
    meshes.push(uvSphereMesh(PG, atom, atomRadius(atom.element), cpkColor(atom.element), latSeg, lonSeg));
  });
  result.bonds.forEach((bond) => {
    const a = result.atoms[bond.a1 - 1];
    const b = result.atoms[bond.a2 - 1];
    // צבע הגליל: ממוצע פשוט של שני היסודות בקצוות (עקבי, לא משמעותי כימית)
    const colA = cpkColor(a.element), colB = cpkColor(b.element);
    const midColor = [(colA[0] + colB[0]) / 2, (colA[1] + colB[1]) / 2, (colA[2] + colB[2]) / 2];
    meshes.push(cylinderMesh(PG, a, b, MESH_STICK_RADIUS, midColor, cylSeg));
  });
  const merged = mergeMeshes(meshes);
  // ברירת מחדל: false — לא משנה התנהגות קיימת (בדיקות תסלציה גולמיות
  // ב-tools/test-glb-export.mjs בודקות מרחקים/רדיוסים באנגסטרום גולמי).
  if (opts.applyArScale) {
    const residueCount = (result.residueRanges && result.residueRanges.length) || 1;
    return applyEducationalArScale(merged, residueCount);
  }
  return merged;
}
