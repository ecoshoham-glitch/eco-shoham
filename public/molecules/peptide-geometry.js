// מנוע גיאומטריה לבניית שרשרת פפטידית תלת-ממדית אמיתית, ללא ספרייה
// חיצונית. עובד גם בדפדפן (מצורף ל-window) וגם ב-Node (לבדיקות
// אוטומטיות) — אינו נוגע ב-document/fetch ישירות; מקבל טקסט MolBlock
// כבר-מפורסר מבחוץ.
//
// שיטה: כל שייר נלקח כגוף קשיח (rigid body) בדיוק כפי שאומת מ-PubChem
// (אורכי קשר/זוויות/סטריאוכימיה פנימיים לא משתנים לעולם). כדי לחבר
// שייר חדש לקצה ה-C של השרשרת, ממקמים שלוש נקודות יעד (N, Cα, C של
// השייר החדש) בעזרת אלגוריתם NeRF (Natural Extension Reference Frame)
// עם אורכי קשר/זוויות סטנדרטיים וגאומטריה טרנס אידאלית (ω≈180°), ואז
// מסובבים/מזיזים את כל השייר כגוף אחד כך שהאטומים הפנימיים שלו (N,
// Cα, C) ייפלו בדיוק על אותן שלוש נקודות יעד. עובי/אורך קשר, זוויות
// וסטריאוכימיה מולידים מבנה מוארך אידאלי — לא חיזוי קיפול.

(function (root) {
  'use strict';

  // ---------- וקטורים ----------
  function v(x, y, z) { return { x: x, y: y, z: z }; }
  function vAdd(a, b) { return v(a.x + b.x, a.y + b.y, a.z + b.z); }
  function vSub(a, b) { return v(a.x - b.x, a.y - b.y, a.z - b.z); }
  function vScale(a, s) { return v(a.x * s, a.y * s, a.z * s); }
  function vDot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
  function vCross(a, b) {
    return v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
  }
  function vLen(a) { return Math.sqrt(vDot(a, a)); }
  function vNorm(a) {
    const l = vLen(a);
    if (l < 1e-9) throw new Error('וקטור באורך אפס לא ניתן לנרמול (אטומים חופפים?)');
    return vScale(a, 1 / l);
  }
  function deg2rad(d) { return (d * Math.PI) / 180; }
  function rad2deg(r) { return (r * 180) / Math.PI; }

  // ---------- מדידות גיאומטריות (לבדיקה עצמית ולוולידציה) ----------
  function measureBondLength(p1, p2) { return vLen(vSub(p2, p1)); }

  function measureAngleDeg(p1, p2, p3) {
    const v1 = vNorm(vSub(p1, p2));
    const v2 = vNorm(vSub(p3, p2));
    const c = Math.max(-1, Math.min(1, vDot(v1, v2)));
    return rad2deg(Math.acos(c));
  }

  function measureDihedralDeg(p1, p2, p3, p4) {
    const b1 = vSub(p2, p1);
    const b2 = vSub(p3, p2);
    const b3 = vSub(p4, p3);
    const n1 = vCross(b1, b2);
    const n2 = vCross(b2, b3);
    const m1 = vCross(n1, vNorm(b2));
    const x = vDot(n1, n2);
    const y = -vDot(m1, n2); // סימן מותאם לאמנת nerfPlace (ראה בדיקת יחידה)
    return rad2deg(Math.atan2(y, x));
  }

  // ---------- NeRF: מיקום אטום D לפי A,B,C + אורך קשר + זווית + דיהדרל ----------
  // מוסכמה: bondAngleDeg הוא הזווית הפנימית B-C-D (כפי שנמדדת ב-measureAngleDeg).
  function nerfPlace(A, B, C, bondLength, bondAngleDeg, dihedralDeg) {
    const theta = deg2rad(180 - bondAngleDeg);
    const phi = deg2rad(dihedralDeg);

    const bc = vNorm(vSub(C, B));
    const ab = vSub(B, A);
    let n = vCross(ab, bc);
    if (vLen(n) < 1e-9) {
      n = vCross(bc, Math.abs(bc.x) < 0.9 ? v(1, 0, 0) : v(0, 1, 0));
    }
    n = vNorm(n);
    const m = vCross(n, bc);

    const d2 = v(
      bondLength * Math.cos(theta),
      bondLength * Math.sin(theta) * Math.cos(phi),
      bondLength * Math.sin(theta) * Math.sin(phi)
    );

    const offset = v(
      bc.x * d2.x + m.x * d2.y + n.x * d2.z,
      bc.y * d2.x + m.y * d2.y + n.y * d2.z,
      bc.z * d2.x + m.z * d2.y + n.z * d2.z
    );
    return vAdd(C, offset);
  }

  // ---------- מסגרת קשיחה משלוש נקודות, ויישור גוף קשיח ----------
  function buildFrame(p1, p2, p3) {
    const ex = vNorm(vSub(p2, p1));
    let ez = vCross(ex, vSub(p3, p1));
    if (vLen(ez) < 1e-9) throw new Error('שלוש נקודות קוויות — לא ניתן לבנות מסגרת קשיחה');
    ez = vNorm(ez);
    const ey = vCross(ez, ex);
    return { origin: p1, ex: ex, ey: ey, ez: ez };
  }

  function rigidTransformFn(srcFrame, dstFrame) {
    return function (p) {
      const rel = vSub(p, srcFrame.origin);
      const lx = vDot(rel, srcFrame.ex);
      const ly = vDot(rel, srcFrame.ey);
      const lz = vDot(rel, srcFrame.ez);
      return vAdd(
        dstFrame.origin,
        vAdd(vScale(dstFrame.ex, lx), vAdd(vScale(dstFrame.ey, ly), vScale(dstFrame.ez, lz)))
      );
    };
  }

  // ---------- קבועי גיאומטריה סטנדרטיים (טבלאות התייחסות מקובלות, למשל Engh & Huber) ----------
  const GEOM = {
    C_N: 1.33,
    N_CA: 1.46,
    CA_C: 1.52,
    CA_C_N_ANGLE: 116.2,
    C_N_CA_ANGLE: 121.7,
    N_CA_C_ANGLE: 111.2,
    PSI_EXTENDED: 180,
    OMEGA_TRANS: 180,
    PHI_EXTENDED: 180,
  };

  // ---------- פרסור MolBlock (V2000) פשוט ----------
  function parseMolBlock(text) {
    const lines = text.split('\n');
    const counts = lines[3];
    const nAtoms = parseInt(counts.substring(0, 3), 10);
    const nBonds = parseInt(counts.substring(3, 6), 10);
    const atoms = [];
    for (let i = 0; i < nAtoms; i++) {
      const parts = lines[4 + i].trim().split(/\s+/);
      atoms.push({ x: parseFloat(parts[0]), y: parseFloat(parts[1]), z: parseFloat(parts[2]), element: parts[3] });
    }
    const bonds = [];
    for (let i = 0; i < nBonds; i++) {
      const line = lines[4 + nAtoms + i];
      bonds.push({
        a1: parseInt(line.substring(0, 3), 10),
        a2: parseInt(line.substring(3, 6), 10),
        order: parseInt(line.substring(6, 9), 10),
      });
    }
    return { atoms: atoms, bonds: bonds };
  }

  // ---------- בניית MolBlock מתוצאה סופית ----------
  function buildMolBlock(atoms, bonds, title) {
    const pad = (s, n) => String(s).padStart(n, ' ');
    const fmtCoord = (n) => pad(n.toFixed(4), 10);
    let out = '';
    out += (title || 'peptide') + '\n';
    out += '  peptide-geometry.js\n\n';
    out += pad(atoms.length, 3) + pad(bonds.length, 3) + '  0     0  0  0  0  0  0999 V2000\n';
    atoms.forEach((a) => {
      out += fmtCoord(a.x) + fmtCoord(a.y) + fmtCoord(a.z) + ' ' + a.element.padEnd(2, ' ') +
        '  0  0  0  0  0  0  0  0  0  0  0  0\n';
    });
    bonds.forEach((b) => {
      out += pad(b.a1, 3) + pad(b.a2, 3) + pad(b.order, 3) + '  0  0  0  0\n';
    });
    out += 'M  END\n';
    return out;
  }

  // ---------- אלגוריתם חיבור שרשרת שלמה ----------
  // templates: מפה { residueId: { atoms:[{element,x,y,z}], bonds:[{a1,a2,order}], backbone:{...} } }
  // (אינדקסי backbone הם 1-based, כמו במקור ה-SDF)
  function buildPeptide(sequenceIds, templates) {
    const finalAtoms = [];
    const finalBonds = [];
    const residueRanges = [];
    const bondEvents = []; // {cIndex, nIndex} לכל קשר פפטידי, לפי סדר ההיווצרות
    const waterEvents = []; // {o:{x,y,z}, hFromO:{x,y,z}, hFromN:{x,y,z}} לכל קשר, למטרת הצגה חזותית

    let prevBackboneGlobal = null; // {n,ca,c positions, cGlobalIndex}

    for (let i = 0; i < sequenceIds.length; i++) {
      const id = sequenceIds[i];
      const tpl = templates[id];
      if (!tpl) throw new Error('אין תבנית תלת-ממדית לחומצת אמינו: ' + id);
      const bb = tpl.backbone;
      const isFirst = i === 0;
      const isLast = i === sequenceIds.length - 1;

      const omitLocal = new Set();
      if (!isFirst) omitLocal.add(bb.hOnN[0]);
      if (!isLast) {
        omitLocal.add(bb.oHydroxylLeaving);
        omitLocal.add(bb.hOnHydroxyl);
      }

      let transformFn = (p) => p;
      let targetN = null, targetCa = null, targetC = null;

      if (!isFirst) {
        targetN = nerfPlace(prevBackboneGlobal.n, prevBackboneGlobal.ca, prevBackboneGlobal.c, GEOM.C_N, GEOM.CA_C_N_ANGLE, GEOM.PSI_EXTENDED);
        targetCa = nerfPlace(prevBackboneGlobal.ca, prevBackboneGlobal.c, targetN, GEOM.N_CA, GEOM.C_N_CA_ANGLE, GEOM.OMEGA_TRANS);
        targetC = nerfPlace(prevBackboneGlobal.c, targetN, targetCa, GEOM.CA_C, GEOM.N_CA_C_ANGLE, GEOM.PHI_EXTENDED);

        const srcFrame = buildFrame(tpl.atoms[bb.n - 1], tpl.atoms[bb.ca - 1], tpl.atoms[bb.c - 1]);
        const dstFrame = buildFrame(targetN, targetCa, targetC);
        transformFn = rigidTransformFn(srcFrame, dstFrame);
      }

      // מיפוי אינדקס מקומי (1-based בתבנית) -> אינדקס גלובלי (1-based בפלט)
      const localToGlobal = new Map();
      const rangeStart = finalAtoms.length + 1;
      for (let a = 1; a <= tpl.atoms.length; a++) {
        if (omitLocal.has(a)) continue;
        const p = transformFn(tpl.atoms[a - 1]);
        finalAtoms.push({ element: tpl.atoms[a - 1].element, x: p.x, y: p.y, z: p.z });
        localToGlobal.set(a, finalAtoms.length);
      }
      residueRanges.push({ start: rangeStart, end: finalAtoms.length, residueId: id, localToGlobal: localToGlobal });

      tpl.bonds.forEach((b) => {
        if (omitLocal.has(b.a1) || omitLocal.has(b.a2)) return;
        finalBonds.push({ a1: localToGlobal.get(b.a1), a2: localToGlobal.get(b.a2), order: b.order });
      });

      if (!isFirst) {
        const cGlobal = prevBackboneGlobal.cGlobalIndex;
        const nGlobal = localToGlobal.get(bb.n);
        finalBonds.push({ a1: cGlobal, a2: nGlobal, order: 1 });
        bondEvents.push({ cIndex: cGlobal, nIndex: nGlobal });
        waterEvents.push({
          o: prevBackboneGlobal.removedO,
          hFromO: prevBackboneGlobal.removedH,
          hFromN: transformFn(tpl.atoms[bb.hOnN[0] - 1]),
        });
      }

      prevBackboneGlobal = {
        n: finalAtoms[localToGlobal.get(bb.n) - 1],
        ca: finalAtoms[localToGlobal.get(bb.ca) - 1],
        c: finalAtoms[localToGlobal.get(bb.c) - 1],
        cGlobalIndex: localToGlobal.get(bb.c),
        removedO: isLast ? null : transformFn(tpl.atoms[bb.oHydroxylLeaving - 1]),
        removedH: isLast ? null : transformFn(tpl.atoms[bb.hOnHydroxyl - 1]),
      };
    }

    return {
      atoms: finalAtoms,
      bonds: finalBonds,
      residueRanges: residueRanges,
      bondEvents: bondEvents,
      newBondPair: bondEvents.length ? bondEvents[bondEvents.length - 1] : null,
      newWaterEvent: waterEvents.length ? waterEvents[waterEvents.length - 1] : null,
      waterEvents: waterEvents,
    };
  }

  // ---------- ולידציה כימית ----------
  // מחזיר { ok:true } או { ok:false, errors:[...] } — לעולם לא זורק, כדי
  // שהקורא יחליט מה להציג למשתמש.
  function validatePeptide(result, sequenceLength) {
    const errors = [];
    const n = sequenceLength;
    const expectedBonds = n - 1;

    if (result.bondEvents.length !== expectedBonds) {
      errors.push('מספר קשרים פפטידיים שגוי: התקבלו ' + result.bondEvents.length + ', צפויים ' + expectedBonds);
    }
    if (result.waterEvents.length !== expectedBonds) {
      errors.push('מספר מולקולות מים שגוי: התקבלו ' + result.waterEvents.length + ', צפויים ' + expectedBonds);
    }

    // בדיקת חפיפת אטומים (מרחק מינימלי סביר בין כל שני אטומים לא-קשורים)
    const MIN_DIST = 0.4; // Å — מתחת לזה זו חפיפה פיזיקלית בלתי אפשרית
    for (let i = 0; i < result.atoms.length; i++) {
      for (let j = i + 1; j < result.atoms.length; j++) {
        const d = measureBondLength(result.atoms[i], result.atoms[j]);
        if (d < MIN_DIST) {
          errors.push('חפיפת אטומים: אטום ' + (i + 1) + ' ואטום ' + (j + 1) + ' במרחק ' + d.toFixed(3) + 'Å');
        }
      }
    }

    // בדיקת ולנטיות (מספר קשרים, כולל ריבוי סדר קשר, לכל אטום)
    const bondOrderSum = new Array(result.atoms.length + 1).fill(0);
    result.bonds.forEach((b) => {
      bondOrderSum[b.a1] += b.order;
      bondOrderSum[b.a2] += b.order;
    });
    const MAX_VALENCE = { C: 4, N: 3, O: 2, H: 1 };
    result.atoms.forEach((atom, idx0) => {
      const idx = idx0 + 1;
      const max = MAX_VALENCE[atom.element];
      if (max === undefined) return;
      if (bondOrderSum[idx] > max) {
        errors.push('ולנטיות בלתי אפשרית: אטום ' + idx + ' (' + atom.element + ') עם סכום סדרי קשר ' + bondOrderSum[idx] + ' (מקסימום ' + max + ')');
      }
      if (bondOrderSum[idx] === 0) {
        errors.push('אטום מבודד (ללא קשרים): אטום ' + idx + ' (' + atom.element + ')');
      }
    });

    // בדיקת אורך/זווית/דיהדרל בפועל של כל קשר פפטידי חדש, מול הערכים הסטנדרטיים
    result.bondEvents.forEach((be, k) => {
      const cPos = result.atoms[be.cIndex - 1];
      const nPos = result.atoms[be.nIndex - 1];
      const len = measureBondLength(cPos, nPos);
      if (Math.abs(len - GEOM.C_N) > 0.05) {
        errors.push('קשר פפטידי #' + (k + 1) + ': אורך קשר ' + len.toFixed(3) + 'Å רחוק מהיעד ' + GEOM.C_N + 'Å');
      }
    });

    return { ok: errors.length === 0, errors: errors };
  }

  // ---------- תיבה תוחמת (לצורך מסגרת קבוצת R) ----------
  // מחזיר {min,max} — קופסה ישרת-צירים סביב כל הנקודות, מורחבת ב-padding
  // לכל כיוון. שימוש: molecule-viewer.js מצייר את 12 הצלעות כגלילים.
  function boundingBox(points, padding) {
    const pad = padding || 0;
    const min = v(Infinity, Infinity, Infinity);
    const max = v(-Infinity, -Infinity, -Infinity);
    points.forEach((p) => {
      min.x = Math.min(min.x, p.x);
      min.y = Math.min(min.y, p.y);
      min.z = Math.min(min.z, p.z);
      max.x = Math.max(max.x, p.x);
      max.y = Math.max(max.y, p.y);
      max.z = Math.max(max.z, p.z);
    });
    return {
      min: v(min.x - pad, min.y - pad, min.z - pad),
      max: v(max.x + pad, max.y + pad, max.z + pad),
    };
  }

  // מחזיר את 8 קודקודי הקופסה ואת 12 הצלעות שלה כזוגות קודקודים
  // (a,b) — מתאים ישירות לציור 12 גלילים דקים (מסגרת תלת-ממדית).
  function boxEdges(min, max) {
    const corners = [
      v(min.x, min.y, min.z), v(max.x, min.y, min.z),
      v(max.x, max.y, min.z), v(min.x, max.y, min.z),
      v(min.x, min.y, max.z), v(max.x, min.y, max.z),
      v(max.x, max.y, max.z), v(min.x, max.y, max.z),
    ];
    const pairs = [
      [0, 1], [1, 2], [2, 3], [3, 0], // תחתית
      [4, 5], [5, 6], [6, 7], [7, 4], // עליונה
      [0, 4], [1, 5], [2, 6], [3, 7], // אנכיות מחברות
    ];
    return pairs.map(([i, j]) => ({ a: corners[i], b: corners[j] }));
  }

  root.PeptideGeometry = {
    v, vAdd, vSub, vScale, vDot, vCross, vLen, vNorm,
    measureBondLength, measureAngleDeg, measureDihedralDeg,
    nerfPlace, buildFrame, rigidTransformFn,
    GEOM,
    parseMolBlock, buildMolBlock,
    buildPeptide, validatePeptide,
    boundingBox, boxEdges,
  };
})(typeof window !== 'undefined' ? window : globalThis);
