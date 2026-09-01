// מצב האפליקציה: רצף חומצות האמינו שנבנה, בכיוון N->C, לפי סדר ההוספה.
// נטען מ-localStorage (sequence-storage.js, נטען קודם) כדי ששרשרת קיימת
// לא תתאפס בטעינת אתר/רענון/חזרה מ-Quick Look-Scene Viewer שהרגה את
// הטאב ברקע — ראו saveSequenceToStorage/loadSequenceFromStorage.
let sequence = loadSequenceFromStorage();

// מניעת "סריקה כפולה בטעות": אם אותו מזהה בדיוק מגיע פעמיים תוך פחות
// מ-DUPLICATE_SCAN_WINDOW_MS (למשל קריאת תג NFC כפולה, ריצוד מגע/עכבר),
// ההוספה השנייה מתעלמת. הוספה מכוונת של אותה חומצה פעמיים (כמו Gly-Gly)
// עדיין עובדת — פרק הזמן שאדם צריך כדי ללחוץ שוב במודע תמיד ארוך מזה.
const DUPLICATE_SCAN_WINDOW_MS = 400;
let lastAddedId = null;
let lastAddedAt = 0;

// "מזהה פעולה" למניעת עיבוד כפול של ?aa= בתוך אותה טעינת עמוד — ראו
// הסבר מלא ליד השימוש ב-initFromUrl למטה.
let aaParamConsumedThisLoad = false;

function showSequenceLimitMessage() {
  const el = document.getElementById('sequence-limit-message');
  if (el) {
    el.textContent = 'הרצף הגיע לאורך המרבי הנתמך (' + MAX_SEQUENCE_LENGTH + ' חומצות). אי אפשר להוסיף עוד — אפשר לבטל/לאפס ולהתחיל מחדש.';
    el.hidden = false;
  }
}

// נקודת הכניסה היחידה להוספת חומצת אמינו לרצף — נקראת גם מלחיצת כפתור
// ידנית, גם מ-initFromUrl() (סריקת ?aa= פיזית), וגם מ-handleQrScanSuccess
// (qr-scanner.js, סריקה בתוך האתר). כל שלוש הדרכים חולקות את אותה הגנה
// מפני סריקה כפולה ואת אותה מגבלת אורך.
function addAminoAcid(id) {
  if (!AMINO_ACIDS[id]) return;
  const now = Date.now();
  if (id === lastAddedId && now - lastAddedAt < DUPLICATE_SCAN_WINDOW_MS) return; // סריקה כפולה בטעות
  if (sequence.length >= MAX_SEQUENCE_LENGTH) {
    showSequenceLimitMessage();
    return;
  }
  lastAddedId = id;
  lastAddedAt = now;
  sequence.push(id);
  render();
  renderPeptide(sequence); // מוגדרת ב-molecule-viewer.js — בונה ומציגה שרשרת שלמה
}

function undoLast() {
  sequence.pop();
  render();
  renderPeptide(sequence);
}

function resetSequence() {
  if (sequence.length === 0) return;
  if (!confirm('לאפס את הרצף כולו?')) return;
  sequence = [];
  clearSequenceStorage(); // sequence-storage.js — הכפתור מוחק גם מהזיכרון וגם מהאחסון
  render();
  renderPeptide(sequence);
}

// עוטפות undoLast/resetSequence עבור הכפתורים במסך הנחיתה (qr-landing)
// עצמו, שם — בניגוד לכפתורי הסיידבר הרגילים (btn-undo/btn-reset) —
// אחרי הפעולה צריך גם לרענן את תוכן ה-AR לרצף המעודכן, או לצאת חזרה
// למסך בניית השרשרת הרגיל אם הרצף התרוקן לגמרי.
function exitArLandingIfEmptySequence() {
  if (sequence.length > 0) return false;
  const landing = document.getElementById('qr-landing');
  if (landing && landing.hidden === false) exitQrArLanding(); // ar-viewer.js
  return true;
}

function handleLandingUndoClick() {
  undoLast();
  if (!exitArLandingIfEmptySequence()) enterArForCurrentSequence();
}

function handleLandingResetClick() {
  resetSequence(); // כולל אישור (confirm) — אם המשתמש ביטל, sequence לא התרוקן ולא יוצאים
  exitArLandingIfEmptySequence();
}

function handleReshowArClick() {
  enterArForCurrentSequence();
}

// נקראת מ-qr-scanner.js אחרי זיהוי+אימות מוצלחים של קוד QR (כתובת
// https://<אותו origin>/?aa=<קוד ידוע>). לא מנווטת בפועל לכתובת שנסרקה —
// רק ממירה אותה למזהה פנימי ומוסיפה אותו לרצף הקיים, בדיוק כמו סריקת
// NFC/QR פיזית אמיתית (?aa= ב-initFromUrl למטה) — משתמשת באותה
// addAminoAcid() ואותה enterArForCurrentSequence().
function handleQrScanSuccess(internalId) {
  addAminoAcid(internalId);
  enterArForCurrentSequence();
}

function buildFasta() {
  const oneLetterSeq = sequence.map((id) => AMINO_ACIDS[id].one).join('');
  const header = '>peptide_prototype length=' + sequence.length;
  return header + '\n' + oneLetterSeq;
}

function finishProtein() {
  if (sequence.length === 0) return;
  const fastaBox = document.getElementById('fasta-output');
  fastaBox.value = buildFasta();
  const section = document.getElementById('fasta-section');
  section.hidden = false;
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// באג אמיתי שדווח ותוקן: הכפתור מתויג "המשך לצפייה ב-AR" אבל handleFinishClick
// קרא בעבר רק ל-finishProtein() (מציג טקסט FASTA בלבד) — מעולם לא קרא
// ל-enterQrArLanding(), אפילו לא לחומצה בודדת שיש לה usdz/glb תקינים.
// התוצאה: לחיצה על הכפתור "עבדה" (טכנית) אך לא עשתה שום דבר הקשור
// ל-AR בפועל — בדיוק הדיווח בפועל (רצף Gly–Ala באייפון). התיקון: אחרי
// בניית ה-FASTA, מנסים בפועל להיכנס למסך ה-AR — בדיוק אותה נקודת כניסה
// שבה משתמש ?aa=/?sequence= ב-URL (חומצה בודדת דרך AMINO_ACIDS, 2+ שיירים
// דרך AR_SEQUENCES) — ורק אם אין קובץ AR לרצף הזה כלל, מציגים הודעה
// גלויה (btn-finish-note) במקום להשאיר את הכפתור "פעיל חזותית" בלי שום
// השפעה נראית-לעין.
function enterArForCurrentSequence() {
  const note = document.getElementById('btn-finish-note');
  if (note) note.hidden = true;

  if (sequence.length === 1) {
    enterQrArLanding(AMINO_ACIDS[sequence[0]]);
    return;
  }

  const key = sequence.join('-');
  const namedSeq = typeof AR_SEQUENCES !== 'undefined' ? AR_SEQUENCES[key] : null;
  if (namedSeq) {
    enterQrArLanding(namedSeq);
    return;
  }

  // באג אמיתי שדווח ותוקן: אם מסך הנחיתה כבר היה פתוח (למשל אחרי סריקת
  // חומצה בודדת נתמכת), והוספה נוספת (סריקת QR/handleFinishClick) הפכה
  // את הרצף לבלתי-נתמך — הפונקציה הייתה רק מציגה את ההודעה הזו (שגרה
  // בתוך app-shell, בלתי-נראית כשמסך הנחיתה פתוח) ומשאירה את מסך הנחיתה
  // פתוח עם תוכן AR ישן/לא-רלוונטי. חייבים לצאת ממנו קודם, כדי שההודעה
  // תהיה גלויה בפועל ולא יישאר AR מוצג לרצף שכבר לא תואם אותו.
  const landing = document.getElementById('qr-landing');
  if (landing && landing.hidden === false) exitQrArLanding(); // ar-viewer.js

  if (note) {
    note.textContent = 'רצף זה עדיין אינו זמין לצפייה ב-AR באייפון או באנדרואיד — אפשר להמשיך לצפות בתלת-ממד למעלה, ואת רצף ה-FASTA למטה.';
    note.hidden = false;
  }
}

// מטופל ע"י כפתור "המשך לצפייה ב-AR" ב-index.html.
function handleFinishClick() {
  finishProtein();
  enterArForCurrentSequence();
}

function render() {
  renderChain();
  renderTextSequence();
  renderCounts();
  renderButtonStates();
  renderSequenceHeader();
  updateArSection(sequence); // מוגדרת ב-ar-viewer.js — AR רק לחומצה בודדת, לא לשרשרת
  // אם הרצף השתנה אחרי שכבר הוצג FASTA — מסתירים אותו, כי הוא כבר לא מעודכן.
  document.getElementById('fasta-section').hidden = true;
  // אותו דבר להודעת "רצף לא זמין ל-AR" — נגזרת מהרצף הקודם, לא הנוכחי.
  const finishNote = document.getElementById('btn-finish-note');
  if (finishNote) finishNote.hidden = true;
  const limitMessage = document.getElementById('sequence-limit-message');
  if (limitMessage) limitMessage.hidden = true;
  // נקודת השמירה היחידה ל-localStorage — render() נקרא אחרי כל שינוי
  // אמיתי ברצף (הוספה/ביטול/איפוס/טעינה מ-URL), אז די לשמור כאן. רצף
  // ריק מוחק את המפתח לגמרי (לא שומר "[]") — כך שאיפוס/ביטול-עד-הסוף
  // תמיד משאירים את localStorage נקי לחלוטין, לא רק "רצף ריק שמור".
  if (sequence.length > 0) saveSequenceToStorage(sequence); // sequence-storage.js
  else clearSequenceStorage();
}

// כותרת שם הרצף בראש העמוד — נגזרת ישירות ממערך sequence המרכזי (לא
// ממערך שמות נפרד), כך ש-Undo/Reset/טעינת רצף (?aa=/?sequence=) כולם
// מעדכנים אותה אוטומטית פשוט כי render() נקרא בכל אחד מהם ממילא.
// קודי שלוש-אותיות באנגלית בלבד, בכיוון N->C, מחוברים ב-en dash (–)
// בלי רווחים (Gly–Ala–Ser) — לא שמות בעברית, לא קיצור בן אות אחת.
function renderSequenceHeader() {
  const nameEl = document.getElementById('sequence-banner-name');
  const subtitleEl = document.getElementById('sequence-banner-subtitle');
  if (!nameEl || !subtitleEl) return;
  nameEl.textContent = sequence.map((id) => AMINO_ACIDS[id].three).join('–');
  subtitleEl.textContent = sequence.length >= 2 ? 'Peptide chain — ' + sequence.length + ' amino acids' : '';
}

function renderChain() {
  const chainEl = document.getElementById('chain');
  chainEl.innerHTML = '';
  sequence.forEach((id, index) => {
    const aa = AMINO_ACIDS[id];
    const bead = document.createElement('div');
    bead.className = 'bead bead-' + id;
    bead.textContent = aa.one;
    bead.title = aa.he + ' (' + aa.en + ')';
    chainEl.appendChild(bead);
    if (index < sequence.length - 1) {
      const bond = document.createElement('div');
      bond.className = 'bond';
      chainEl.appendChild(bond);
    }
  });
}

function renderTextSequence() {
  const textSeqEl = document.getElementById('text-sequence');
  textSeqEl.textContent =
    sequence.length === 0
      ? '(אין עדיין רצף)'
      : sequence.map((id) => AMINO_ACIDS[id].three).join(' – ');
}

function renderCounts() {
  const n = sequence.length;
  const bonds = Math.max(n - 1, 0);
  document.getElementById('count-length').textContent = n;
  document.getElementById('count-bonds').textContent = bonds;
  document.getElementById('count-water').textContent = bonds;
}

function renderButtonStates() {
  const empty = sequence.length === 0;
  document.getElementById('btn-undo').disabled = empty;
  document.getElementById('btn-reset').disabled = empty;
  document.getElementById('btn-finish').disabled = empty;
}

// בחירה אוטומטית של חומצת אמינו מכתובת ה-URL — זו נקודת הכניסה
// שבה ישתמש תג NFC אמיתי: פתיחת https://.../?aa=phe (למשל) תבחר
// אוטומטית פנילאלנין, בדיוק כאילו נלחץ הכפתור המתאים. הקוד מנורמל
// לאותיות קטנות (aa=PHE / aa=Phe / aa=phe — כולם עובדים), נבדק מול
// AMINO_ACID_URL_CODES (מוגדרת ב-amino-acids-data.js, נועדה להתרחב
// בעתיד ל-20 החומצות), וקוד לא מוכר מציג הודעת שגיאה בעברית מבלי
// לטעון שום מודל (לא שגוי ולא ברירת מחדל) — נשאר על מצב הפתיחה הרגיל,
// כך שבחירה ידנית מהכפתורים ובניית שרשרת ידנית ממשיכות לעבוד כרגיל.
// בחירה אוטומטית של רצף פפטידי בעל-שם מכתובת ה-URL — ?sequence=gly-gly
// (הוכחת היתכנות: תומך רק בערך הזה בדיוק, לא במנגנון כללי לכל רצף
// אפשרי). נבדק לפני ?aa=, ומחזיר true אם טיפל בפרמטר (כדי ש-initFromUrl
// לא ינסה גם את ?aa= אם שניהם הופיעו יחד — מקרה קצה לא צפוי, אך לא
// מזיק להגן עליו).
function initSequenceFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const rawSequence = params.get('sequence');
  if (!rawSequence) return false;

  const normalized = rawSequence.trim().toLowerCase();
  const seqEntry = AR_SEQUENCES[normalized];

  const url = new URL(window.location.href);
  url.searchParams.delete('sequence');
  window.history.replaceState({}, '', url);

  if (!seqEntry) {
    showChemistryError(
      'רצף לא מוכר בכתובת: "' + rawSequence + '". ' +
      'רצפים נתמכים כרגע: gly-gly. אפשר לבנות רצף ידנית מהכפתורים למטה.'
    );
    return true;
  }

  // אותו איפוס מלא כמו ב-?aa= (לא מצרפים לרצף קיים) — ראו הסבר למטה.
  sequence = seqEntry.ids.slice();
  render();
  renderPeptide(sequence);
  enterQrArLanding(seqEntry); // seqEntry כולל he/en/three/usdz — אותה צורה בדיוק שחומצה בודדת מספקת
  return true;
}

// מאפסת את המסך למצב "פתיחה רגיל" באופן מפורש — לא מסתמכים על כך
// שהמצב ההתחלתי ב-HTML כבר נכון (hidden על #qr-landing וכו'), אלא
// אוכפים אותו כאן בקוד בכל פעם ש-initFromUrl() רץ. חשוב במיוחד לכתובת
// בסיס בלי aa/sequence כלל (כולל hash ריק כמו "#" או "#/") — במקרה הזה
// אסור להיכנס למסך AR בכלל, גם אם משהו (למשל מצב DOM שהשתמר, טעינה
// כפולה, וכו') כבר הציג אותו קודם. נקראת תמיד לפני שבודקים פרמטרים.
function resetToIdleState() {
  const landing = document.getElementById('qr-landing');
  const appShell = document.getElementById('app-shell');
  if (landing) landing.hidden = true;
  if (appShell) appShell.hidden = false;
  setArButtonVisible(false); // מוגדרת ב-ar-viewer.js — כפתור ה-AR בסיידבר
}

// מנקה hash ריק/לא תקין מכתובת הדף ("#", "#/") — אינו נושא כיום שום
// משמעות ניתובית (אין קוד שקורא location.hash בכלל), אבל נשאר בשוגג
// בסרגל הכתובות אחרי שיתוף/סריקה. מוסר אותו בפועל כדי שגם אם ייווסף
// בעתיד שימוש ב-hash, "#" ריק לא יתפרש כמזהה חומצה תקין. hash עם תוכן
// ממשי (עתידי, לא בשימוש היום) לא נוגעים בו כלל.
function stripEmptyHash() {
  const hash = window.location.hash;
  const isEmptyOrRoot = hash === '#' || hash === '#/' || hash === '';
  if (!isEmptyOrRoot) return;
  if (hash === '') return; // אין כלום להסיר
  const url = new URL(window.location.href);
  url.hash = '';
  window.history.replaceState({}, '', url);
}

function initFromUrl() {
  resetToIdleState();

  if (initSequenceFromUrl()) return; // טופל כרצף בעל-שם — לא בודקים ?aa= בנוסף

  const params = new URLSearchParams(window.location.search);
  const rawCode = params.get('aa');
  if (!rawCode) return; // אין פרמטר בכתובת כלל — מצב פתיחה רגיל, לא שגיאה (resetToIdleState כבר טיפלה במסך)

  const normalizedCode = rawCode.trim().toLowerCase();
  const internalId = AMINO_ACID_URL_CODES[normalizedCode];

  // מנקים את הפרמטר מהכתובת בכל מקרה (הצלחה או כישלון) כדי שרענון הדף
  // לא יפעיל את אותה בחירה/שגיאה שוב ושוב.
  const url = new URL(window.location.href);
  url.searchParams.delete('aa');
  window.history.replaceState({}, '', url);

  if (!internalId || !AMINO_ACIDS[internalId]) {
    showChemistryError(
      'קוד חומצת אמינו לא מוכר בכתובת: "' + rawCode + '". ' +
      'חומצות נתמכות כרגע: Gly, Ala, Ser, Phe. אפשר לבחור חומצה ידנית מהכפתורים למטה.'
    ); // מוגדרת ב-molecule-viewer.js — לא נטען שום מודל, המצג נשאר ריק/רגיל
    return;
  }

  // שינוי מכוון בהתנהגות (לפי מפרט "הוספת חומצה נוספת דרך QR אחרי חזרה
  // מ-AR"): בעבר ?aa= תמיד *החליף* את הרצף כולו (sequence = [internalId]),
  // כדי להתעלם משארית מצב ישנה. עכשיו, כשהרצף נשמר במכוון ב-localStorage
  // בין סריקות (ראו למעלה), ?aa= אמור *להוסיף* לרצף הקיים — בדיוק כמו
  // addAminoAcid() רגילה — כדי לתמוך בבניית שרשרת משיירים דרך סריקות QR
  // נפרדות ועוקבות (Gly, אז Ala, אז Ser). שתי סריקות מכוונות ונפרדות של
  // אותו קוד עדיין בונות הומודימר (Gly-Gly) — addAminoAcid כבר תומכת בזה,
  // ורק חוסמת סריקה כפולה-בטעות תוך פחות מ-DUPLICATE_SCAN_WINDOW_MS.
  //
  // aaParamConsumedThisLoad הוא "מזהה פעולה" למניעת עיבוד כפול של אותה
  // כניסת ?aa= בתוך אותה טעינת עמוד ממש (למשל אם initFromUrl תיקרא
  // פעמיים בטעות) — לא debounce קצר: הוא לעולם לא מתאפס לאורך חיי הטעינה
  // הזו. לא נדרשת הגנה נוספת מפני pageshow/bfcache: Quick Look/Scene
  // Viewer הם אפליקציות/תצוגות מערכת נפרדות שלא מנווטות את הדף כלל (הטאב
  // לא נטען מחדש), ואם המערכת כן הרגה את הטאב ברקע, זו טעינה חדשה לגמרי
  // (aaParamConsumedThisLoad מתאפס טבעית ל-false) על כתובת שכבר נוקתה
  // מ-?aa= (replaceState רץ כאן למעלה) — כך שאין ?aa= לעבד שוב בכלל.
  if (aaParamConsumedThisLoad) return;
  aaParamConsumedThisLoad = true;

  addAminoAcid(internalId); // מוסיפה לרצף הקיים/השמור, לא מחליפה אותו
  enterArForCurrentSequence(); // מציגה AR מאוחד לרצף המעודכן (חומצה בודדת/AR_SEQUENCES)
}

// מחברת את כפתורי "המשך בניית השרשרת" במסך הנחיתה (qr-landing) —
// נפרדים לגמרי מהכפתורים המקבילים בסיידבר (btn-undo/btn-reset/btn-finish),
// כי כאן צריך גם לרענן/לצאת מה-AR אחרי הפעולה. setupQrScannerUi (qr-scanner.js)
// מחברת את "סרוק חומצה אמינית נוספת" בנפרד.
function setupContinueChainButtons() {
  const reshowBtn = document.getElementById('qr-reshow-ar-button');
  const undoBtn = document.getElementById('qr-undo-last-button');
  const resetBtn = document.getElementById('qr-reset-sequence-button');
  if (reshowBtn) reshowBtn.addEventListener('click', handleReshowArClick);
  if (undoBtn) undoBtn.addEventListener('click', handleLandingUndoClick);
  if (resetBtn) resetBtn.addEventListener('click', handleLandingResetClick);
}

document.addEventListener('DOMContentLoaded', () => {
  setPlatformClass(); // ar-viewer.js — מוקדם ככל האפשר, לפני שכל תוכן AR נבנה
  stripEmptyHash();
  render();
  initFromUrl();
  setupWebxrControlListeners(); // webxr-ar.js — כפתורי סיבוב/זום/מהירות/יציאה, פעם אחת בטעינת הדף
  setupContinueChainButtons();
  setupQrScannerUi(); // qr-scanner.js — "סרוק חומצה אמינית נוספת"

  // דף אבחון AR (?debug=ar, מוגדר ב-ar-viewer.js): אם לא נבחרה שום
  // חומצה/רצף דרך ה-URL (?aa=/?sequence=), בוחרים Gly כברירת מחדל כדי
  // שיהיה מודל GLB אמיתי לבדוק מולו — לא רק מסך ריק.
  const debugParam = new URLSearchParams(window.location.search).get('debug');
  if (debugParam === 'ar') {
    if (sequence.length === 0) {
      sequence = ['gly'];
      render();
      renderPeptide(sequence);
    }
    setupArDebugClose();
    maybeShowArDebugPage();
    setupArDebugMutationObserver(); // ar-viewer.js — זמני, רק במצב אבחון
  }
});

// שורד חזרה מ-Quick Look/Scene Viewer וגם bfcache: קובע מחדש רק את
// מחלקת הפלטפורמה (לא את כל מצב ה-URL/רצף כמו initFromUrl) — בכוונה לא
// קוראים ל-initFromUrl() כאן, כי זה היה עלול "לבעוט" משתמש שחוזר מ-AR
// חזרה למסך בניית השרשרת הרגיל, למרות שהוא עדיין אמור להיות במסך ה-AR.
window.addEventListener('pageshow', () => {
  setPlatformClass();
});
