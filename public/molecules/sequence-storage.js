// שמירת הרצף הנוכחי ב-localStorage — כדי ששרשרת שנבנתה (ידנית, דרך
// ?aa=/?sequence=, או דרך סריקת QR בתוך האתר) תשרוד רענון דף, וגם את
// המקרה שבו המערכת הרגה את הטאב ברקע בזמן ש-Quick Look/Scene Viewer
// פתוחים (אז חזרה לטאב היא בפועל טעינה מחדש מלאה, לא bfcache). תלוי
// ב-AMINO_ACIDS (amino-acids-data.js) — חייב להיטען אחריו.
const SEQUENCE_STORAGE_KEY = 'proteinArSequence';

// אורך מרבי סביר לרצף פרוטוטייפ חינוכי. לא נגזר ממגבלה כימית אמיתית של
// PeptideGeometry (זו יכולה לבנות רצפים ארוכים בהרבה) — המגבלה כאן היא
// כדי למנוע רצף אבסורדי-ארוך (למשל לולאת סריקה תקועה) שבין כה לא ניתן
// להציג ב-AR ממילא, כי אין pipeline שמייצר GLB/USDZ לרצפים כלליים
// (ראו ההערה המפורטת ב-ar-sequences-data.js — רק רצפים מוגדרים-מראש).
const MAX_SEQUENCE_LENGTH = 12;

function isKnownAminoAcidId(id) {
  return typeof id === 'string' && typeof AMINO_ACIDS !== 'undefined' && !!AMINO_ACIDS[id];
}

// שומרת רצף תקין בלבד — מזהים לא מוכרים (למשל אחרי localStorage שנערך
// ידנית, או קוד עתידי לחומצה שעוד לא נוספה ל-AMINO_ACIDS) מסוננים לפני
// השמירה, לא רק לפני הטעינה, כדי שלעולם לא יישמר מצב פגום.
function saveSequenceToStorage(seq) {
  try {
    if (!Array.isArray(seq)) return;
    const clean = seq.filter(isKnownAminoAcidId).slice(0, MAX_SEQUENCE_LENGTH);
    localStorage.setItem(SEQUENCE_STORAGE_KEY, JSON.stringify(clean));
  } catch (err) {
    // localStorage עלול לזרוק (מצב פרטי בספארי, quota מלא וכו') — לא קריטי,
    // האפליקציה ממשיכה לעבוד מהזיכרון בלבד, פשוט בלי שרידות בין רענונים.
  }
}

// טוענת רצף שמור, ומסננת (לא דוחה את כל הרצף) ערכים לא-מוכרים/לא-תקינים —
// כך ש-localStorage ישן/פגום לא הורס רצף שהיה תקין ברובו. מחזירה [] בכל
// מקרה של כשל (JSON פגום, localStorage חסום, וכו').
function loadSequenceFromStorage() {
  try {
    const raw = localStorage.getItem(SEQUENCE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isKnownAminoAcidId).slice(0, MAX_SEQUENCE_LENGTH);
  } catch (err) {
    return [];
  }
}

function clearSequenceStorage() {
  try {
    localStorage.removeItem(SEQUENCE_STORAGE_KEY);
  } catch (err) {
    // לא קריטי — ראו הסבר ב-saveSequenceToStorage.
  }
}
