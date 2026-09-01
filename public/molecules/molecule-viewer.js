// מציג תלת-ממדי של שרשרת פפטידית רציפה אחת (לא אוסף מולקולות נפרדות).
// הגיאומטריה עצמה (מיקום כל אטום, קשרים, הסרת אטומים בעת יצירת קשר
// פפטידי) מחושבת ב-peptide-geometry.js; הקובץ הזה אחראי רק על הרינדור
// ב-3Dmol.js: סגנון Ball-and-Stick/CPK, תוויות אטומים לימודיות, הדגשת
// קבוצת R, הדגשת הקשר החדש, הצגת מולקולת המים שנפלטה, אנימציית
// הקירוב, והצגת שגיאות כימיות אם הוולידציה נכשלת.
let moleculeViewer = null;
const residueTemplateCache = {}; // id -> {atoms, bonds, backbone}

// מצב תוויות/הדגשה (נשלט ע"י המתגים בממשק; ברירת מחדל: שניהם מוצגים)
let showAtomLabels = true;
let showRGroup = true;
let atomLabelRefs = []; // אובייקטי label של 3Dmol עבור סמלי אטומים (כולל Cα)
let rGroupLabelRefs = []; // אובייקטי label של 3Dmol עבור "R" / "R₁ — Gly" / קבוצות אמינו/קרבוקסיל
let rGroupShapeRefs = []; // אובייקטי shape (כדורי הילה שקופים) של קבוצת R
let lastRenderedResult = null; // תוצאת buildPeptide האחרונה שעברה ולידציה, לשימוש המתגים
let lastRenderedSequenceIds = null;
let hasEverFitToScreen = false; // כדי לא לבצע zoomTo אוטומטי אחרי כל הוספה (שומר על הזום/מיקום שהמשתמש קבע)
let zoomLevel = 50; // ערך לוגי 5–95 לצורך המחוון בלבד; viewer.zoom() הוא יחסי, לא מוחלט
const ZOOM_MIN = 5;
const ZOOM_MAX = 95;
const ZOOM_STEP = 4;
const R_GROUP_COLOR = '#c026d3'; // מג'נטה/ורוד-סגול — לא מתבלבל עם האדום של חמצן (CPK)
let lastMoleculeBoundingRadius = 0; // לצורך "התאם רק אם משהו יצא מהתצוגה"

// סף אטומים שמעליו תוויות מימן (H) מוסתרות אוטומטית כדי לשמור על
// קריאות במסך קטן (אייפון) — פחמן/חנקן/חמצן נשארים מתויגים תמיד.
// זהו קירוב סביר לצפיפות מסך בפועל (אין לנו דרך למדוד פיקסלים בפועל),
// לא מדידת מרחק מסך אמיתית.
const HYDROGEN_LABEL_AUTO_HIDE_ATOM_COUNT = 25;

function getViewer() {
  if (typeof $3Dmol === 'undefined' || typeof $3Dmol.createViewer !== 'function') {
    throw new Error(
      'ספריית 3Dmol.js לא נטענה כראוי (typeof $3Dmol=' + typeof $3Dmol +
      '). בדקו שהקובץ vendor/3dmol-min.js נטען לפני molecule-viewer.js ושאין שגיאת רשת/404 עבורו.'
    );
  }
  if (!moleculeViewer) {
    moleculeViewer = $3Dmol.createViewer('molecule-viewer', { backgroundColor: 'white' });
  }
  return moleculeViewer;
}

function loadResidueTemplate(id) {
  if (residueTemplateCache[id]) return Promise.resolve(residueTemplateCache[id]);
  const aa = AMINO_ACIDS[id];
  if (!aa || !aa.sdf || !aa.backbone) {
    return Promise.reject(new Error('חסר מידע (sdf/backbone) עבור חומצת אמינו: ' + id));
  }
  return fetch(aa.sdf)
    .then((res) => {
      if (!res.ok) throw new Error('קובץ ' + aa.sdf + ' חזר סטטוס HTTP ' + res.status + ' (' + res.statusText + ')');
      return res.text();
    })
    .then((text) => {
      if (!text || /^\s*<(!doctype|html)/i.test(text)) {
        throw new Error('קובץ ' + aa.sdf + ' לא נראה כמו SDF תקין (כנראה התקבל HTML/שגיאה)');
      }
      const parsed = PeptideGeometry.parseMolBlock(text);
      const tpl = { atoms: parsed.atoms, bonds: parsed.bonds, backbone: aa.backbone };
      residueTemplateCache[id] = tpl;
      return tpl;
    });
}

function loadAllTemplates(ids) {
  const unique = Array.from(new Set(ids));
  return Promise.all(unique.map(loadResidueTemplate)).then(() => residueTemplateCache);
}

// ---------- נקודת הכניסה הראשית: מרנדר שרשרת שלמה לפי רצף מזהים ----------
function renderPeptide(sequenceIds) {
  clearChemistryError();
  hideInfoCard();

  if (!sequenceIds || sequenceIds.length === 0) {
    lastRenderedResult = null;
    lastRenderedSequenceIds = null;
    hasEverFitToScreen = false; // התחלה מחדש — הריצוד הבא יתאים למסך מאפס
    try {
      const viewer = getViewer();
      viewer.clear();
      viewer.render();
    } catch (err) {
      showChemistryError('שגיאה באתחול המציג התלת-ממדי: ' + err.message);
    }
    setMoleculeCaption('לחצו על אחד הכפתורים למעלה כדי להתחיל לבנות שרשרת פפטידית.');
    setDisclaimerVisible(false);
    return;
  }

  setMoleculeCaption('בונה שרשרת פפטידית (' + sequenceIds.length + ' שיירים)...');

  loadAllTemplates(sequenceIds)
    .then((templates) => {
      let result;
      try {
        result = PeptideGeometry.buildPeptide(sequenceIds, templates);
      } catch (err) {
        throw new Error('שגיאה בבניית הגיאומטריה: ' + err.message);
      }

      const validation = PeptideGeometry.validatePeptide(result, sequenceIds.length);
      if (!validation.ok) {
        throw new Error('נמצאו בעיות כימיות במבנה — השרשרת לא תוצג:\n• ' + validation.errors.join('\n• '));
      }

      renderValidatedPeptide(result, sequenceIds);
    })
    .catch((err) => {
      console.error('renderPeptide נכשל:', err);
      lastRenderedResult = null;
      lastRenderedSequenceIds = null;
      try {
        getViewer().clear();
        getViewer().render();
      } catch (e) {
        /* לא ניתן אפילו לנקות את המציג — מתעלמים, השגיאה כבר תוצג למטה */
      }
      setDisclaimerVisible(false);
      setMoleculeCaption('');
      showChemistryError(err.message);
    });
}

// ---------- היוריסטיקת "התאם תצוגה רק אם השרשרת גדלה משמעותית" ----------
// אין ב-3Dmol.js API ישיר ל"האם נקודה X נראית כרגע במסך" — זהו קירוב:
// משווים את רדיוס הכדור התוחם של כל המולקולה לפני/אחרי הוספה. אם גדל
// משמעותית (יחס > 1.3), כנראה שהשייר החדש יצא מהתצוגה הנוכחית ומצדיק
// zoomTo(); אחרת משאירים את זום/מיקום המשתמש כפי שהם.
function computeBoundingRadius(atoms) {
  if (!atoms || atoms.length === 0) return 0;
  const c = centroid(atoms);
  let maxDist = 0;
  atoms.forEach((a) => {
    const d = PeptideGeometry.vLen(PeptideGeometry.vSub(a, c));
    if (d > maxDist) maxDist = d;
  });
  return maxDist;
}

function shouldRefit(oldRadius, newRadius, growthThreshold) {
  const threshold = growthThreshold || 1.3;
  if (oldRadius <= 0) return false; // אין נתון קודם — לא כאן ההחלטה (הפעם הראשונה כבר מטופלת בנפרד)
  return newRadius > oldRadius * threshold;
}

function applyStandardStyle(viewer) {
  viewer.setStyle(
    {},
    {
      stick: { radius: 0.15, colorscheme: 'Jmol' },
      sphere: { scale: 0.25, colorscheme: 'Jmol' },
    }
  );
}

function renderValidatedPeptide(result, sequenceIds) {
  const viewer = getViewer();
  const molblock = PeptideGeometry.buildMolBlock(result.atoms, result.bonds, sequenceIds.join('-'));

  const hasNewResidue = sequenceIds.length >= 2 && result.newBondPair;

  lastRenderedResult = result;
  lastRenderedSequenceIds = sequenceIds;

  const newRadius = computeBoundingRadius(result.atoms);

  if (hasNewResidue) {
    animateApproachThenSettle(viewer, result, sequenceIds, molblock);
  } else {
    viewer.clear();
    viewer.addModel(molblock, 'sdf');
    applyStandardStyle(viewer);
    if (!hasEverFitToScreen) {
      viewer.zoomTo();
      hasEverFitToScreen = true;
    } else if (shouldRefit(lastMoleculeBoundingRadius, newRadius)) {
      viewer.zoomTo();
    }
    lastMoleculeBoundingRadius = newRadius;
    viewer.render();
    refreshLabelsAndHighlights();
    setupCaInteractions(viewer, result);
  }

  setMoleculeCaption(buildChainCaptionHtml(sequenceIds));
  setDisclaimerVisible(true);
}

// ---------- אנימציית קירוב: השייר האחרון "מחליק" למקומו הסופי ----------
function prefersReducedMotion() {
  try {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (err) {
    return false;
  }
}

function animateApproachThenSettle(viewer, result, sequenceIds, finalMolblock) {
  const lastRange = result.residueRanges[result.residueRanges.length - 1];
  const bondPair = result.newBondPair;
  const newRadius = computeBoundingRadius(result.atoms);

  const cPos = result.atoms[bondPair.cIndex - 1];
  const nPos = result.atoms[bondPair.nIndex - 1];
  const dir = PeptideGeometry.vNorm(PeptideGeometry.vSub(nPos, cPos));
  const APPROACH_DISTANCE = 5; // Å — היסט התחלתי לאנימציה, לא משמעות כימית

  // נגישות: prefers-reduced-motion מדלג על אנימציית הקירוב לגמרי (קופץ ישר לתוצאה הסופית)
  const skipAnimation = prefersReducedMotion();
  const FRAMES = 14;
  const FRAME_MS = 40;

  function settleFinal() {
    viewer.clear();
    viewer.addModel(finalMolblock, 'sdf');
    applyStandardStyle(viewer);
    if (!hasEverFitToScreen) {
      viewer.zoomTo();
      hasEverFitToScreen = true;
    } else if (shouldRefit(lastMoleculeBoundingRadius, newRadius)) {
      viewer.zoomTo();
    }
    lastMoleculeBoundingRadius = newRadius;
    viewer.render();
    refreshLabelsAndHighlights();
    setupCaInteractions(viewer, result);
    showBondHighlightAndWater(viewer, result);
  }

  if (skipAnimation) {
    settleFinal();
    return;
  }

  let frame = 0;
  function drawFrame() {
    const t = frame / FRAMES;
    const offsetScale = APPROACH_DISTANCE * (1 - t);
    const offset = PeptideGeometry.vScale(dir, offsetScale);

    const atomsThisFrame = result.atoms.map((a, idx0) => {
      const idx = idx0 + 1;
      if (idx >= lastRange.start && idx <= lastRange.end) {
        return { element: a.element, x: a.x + offset.x, y: a.y + offset.y, z: a.z + offset.z };
      }
      return a;
    });
    const mb = PeptideGeometry.buildMolBlock(atomsThisFrame, result.bonds, sequenceIds.join('-'));

    viewer.clear();
    viewer.addModel(mb, 'sdf');
    applyStandardStyle(viewer);
    if (frame === 0 && !hasEverFitToScreen) {
      viewer.zoomTo();
      hasEverFitToScreen = true;
    }
    viewer.render();

    frame++;
    if (frame <= FRAMES) {
      setTimeout(drawFrame, FRAME_MS);
    } else {
      settleFinal();
    }
  }
  drawFrame();
}

// ---------- הדגשת הקשר הפפטידי החדש + הצגת מולקולת המים שנפלטה (זמני) ----------
// שומר רק על ה-refs שהוא עצמו יצר, ומסיר בסוף רק אותם — כדי לא לפגוע
// בתוויות/הילות ה-R הקבועות שכבר צוירו ע"י refreshLabelsAndHighlights.
function showBondHighlightAndWater(viewer, result) {
  try {
    const tempShapes = [];
    const tempLabels = [];

    const cPos = result.atoms[result.newBondPair.cIndex - 1];
    const nPos = result.atoms[result.newBondPair.nIndex - 1];
    tempShapes.push(
      viewer.addCylinder({
        start: { x: cPos.x, y: cPos.y, z: cPos.z },
        end: { x: nPos.x, y: nPos.y, z: nPos.z },
        radius: 0.28,
        color: 'magenta',
        fromCap: true,
        toCap: true,
      })
    );

    const we = result.newWaterEvent;
    if (we && we.o && we.hFromO && we.hFromN) {
      tempShapes.push(viewer.addSphere({ center: we.o, radius: 0.35, color: 'red' }));
      tempShapes.push(viewer.addSphere({ center: we.hFromO, radius: 0.22, color: 'white' }));
      tempShapes.push(viewer.addSphere({ center: we.hFromN, radius: 0.22, color: 'white' }));
      tempShapes.push(viewer.addCylinder({ start: we.o, end: we.hFromO, radius: 0.08, color: 'red', fromCap: true, toCap: true }));
      tempShapes.push(viewer.addCylinder({ start: we.o, end: we.hFromN, radius: 0.08, color: 'red', fromCap: true, toCap: true }));
      tempLabels.push(
        viewer.addLabel('H₂O נפלט', {
          position: we.o,
          backgroundColor: 'darkslategray',
          backgroundOpacity: 0.8,
          fontColor: 'white',
          fontSize: 12,
        })
      );
    }
    viewer.render();

    setTimeout(() => {
      tempShapes.forEach((s) => {
        try { viewer.removeShape(s); } catch (e) { /* ignore */ }
      });
      tempLabels.forEach((l) => {
        try { viewer.removeLabel(l); } catch (e) { /* ignore */ }
      });
      viewer.render();
    }, 2500);
  } catch (err) {
    console.error('שגיאה באפקט ההדגשה/מולקולת המים (קוסמטי בלבד):', err);
  }
}

// ==================== תוויות אטומים + הדגשת קבוצת R ====================

function subscriptDigits(n) {
  const map = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  return String(n).split('').map((d) => map[d] || d).join('');
}

// מסיר ומאפס את כל תוויות/הילות ה-R הקבועות (לא את האפקטים הזמניים)
function clearPersistentVisuals(viewer) {
  atomLabelRefs.forEach((l) => { try { viewer.removeLabel(l); } catch (e) { /* ignore */ } });
  rGroupLabelRefs.forEach((l) => { try { viewer.removeLabel(l); } catch (e) { /* ignore */ } });
  rGroupShapeRefs.forEach((s) => { try { viewer.removeShape(s); } catch (e) { /* ignore */ } });
  atomLabelRefs = [];
  rGroupLabelRefs = [];
  rGroupShapeRefs = [];
}

// נקודת כניסה שהמתגים קוראים לה, וגם renderValidatedPeptide אחרי כל רינדור מוצלח
function refreshLabelsAndHighlights() {
  if (!lastRenderedResult || !lastRenderedSequenceIds) return;
  let viewer;
  try {
    viewer = getViewer();
  } catch (err) {
    return; // אם המציג עצמו לא זמין, אין מה לתייג
  }
  clearPersistentVisuals(viewer);

  if (showAtomLabels) applyAtomLabels(viewer, lastRenderedResult);
  if (showRGroup) applyRGroupHighlight(viewer, lastRenderedResult, lastRenderedSequenceIds);
  renderCpkLegend(lastRenderedResult);

  viewer.render();
}

function applyAtomLabels(viewer, result) {
  const totalAtoms = result.atoms.length;
  const hideHydrogens = totalAtoms > HYDROGEN_LABEL_AUTO_HIDE_ATOM_COUNT;

  // בונים סט של אינדקסי Cα גלובליים (לכל השיירים) כדי לתייג אותם "Cα" ולא "C"
  const caGlobalSet = new Set();
  result.residueRanges.forEach((range) => {
    const bb = AMINO_ACIDS[range.residueId].backbone;
    caGlobalSet.add(range.localToGlobal.get(bb.ca));
  });

  result.atoms.forEach((atom, idx0) => {
    const globalIdx = idx0 + 1;
    if (atom.element === 'H' && hideHydrogens) return;

    const text = caGlobalSet.has(globalIdx) ? 'Cα' : atom.element;
    // תוויות: שחור מלא (#000000) ואטום לגמרי, על רקע לבן כמעט-אטום
    // לקריאות — לא צבע האטום עצמו (זה נשאר CPK, ב-setStyle/GLB בלבד).
    // הערה: לספריית 3Dmol.js הזו (vendor/3dmol-min.js) אין אפשרות
    // "bold"/font-weight אמיתית ב-addLabel — פיצוי חלקי ב-fontSize מוגדל.
    const ref = viewer.addLabel(text, {
      position: { x: atom.x, y: atom.y, z: atom.z },
      fontColor: '#000000',
      fontOpacity: 1,
      fontSize: 10,
      showBackground: true,
      backgroundColor: '#ffffff',
      backgroundOpacity: 0.85,
      borderColor: '#9aa0aa', // מסגרת אפורה עדינה — 3Dmol.js תומך ב-borderColor/borderThickness, לא ב-borderRadius
      borderThickness: 1,
      inFront: true,
      alignment: 'center',
    });
    atomLabelRefs.push(ref);
  });
}

function centroid(points) {
  const sum = points.reduce((acc, p) => PeptideGeometry.vAdd(acc, p), PeptideGeometry.v(0, 0, 0));
  return PeptideGeometry.vScale(sum, 1 / points.length);
}

// עדכון עיצובי: אין יותר סימון R "תמידי" (הילה זהובה מלאה + תווית
// קבועה) — הוא היה גדול מדי וחפף אטומים. סימון קבוצת R עבר במלואו
// להיות חלק מ-applyCaHover, ומוצג רק בעת ריחוף/לחיצה על Cα או בחירה
// מהרצף (ראו למטה) — בדיוק כפי שנדרש. המתג "סימון שייר R" עדיין קיים
// (showRGroup) אך כעת שולט אם הסימון-בעת-בחירה יוצג בכלל, לא אם הוא
// מוצג תמידית. הפונקציה נשארת (נקראת מ-refreshLabelsAndHighlights)
// כדי לא לשנות את זרימת הקריאות, אך אינה מציירת דבר בעצמה יותר.
function applyRGroupHighlight(viewer, result, sequenceIds) {
  // no-op בכוונה — ראו הסבר למעלה.
}

// ---------- מתגים (נקראים מ-index.html) ----------
function toggleAtomLabels() {
  showAtomLabels = document.getElementById('toggle-atom-labels').checked;
  refreshLabelsAndHighlights();
}

function toggleRGroup() {
  showRGroup = document.getElementById('toggle-r-group').checked;
  refreshLabelsAndHighlights();
  // אם יש כרגע Cα נבחר, מרעננים את ההדגשה כדי שהמסגרת תופיע/תיעלם מיד
  if (currentHoveredResidueIndex !== null && lastRenderedResult) {
    try { applyCaHover(getViewer(), lastRenderedResult, currentHoveredResidueIndex); } catch (err) { /* ignore */ }
  }
}

// כרטיס מידע מאוחד (מחליף את חלונית הטקסט הפשוטה הישנה + "חומצת
// האמינו האחרונה"). data: {he, en, three, position, rFormula, terminusText}
function showInfoCard(data) {
  const card = document.getElementById('info-card');
  if (!card) return;
  setText('info-card-he', data.he || '');
  setText('info-card-en', data.en ? '(' + data.en + ')' : '');
  setText('info-card-three', data.three || '');
  setText('info-card-position', data.position || '');
  setText('info-card-r', data.rFormula || '—');
  const terminusEl = document.getElementById('info-card-terminus');
  if (terminusEl) {
    if (data.terminusText) {
      terminusEl.textContent = data.terminusText;
      terminusEl.hidden = false;
    } else {
      terminusEl.hidden = true;
    }
  }
  card.hidden = false;
}

function hideInfoCard() {
  const card = document.getElementById('info-card');
  if (card) card.hidden = true;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ==================== אינטראקציית Cα: הדגשה מלאה + מסגרת R + כיווני N/C ====================
// לפי הדרישה: תוויות קצוות/מסגרת R/עמעום אינם מוצגים כברירת מחדל —
// רק כאשר עומדים עם העכבר על Cα, לוחצים/נוגעים בו במגע, או בוחרים
// את השייר מהרצף. עוזבים/לוחצים במקום ריק -> הכל חוזר לתצוגה רגילה.
let caHoverShapeRefs = [];
let caHoverLabelRefs = [];
let currentHoveredResidueIndex = null;

function findResidueRangeIndex(globalAtomIndex, result) {
  return result.residueRanges.findIndex((r) => globalAtomIndex >= r.start && globalAtomIndex <= r.end);
}

function setupCaInteractions(viewer, result) {
  const caGlobalIndices = result.residueRanges.map((range) => {
    const bb = AMINO_ACIDS[range.residueId].backbone;
    return range.localToGlobal.get(bb.ca);
  });
  const caZeroBased = caGlobalIndices.map((g) => g - 1);

  try {
    viewer.setHoverable(
      { index: caZeroBased },
      true,
      (atom) => applyCaHover(viewer, result, findResidueRangeIndex(atom.index + 1, result)),
      () => clearCaHover(viewer)
    );
  } catch (err) {
    console.error('לא ניתן להפעיל hover על Cα (תכונה קוסמטית בלבד, לא תעבוד במגע):', err);
  }

  try {
    viewer.setClickable({ index: caZeroBased }, true, (atom) =>
      applyCaHover(viewer, result, findResidueRangeIndex(atom.index + 1, result))
    );
  } catch (err) {
    console.error('לא ניתן להפעיל לחיצה/מגע על Cα:', err);
  }
}

function clearCaHoverVisuals(viewer) {
  caHoverShapeRefs.forEach((s) => { try { viewer.removeShape(s); } catch (e) { /* ignore */ } });
  caHoverLabelRefs.forEach((l) => { try { viewer.removeLabel(l); } catch (e) { /* ignore */ } });
  caHoverShapeRefs = [];
  caHoverLabelRefs = [];
}

// מחזיר לתצוגה הרגילה (ללא עמעום, ללא מסגרת/חיצים) — נקרא בעזיבת עכבר
// ובלחיצה על מקום ריק. לא בונה מחדש את המודל (רק setStyle) — חלק,
// בלי הבהוב.
function clearCaHover(viewer) {
  if (currentHoveredResidueIndex === null) return;
  clearCaHoverVisuals(viewer);
  try {
    applyStandardStyle(viewer);
    viewer.render();
  } catch (err) {
    console.error('שגיאה בשחזור התצוגה הרגילה:', err);
  }
  currentHoveredResidueIndex = null;
  hideInfoCard();
}

function atomsAt(result, globalIndices) {
  return globalIndices.filter((g) => g !== undefined).map((g) => result.atoms[g - 1]);
}

function addWireframeBox(viewer, points, color, padding, radius) {
  if (points.length === 0) return;
  const box = PeptideGeometry.boundingBox(points, padding);
  const edges = PeptideGeometry.boxEdges(box.min, box.max);
  edges.forEach((edge) => {
    caHoverShapeRefs.push(
      viewer.addCylinder({ start: edge.a, end: edge.b, radius: radius, color: color, fromCap: true, toCap: true })
    );
  });
  return centroid(points.length ? points : [PeptideGeometry.v(0, 0, 0)]);
}

function addSpoke(viewer, fromPos, toPos, label, color) {
  caHoverShapeRefs.push(
    viewer.addCylinder({ start: fromPos, end: toPos, radius: 0.035, color: color || 'dimgray', fromCap: true, toCap: true })
  );
  if (label) {
    caHoverLabelRefs.push(
      viewer.addLabel(label, {
        position: toPos, fontColor: 'black', fontSize: 9, backgroundColor: 'white', backgroundOpacity: 0.75, inFront: true,
      })
    );
  }
}

// ---------- הפונקציה המרכזית: מפעילה את כל ההדגשה עבור שייר שנבחר ----------
function applyCaHover(viewer, result, rangeIndex) {
  if (rangeIndex === -1 || rangeIndex === undefined) return;
  clearCaHoverVisuals(viewer);
  currentHoveredResidueIndex = rangeIndex;

  const range = result.residueRanges[rangeIndex];
  const aa = AMINO_ACIDS[range.residueId];
  const bb = aa.backbone;
  const sc = aa.sideChain;
  const l2g = range.localToGlobal;
  const isFirst = rangeIndex === 0;
  const isLast = rangeIndex === result.residueRanges.length - 1;
  const isIsolated = isFirst && isLast;

  const fullRangeZeroBased = [];
  for (let g = range.start; g <= range.end; g++) fullRangeZeroBased.push(g - 1);

  // 1) עמעום כל השרשרת, ואז שחזור מלא (בהיר, מוגדל מעט) רק על השייר הנבחר
  try {
    viewer.setStyle({}, { stick: { radius: 0.15, colorscheme: 'Jmol', opacity: 0.25 }, sphere: { scale: 0.25, colorscheme: 'Jmol', opacity: 0.25 } });
    viewer.setStyle(
      { index: fullRangeZeroBased },
      { stick: { radius: 0.17, colorscheme: 'Jmol', opacity: 1.0 }, sphere: { scale: 0.28, colorscheme: 'Jmol', opacity: 1.0 } }
    );
  } catch (err) {
    console.error('שגיאה בעמעום/הדגשת השייר:', err);
  }

  // 2) הילה מודגשת (שקופה, כחלחלה) סביב כל אטומי השייר שנבחר — "החומצה שנבחרה"
  const residueAtoms = [];
  for (let g = range.start; g <= range.end; g++) residueAtoms.push(result.atoms[g - 1]);
  residueAtoms.forEach((p) => {
    caHoverShapeRefs.push(viewer.addSphere({ center: p, radius: 0.5, color: 'deepskyblue', opacity: 0.18 }));
  });

  // 3) הבהרת גבול הקשר הפפטידי המשותף עם השכנים
  if (!isFirst) {
    const prevRange = result.residueRanges[rangeIndex - 1];
    const prevBb = AMINO_ACIDS[prevRange.residueId].backbone;
    const prevC = result.atoms[prevRange.localToGlobal.get(prevBb.c) - 1];
    const thisN = result.atoms[l2g.get(bb.n) - 1];
    caHoverShapeRefs.push(viewer.addCylinder({ start: prevC, end: thisN, radius: 0.24, color: 'royalblue', fromCap: true, toCap: true }));
  }
  if (!isLast) {
    const nextRange = result.residueRanges[rangeIndex + 1];
    const nextBb = AMINO_ACIDS[nextRange.residueId].backbone;
    const nextN = result.atoms[nextRange.localToGlobal.get(nextBb.n) - 1];
    const thisC = result.atoms[l2g.get(bb.c) - 1];
    caHoverShapeRefs.push(viewer.addCylinder({ start: thisC, end: nextN, radius: 0.24, color: 'royalblue', fromCap: true, toCap: true }));
  }

  // 4) קווים (spokes) מ-Cα לכל אחד מארבעת מרכיבי השלד + מרכז קבוצת R
  const caPos = result.atoms[l2g.get(bb.ca) - 1];
  const nPos = result.atoms[l2g.get(bb.n) - 1];
  const carbonylCPos = result.atoms[l2g.get(bb.c) - 1];
  const carbonylOPos = result.atoms[l2g.get(bb.oDouble) - 1];
  const caHPos = sc ? result.atoms[l2g.get(sc.caH) - 1] : null;

  addSpoke(viewer, caPos, nPos, 'N (שלד)', 'blue');
  addSpoke(viewer, caPos, carbonylCPos, 'C (קרבוניל)', 'dimgray');
  addSpoke(viewer, caPos, carbonylOPos, 'O (קרבוניל)', 'red');
  if (caHPos) addSpoke(viewer, caPos, caHPos, 'H של Cα', 'gray');

  // 5) מסגרת דקה (מג'נטה) צמודה סביב קבוצת R בלבד + תווית "קבוצת R" —
  // padding קטן (0.12Å) כדי לא לחפוף לאטומי השלד הסמוכים, ורדיוס גליל
  // דק (0.02) כדי לא להסתיר אטומים/קשרים. מוצג רק אם המתג "סימון שייר
  // R" דלוק (showRGroup).
  let rFormula = '';
  if (sc) {
    rFormula = sc.rFormula; // הנוסחה מוצגת בכרטיס תמיד, גם אם הסימון החזותי כבוי
    if (showRGroup) {
      const rGlobal = sc.rGroupAtoms.map((local) => l2g.get(local));
      const rPositions = atomsAt(result, rGlobal);
      if (rPositions.length) {
        const rCentroid = addWireframeBox(viewer, rPositions, R_GROUP_COLOR, 0.12, 0.02);
        caHoverLabelRefs.push(
          viewer.addLabel('קבוצת R', {
            position: rCentroid, fontColor: R_GROUP_COLOR, fontSize: 10, backgroundColor: 'white', backgroundOpacity: 0.8, inFront: true,
          })
        );
      }
    }
  }

  // 6) קצוות חופשיים / כיווני המשך שלד
  if (isIsolated) {
    const aminoAtoms = atomsAt(result, [bb.n, ...bb.hOnN].map((l) => l2g.get(l)));
    if (aminoAtoms.length) {
      caHoverLabelRefs.push(
        viewer.addLabel('קבוצת אמינו (חופשית)', {
          position: centroid(aminoAtoms), fontColor: 'white', fontSize: 10, backgroundColor: 'steelblue', backgroundOpacity: 0.85, inFront: true,
        })
      );
    }
    const carboxylAtoms = atomsAt(result, [bb.c, bb.oDouble, bb.oHydroxylLeaving, bb.hOnHydroxyl].map((l) => l2g.get(l)));
    if (carboxylAtoms.length) {
      caHoverLabelRefs.push(
        viewer.addLabel('קבוצת קרבוקסיל (חופשית)', {
          position: centroid(carboxylAtoms), fontColor: 'white', fontSize: 10, backgroundColor: 'firebrick', backgroundOpacity: 0.85, inFront: true,
        })
      );
    }
  } else {
    if (!isFirst) {
      const prevRange = result.residueRanges[rangeIndex - 1];
      const prevBb = AMINO_ACIDS[prevRange.residueId].backbone;
      const prevCa = result.atoms[prevRange.localToGlobal.get(prevBb.ca) - 1];
      const dir = PeptideGeometry.vNorm(PeptideGeometry.vSub(prevCa, caPos));
      const tip = PeptideGeometry.vAdd(nPos, PeptideGeometry.vScale(dir, 1.2));
      addSpoke(viewer, nPos, tip, 'כיוון לקצה N', 'blue');
    }
    if (!isLast) {
      const nextRange = result.residueRanges[rangeIndex + 1];
      const nextBb = AMINO_ACIDS[nextRange.residueId].backbone;
      const nextCa = result.atoms[nextRange.localToGlobal.get(nextBb.ca) - 1];
      const dir = PeptideGeometry.vNorm(PeptideGeometry.vSub(nextCa, caPos));
      const tip = PeptideGeometry.vAdd(carbonylCPos, PeptideGeometry.vScale(dir, 1.2));
      addSpoke(viewer, carbonylCPos, tip, 'כיוון לקצה C', 'red');
    }
  }

  // 7) כרטיס מידע מאוחד — קצה מוצג רק אם באמת רלוונטי (לא באמצע שרשרת)
  let terminusText = null;
  if (isIsolated) terminusText = 'קצה N וגם קצה C (חומצה חופשית)';
  else if (isFirst) terminusText = 'קצה N';
  else if (isLast) terminusText = 'קצה C';

  showInfoCard({
    he: aa.he,
    en: aa.en,
    three: aa.three,
    position: (rangeIndex + 1) + ' מתוך ' + result.residueRanges.length,
    rFormula: rFormula,
    terminusText: terminusText,
  });

  try {
    viewer.render();
  } catch (err) {
    console.error('שגיאה ברינדור לאחר הדגשת Cα:', err);
  }
}

// לחיצה על מקום ריק בתוך המציג מבטלת את הבחירה ומחזירה את חלונית
// המידע והתצוגה למצב רגיל. פועל בשלב ה-capture כדי לרוץ לפני הטיפול
// הפנימי של 3Dmol באטום שנלחץ (שמפעיל applyCaHover מחדש דרך
// setClickable אם אכן נלחץ אטום) — לא אומת חזותית, ראו הסבר בשיחה.
function setupEmptyClickToDeselect() {
  const el = document.getElementById('molecule-viewer');
  if (!el) return;
  el.addEventListener(
    'click',
    () => {
      try { clearCaHover(getViewer()); } catch (err) { /* ignore */ }
    },
    true
  );
}

// ==================== מצב אינטראקציה: סיבוב מול הזזה חופשית ====================
// ברירת מחדל: מצב סיבוב (גרירה רגילה מסובבת — ההתנהגות המובנית של
// 3Dmol.js, לא נוגעים בה). Shift/לחצן ימני/מצב-הזזה גוברים תמיד ומזיזים
// את המולקולה במקום לסובב, על ידי יירוט האירוע לפני שהוא מגיע לטיפול
// הפנימי של 3Dmol (capture phase + stopPropagation). לא אומת חזותית —
// זה החלק הכי לא-ודאי בשינוי הזה, ראו הסבר בשיחה.
let interactionMode = 'rotate';
const activePointers = new Map(); // pointerId -> {x,y}
let panDragState = null; // {lastX, lastY} כשבפועל גוררים כדי להזיז

function setInteractionMode(mode) {
  interactionMode = mode;
  const rotateBtn = document.getElementById('mode-rotate-btn');
  const moveBtn = document.getElementById('mode-move-btn');
  if (rotateBtn) rotateBtn.setAttribute('aria-pressed', String(mode === 'rotate'));
  if (moveBtn) moveBtn.setAttribute('aria-pressed', String(mode === 'move'));
}

function shouldPanIntercept(evt) {
  if (activePointers.size > 1) return false; // מגע בשתי אצבעות: משאירים ל-3Dmol (הזזה+צביטה מובנים)
  if (evt.pointerType === 'touch') return interactionMode === 'move';
  if (evt.button === 2) return true; // לחצן ימני — תמיד מזיז
  if (evt.shiftKey) return true; // Shift — תמיד מזיז
  return interactionMode === 'move';
}

function setupCustomPanHandling() {
  const container = document.getElementById('molecule-viewer');
  if (!container) return;

  container.addEventListener('contextmenu', (e) => e.preventDefault());

  container.addEventListener(
    'pointerdown',
    (e) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePointers.size === 1 && shouldPanIntercept(e)) {
        panDragState = { lastX: e.clientX, lastY: e.clientY };
        e.stopPropagation();
      }
    },
    true
  );

  container.addEventListener(
    'pointermove',
    (e) => {
      if (activePointers.has(e.pointerId)) activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (panDragState && activePointers.size === 1) {
        const dx = e.clientX - panDragState.lastX;
        const dy = e.clientY - panDragState.lastY;
        panDragState.lastX = e.clientX;
        panDragState.lastY = e.clientY;
        try {
          getViewer().translate(dx, dy);
          getViewer().render();
        } catch (err) {
          /* ignore */
        }
        e.stopPropagation();
      }
    },
    true
  );

  const endPointer = (e) => {
    activePointers.delete(e.pointerId);
    if (activePointers.size === 0) panDragState = null;
  };
  container.addEventListener('pointerup', endPointer, true);
  container.addEventListener('pointercancel', endPointer, true);
  container.addEventListener('pointerleave', endPointer, true);
}

// ==================== הזזה (Pan) / זום עדין / מרכוז / מסך מלא ====================
function panView(dx, dy) {
  try {
    getViewer().translate(dx * 30, dy * 30);
    getViewer().render();
  } catch (err) {
    console.error('שגיאה בהזזת המולקולה:', err);
  }
}

function applyZoomLevelChange(newLevel) {
  const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newLevel));
  const delta = clamped - zoomLevel;
  if (delta === 0) return;
  try {
    // viewer.zoom() יחסי (מכפיל), לא מוחלט — ממירים את השינוי במחוון
    // ליחס הגדלה/הקטנה עדין (כל נקודת מחוון ≈ 3% שינוי).
    const factor = Math.pow(1.03, delta);
    getViewer().zoom(factor);
    getViewer().render();
    zoomLevel = clamped;
    const slider = document.getElementById('zoom-slider');
    if (slider) slider.value = String(zoomLevel);
  } catch (err) {
    console.error('שגיאה בשינוי הזום:', err);
  }
}

function zoomStep(direction) {
  applyZoomLevelChange(zoomLevel + direction * ZOOM_STEP);
}

function setZoomFromSlider(value) {
  applyZoomLevelChange(parseInt(value, 10));
}

function centerView() {
  try {
    getViewer().zoomTo();
    getViewer().render();
    zoomLevel = 50;
    const slider = document.getElementById('zoom-slider');
    if (slider) slider.value = '50';
  } catch (err) {
    console.error('שגיאה במרכוז המולקולה:', err);
  }
}

function fitToScreen() {
  centerView();
}

function toggleFullscreen() {
  const el = document.querySelector('.viewer-pane');
  if (!el) return;
  const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
  try {
    if (!isFullscreen) {
      const request = el.requestFullscreen || el.webkitRequestFullscreen;
      if (request) request.call(el);
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
    }
  } catch (err) {
    console.error('Fullscreen API לא זמין בדפדפן הזה:', err);
  }
}

function initFullscreenButtonVisibility() {
  const btn = document.getElementById('btn-fullscreen');
  if (!btn) return;
  const supported = !!(
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    (document.documentElement && (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen))
  );
  // ב-iPhone Safari ה-Fullscreen API בדרך כלל לא נתמך לאלמנט שרירותי —
  // במקרה כזה מסתירים את הכפתור והפריסה הרספונסיבית כבר ממלאת את המסך.
  if (!supported) btn.hidden = true;
}

function handleViewerResize() {
  if (moleculeViewer) {
    try {
      moleculeViewer.resize();
      moleculeViewer.render();
    } catch (err) {
      console.error('שגיאה בהתאמת גודל המציג לחלון:', err);
    }
  }
}

// ---------- טקסט/מקרא ----------
function buildChainCaptionHtml(sequenceIds) {
  const names = sequenceIds.map((id) => AMINO_ACIDS[id].he).join(' – ');
  const sources = Array.from(new Set(sequenceIds))
    .map((id) => {
      const aa = AMINO_ACIDS[id];
      return '<a href="' + aa.pubchemUrl + '" target="_blank" rel="noopener">' + aa.he + ' (CID ' + aa.cid + ')</a>';
    })
    .join(', ');
  return '<strong>שרשרת:</strong> ' + names + '<br>מקורות מבנה: ' + sources;
}

function setMoleculeCaption(content) {
  const el = document.getElementById('molecule-caption');
  if (el) el.innerHTML = content;
}

function setDisclaimerVisible(visible) {
  const el = document.getElementById('peptide-disclaimer');
  if (el) el.hidden = !visible;
}

function showChemistryError(message) {
  const el = document.getElementById('chemistry-error');
  if (el) {
    el.textContent = message;
    el.hidden = false;
  }
}

function clearChemistryError() {
  const el = document.getElementById('chemistry-error');
  if (el) {
    el.textContent = '';
    el.hidden = true;
  }
}

// ==================== מקרא צבעים וסימונים (מתקפל, דינמי) ====================
// swatch נגזר מ-CPK_HEX (cpk-colors-data.js) — מקור האמת היחיד לצבעי
// CPK בכל הפרויקט (גם GLB/USDZ דרך tools/glb-export.mjs קורא אותו
// קובץ). אימתנו בפועל שגם הסכמה המובנית "Jmol" של 3Dmol.js עצמו (המשמשת
// בפועל לצביעת האטומים ב-setStyle) שווה מספרית בדיוק לאותם ערכים —
// זהו התקן ה-CPK/Jmol המוסכם, לא צירוף מקרים.
const CPK_COLOR_TABLE = {
  C: { swatch: '#' + CPK_HEX.C, label: 'פחמן (C)' },
  H: { swatch: '#' + CPK_HEX.H, label: 'מימן (H)', border: '#999' },
  O: { swatch: '#' + CPK_HEX.O, label: 'חמצן (O)' },
  N: { swatch: '#' + CPK_HEX.N, label: 'חנקן (N)' },
  S: { swatch: '#' + CPK_HEX.S, label: 'גופרית (S)', border: '#c9c900' },
};
const CPK_FALLBACK_COLORS = ['#ff69b4', '#8a2be2', '#00ced1', '#ffa500'];

function cpkColorFor(element) {
  if (CPK_COLOR_TABLE[element]) return CPK_COLOR_TABLE[element];
  // יסוד לא-מוכר מראש: מוסיפים אוטומטית למקרא בצבע כללי עקבי (לא CPK רשמי,
  // אך עדיף על השמטה שקטה של יסוד שבאמת מוצג במולקולה).
  const idx = Object.keys(CPK_COLOR_TABLE).length % CPK_FALLBACK_COLORS.length;
  return { swatch: CPK_FALLBACK_COLORS[idx], label: element + ' (יסוד נוסף)' };
}

function renderCpkLegend(result) {
  const container = document.getElementById('legend-cpk-list');
  if (!container) return;
  const elements = result && result.atoms ? Array.from(new Set(result.atoms.map((a) => a.element))) : [];
  container.innerHTML = elements
    .map((el) => {
      const info = cpkColorFor(el);
      const borderStyle = info.border ? 'border-color:' + info.border + ';' : '';
      return (
        '<span class="legend-item"><span class="legend-dot" style="background:' + info.swatch + ';' + borderStyle + '"></span>' +
        info.label + '</span>'
      );
    })
    .join('');
}

// ---------- מקרא: כפתור + חלונית (סגור כברירת מחדל, בכל גודל מסך) ----------
function openLegend() {
  const panel = document.getElementById('legend-panel');
  const btn = document.getElementById('legend-button');
  if (panel) panel.hidden = false;
  if (btn) btn.setAttribute('aria-expanded', 'true');
}

function closeLegend() {
  const panel = document.getElementById('legend-panel');
  const btn = document.getElementById('legend-button');
  if (panel) panel.hidden = true;
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function toggleLegend() {
  const panel = document.getElementById('legend-panel');
  if (!panel) return;
  if (panel.hidden) openLegend();
  else closeLegend();
}

function setupLegendOutsideClose() {
  document.addEventListener(
    'click',
    (e) => {
      const panel = document.getElementById('legend-panel');
      const btn = document.getElementById('legend-button');
      if (!panel || panel.hidden) return;
      if (panel.contains(e.target) || (btn && btn.contains(e.target))) return;
      closeLegend();
    },
    true
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLegend();
  });
}

// ---------- אתחול: התאמת גודל לחלון, כפתור מסך מלא, ביטול בחירה בלחיצה ריקה ----------
document.addEventListener('DOMContentLoaded', () => {
  setupEmptyClickToDeselect();
  initFullscreenButtonVisibility();
  setupCustomPanHandling();
  setupLegendOutsideClose();
});

window.addEventListener('resize', handleViewerResize);
window.addEventListener('orientationchange', () => {
  // עיכוב קצר כדי לתת לדפדפן (במיוחד ב-iOS) לעדכן את מידות ה-viewport
  // בפועל לפני שקוראים ל-resize של 3Dmol.
  setTimeout(handleViewerResize, 300);
});
document.addEventListener('fullscreenchange', handleViewerResize);
document.addEventListener('webkitfullscreenchange', handleViewerResize);
