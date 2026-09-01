// טבלת חומצות אמינו לפיילוט (3 חומצות בלבד בשלב זה).
// כדי להוסיף חומצת אמינו חדשה בעתיד — מוסיפים כאן שורה נוספת, מוסיפים
// כפתור תואם ב-index.html, שומרים קובץ SDF תואם תחת molecules/ (מ-
// PubChem, עם ציטוט CID), ומזהים ידנית את 6 אינדקסי אטומי השלד
// (backbone) מתוך טבלת הקשרים בקובץ ה-SDF — בדיוק כפי שנעשה כאן.
//
// שדה backbone (כל האינדקסים הם 1-based, כמו במקור קובץ ה-SDF):
//   n              - אטום החנקן של קבוצת האמינו
//   hOnN           - שני אטומי המימן על החנקן (במצב חופשי); בעת חיבור
//                    לשרשרת (כשהשייר אינו הראשון) מוסר hOnN[0] בלבד.
//   ca             - פחמן אלפא (Cα)
//   c              - פחמן הקרבוקסיל (פחמן הקרבוניל)
//   oDouble        - החמצן הכפול-קשור (C=O) — נשאר תמיד
//   oHydroxylLeaving - החמצן ההידרוקסילי של הקרבוקסיל (C-OH) — מוסר
//                    כשהשייר אינו האחרון בשרשרת (יוצר את הקשר הפפטידי)
//   hOnHydroxyl    - המימן על אותו חמצן הידרוקסילי — מוסר יחד איתו
// כל שאר האטומים (שרשרת צדדית, H על Cα וכו') לא נוגעים בהם כלל —
// נשארים כפי שהם בתבנית המאומתת של PubChem, ורק מוזזים/מסובבים יחד
// כגוף קשיח אחד (ראו peptide-geometry.js).
// שדה sideChain (לצורך תוויות לימודיות/הדגשת קבוצת R בלבד — אינו
// משפיע על peptide-geometry.js כלל):
//   caH        - אטום המימן ה"כללי" על Cα (אינו חלק מ-R; כל חומצת
//                אמינו יש לה בדיוק H כללי אחד כזה על ה-Cα)
//   rGroupAtoms - אינדקסים (1-based) של כל אטומי שרשרת הצד (R) —
//                לגליצין זהו H יחיד (השני מבין שני ה-H של Cα, לפי
//                ההגדרה הרגילה R=H); לאלנין CH₃; לסרין CH₂OH.
//                מאומת ידנית מטבלת הקשרים, באותה שיטה כמו backbone.
//   rFormula   - נוסחת ה-R להצגה בתווית/בלחיצה
// שדות glb/usdz: נתיבים (יחסית לתיקיית web-app) לקובצי AR סטטיים.
// glb מופק אופליין ע"י tools/build-ar-assets.mjs. usdz מופק ע"י
// tools/build-usdz-assets.mjs (Blender headless, לא usdzconvert) מתוך
// אותו GLB בדיוק, עם אימות גיאומטרי+צבעים אוטומטי לפני/אחרי ההמרה.
// usdz **חייב** להישאר null אם הקובץ לא קיים בפועל בדיסק: ar-viewer.js
// קורא `if (aa.usdz)` כדי להחליט אם להגדיר ios-src ל-<model-viewer>,
// ומחרוזת נתיב ל-usdz שלא קיים (404) חוסמת את מנגנון היצירה האוטומטית
// של Quick Look מה-GLB במקום לאפשר לו לפעול — שוברת AR ב-iPhone.
// כשמוסיפים חומצה חדשה: מריצים build-ar-assets.mjs ואז build-usdz-
// assets.mjs, אין צורך בשינוי קוד נוסף בשום מקום אחר.
const AMINO_ACIDS = {
  gly: {
    id: 'gly',
    he: 'גליצין',
    en: 'Glycine',
    three: 'Gly',
    one: 'G',
    sdf: 'molecules/glycine.sdf',
    glb: 'molecules/glycine.glb',
    usdz: 'molecules/glycine.usdz',
    cid: 750,
    pubchemUrl: 'https://pubchem.ncbi.nlm.nih.gov/compound/750',
    backbone: { n: 3, hOnN: [8, 9], ca: 4, c: 5, oDouble: 2, oHydroxylLeaving: 1, hOnHydroxyl: 10 },
    // גליצין: Cα(4) קשור ל-H(6) ול-H(7) — שני H זהים כימית; לפי ההגדרה
    // "R=H" בוחרים אחד מהם (7) כ"קבוצת R" והשני (6) נשאר H כללי של Cα.
    sideChain: { caH: 6, rGroupAtoms: [7], rFormula: 'H' },
  },
  ala: {
    id: 'ala',
    he: 'אלנין',
    en: 'Alanine',
    three: 'Ala',
    one: 'A',
    sdf: 'molecules/alanine.sdf',
    glb: 'molecules/alanine.glb',
    usdz: 'molecules/alanine.usdz',
    cid: 5950,
    pubchemUrl: 'https://pubchem.ncbi.nlm.nih.gov/compound/5950',
    backbone: { n: 3, hOnN: [11, 12], ca: 4, c: 6, oDouble: 2, oHydroxylLeaving: 1, hOnHydroxyl: 13 },
    // Cα(4) קשור ל-H(7, כללי), ל-N(3), ל-C-קרבוניל(6), ול-Cβ(5). קבוצת
    // R = Cβ(5) + שלושת ה-H שלו (8,9,10) = CH₃.
    sideChain: { caH: 7, rGroupAtoms: [5, 8, 9, 10], rFormula: 'CH₃' },
  },
  ser: {
    id: 'ser',
    he: 'סרין',
    en: 'Serine',
    three: 'Ser',
    one: 'S',
    sdf: 'molecules/serine.sdf',
    glb: 'molecules/serine.glb',
    usdz: 'molecules/serine.usdz',
    cid: 5951,
    pubchemUrl: 'https://pubchem.ncbi.nlm.nih.gov/compound/5951',
    // שימו לב: יש כאן שני חמצני הידרוקסיל בקובץ (אחד בשרשרת הצד, אחד
    // בקרבוקסיל). אומת מטבלת הקשרים בפועל: אטום 2 קשור לאטום 7 (הפחמן
    // הקרבוקסילי) ולאטום 14 (H) — זהו ה-OH הקרבוקסילי הנכון. אטום 1
    // קשור לאטום 6 (Cβ, שרשרת הצד) ולאטום 13 — זהו OH של שרשרת הצד,
    // ואסור להסיר אותו.
    backbone: { n: 4, hOnN: [11, 12], ca: 5, c: 7, oDouble: 3, oHydroxylLeaving: 2, hOnHydroxyl: 14 },
    // Cα(5) קשור ל-H(8, כללי), ל-N(4), ל-C-קרבוניל(7), ול-Cβ(6). קבוצת
    // R = Cβ(6) + 2×H עליו (9,10) + O(1, הידרוקסיל של שרשרת הצד) +
    // H(13, על אותו חמצן) = CH₂OH.
    sideChain: { caH: 8, rGroupAtoms: [6, 9, 10, 1, 13], rFormula: 'CH₂OH' },
  },
  phe: {
    id: 'phe',
    he: 'פנילאלנין',
    en: 'Phenylalanine',
    three: 'Phe',
    one: 'F',
    sdf: 'molecules/phenylalanine.sdf',
    glb: 'molecules/phenylalanine.glb',
    usdz: 'molecules/phenylalanine.usdz',
    cid: 6140,
    pubchemUrl: 'https://pubchem.ncbi.nlm.nih.gov/compound/6140',
    // אומת מטבלת הקשרים בפועל של הקובץ (23 אטומים, 23 קשרים):
    // N(3)->{Cα(5),H(18),H(19)}; Cα(5)->{N(3),C(9),Cβ(4),H(15)};
    // C-קרבוניל(9)->{O(1),O(2),Cα(5)}; O(1)->{C(9),H(23)} (הידרוקסיל
    // קרבוקסילי); O(2)->{C(9)} בלבד (קשר כפול, ללא H).
    backbone: { n: 3, hOnN: [18, 19], ca: 5, c: 9, oDouble: 2, oHydroxylLeaving: 1, hOnHydroxyl: 23 },
    // קבוצת R = בנזיל: Cβ(4)+2×H(13,14) מחובר לטבעת ארומטית באטום
    // ה-ipso (6, ללא H), דרך 6 פחמנים (6,7,8,10,11,12) ו-5 מימנים
    // טבעתיים (16,17,20,21,22) — האטום ה-ipso (6) הוא היחיד בטבעת בלי H.
    sideChain: { caH: 15, rGroupAtoms: [4, 13, 14, 6, 7, 16, 8, 17, 10, 20, 11, 21, 12, 22], rFormula: 'CH₂C₆H₅' },
  },
};

// ==================== מיפוי קוד URL -> מזהה חומצת אמינו פנימי ====================
// טבלה זו משמשת את initFromUrl() ב-app.js כדי לבחור אוטומטית חומצת
// אמינו כשתג NFC (או קישור ידני) פותח את העמוד עם ?aa=<קוד>, למשל
// https://example.netlify.app/?aa=phe — הקוד מנורמל לאותיות קטנות לפני
// חיפוש בטבלה. שלב זה תומך רק ב-4 החומצות שיש להן נתונים מלאים
// (SDF+backbone+sideChain+GLB); שאר 16 הקודים התלת-אותיים התקניים
// מופיעים למטה כהערה בלבד — כדי להוסיף חומצה יש להוסיף גם ערך מלא
// ב-AMINO_ACIDS למעלה (כולל SDF מאומת מ-PubChem) וגם שורה כאן.
// קודים תקניים ל-20 חומצות האמינו (למעקב עתידי, לא כולם ממומשים):
// Ala Arg Asn Asp Cys Gln Glu Gly His Ile Leu Lys Met Phe Pro Ser Thr Trp Tyr Val
const AMINO_ACID_URL_CODES = {
  gly: 'gly',
  ala: 'ala',
  ser: 'ser',
  phe: 'phe',
};
