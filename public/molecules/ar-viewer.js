// שכבת AR חוצה-פלטפורמות: עוטפת את <model-viewer> (ספרייה חיצונית,
// שמורה מקומית ב-vendor/) שמנהלת בעצמה את הבחירה בין Quick Look
// (iOS, USDZ), Scene Viewer (Android+ARCore, GLB), ותצוגת תלת-ממד
// רגילה כברירת מחדל כשאין תמיכת AR. אין כאן שום זיהוי-מכשיר ידני —
// זו בדיוק הסיבה שנבחרה הספרייה הזו.
//
// היקף: AR מוצג אך ורק כאשר יש בדיוק חומצת אמינו חופשית אחת ברצף
// (sequence.length === 1) — לא לשרשרת שנבנתה. הקובץ הזה לא נוגע כלל
// במציג ה-3Dmol (molecule-viewer.js) — שני מציגים עצמאיים לחלוטין,
// כדי שהחלפת מקור ה-AR לא תאפס זום/מיקום של תצוגת הדפדפן האינטראקטיבית.
//
// הרחבה עתידית (מתיונין, 20 חומצות, אינסולין): מוסיפים לחומצה שדות
// glb/usdz ב-amino-acids-data.js (ומריצים tools/build-ar-assets.mjs
// מחדש) — הקובץ הזה לא משתנה כלל.

// ==================== קישור Intent ישיר ל-Scene Viewer (אנדרואיד) ====================
// לא מסתמכים רק על model-viewer.activateAR() (שנשאר קיים כאפשרות נוספת,
// לא ברירת מחדל) — קישור <a href="intent://..."> אמיתי, שהמשתמש לוחץ
// עליו ישירות (לא click מלאכותי), עוקף לגמרי את לוגיקת ה-AR הפנימית של
// model-viewer. בדיוק לפי תיעוד Scene Viewer של Google.
// גרסת-בנייה קבועה (לא תלוית build system) — מוסיפה ?v= לכל כתובת מודל
// (src/ios-src של model-viewer, קישור ה-Quick Look הישיר ל-iOS, וכתובת
// ה-file= בקישורי ה-Intent) כדי למנוע טעינת GLB/USDZ ישן מהמטמון אחרי
// שהתוכן באותו נתיב קובץ משתנה (בדיוק המצב אחרי תיקון החומרים/USDZ
// שביצענו — אותם שמות קבצים, תוכן שונה). יש להגדיל בכל פעם שקובצי
// GLB/USDZ עצמם משתנים מחדש.
const AR_BUILD_ID = '20260829c';

function withVersion(relativePath) {
  return relativePath + (relativePath.includes('?') ? '&' : '?') + 'v=' + AR_BUILD_ID;
}

function buildAbsoluteUrl(relativePath) {
  return new URL(relativePath, window.location.href).href;
}

// בונה כתובת intent:// תקנית ל-Scene Viewer — ללא רווחים/שורות, בדיוק
// לפי מבנה התיעוד הרשמי:
// intent://arvr.google.com/scene-viewer/1.0?file=...&mode=ar_preferred
// &resizable=...&title=...#Intent;scheme=https;package=...;action=...;
// S.browser_fallback_url=...;end;
function buildSceneViewerIntentUrl(glbRelPath, title, resizable) {
  const absoluteGlbUrl = withVersion(buildAbsoluteUrl(glbRelPath));
  const fallbackUrl = window.location.href; // חזרה לאותו עמוד — לא לולאה, כי הקישור לא מופעל אוטומטית, רק זמין ללחיצה חוזרת
  const query = 'file=' + encodeURIComponent(absoluteGlbUrl) +
    '&mode=ar_preferred' +
    '&resizable=' + (resizable ? 'true' : 'false') +
    '&title=' + encodeURIComponent(title);
  return 'intent://arvr.google.com/scene-viewer/1.0?' + query +
    '#Intent;scheme=https;package=com.google.android.googlequicksearchbox;' +
    'action=android.intent.action.VIEW;S.browser_fallback_url=' + encodeURIComponent(fallbackUrl) + ';end;';
}

// מודל ידוע/רשמי (Google, מוצג בתיעוד model-viewer.dev עצמו) — לבדיקה
// משווה בלבד: אם גם הוא לא נפתח, הבעיה במכשיר/ARCore, לא בקובץ שלנו.
const KNOWN_GOOD_COMPARISON_GLB_URL = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

function updateArSection(sequenceIds) {
  const section = document.getElementById('ar-section');
  const mv = document.getElementById('ar-model-viewer');
  if (!section || !mv) return;

  clearArError();
  hideArReadyMessage();
  hideArMissingMessage();
  hideArFallbackMessage();
  hideArUnsupportedSequenceMessage();

  // רצף בעל-שם (gly-gly / gly-ala-ser, הוכחת היתכנות) — שרשרת מאוחדת
  // אמיתית עם קשר פפטידי, לא חומצה בודדת. יש לה קובצי glb/usdz משלה,
  // נבדלים לחלוטין מ-AMINO_ACIDS[id] של חומצה בודדת.
  const namedSeqKey = sequenceIds && sequenceIds.length > 1 ? sequenceIds.join('-') : null;
  const namedSeq = namedSeqKey && typeof AR_SEQUENCES !== 'undefined' ? AR_SEQUENCES[namedSeqKey] : null;

  if (!namedSeq && sequenceIds && sequenceIds.length > 1) {
    // רצף אמיתי נבנה (יותר משייר אחד) אבל אינו אחד מרצפי-הדוגמה הקבועים
    // — במקום להסתיר בשקט (מבלבל: "למה AR נעלם?"), מציגים הסבר ברור
    // שזו מגבלה ידועה, לא תקלה. מנגנון כללי לכל רצף עדיין בתכנון.
    section.hidden = false;
    mv.style.display = 'none';
    setArButtonVisible(false);
    showArUnsupportedSequenceMessage();
    return;
  }

  if (!namedSeq && (!sequenceIds || sequenceIds.length !== 1)) {
    section.hidden = true;
    return;
  }

  const aa = namedSeq || AMINO_ACIDS[sequenceIds[0]];
  if (!aa || !aa.glb) {
    // אין עדיין קובץ AR לחומצה הזו: מציגים את הסקציה עם חיווי ברור
    // ("קובץ AR חסר"), לא מסתירים אותה שקט וגם לא מציגים כפתור פעיל.
    section.hidden = false;
    mv.style.display = 'none';
    setArButtonVisible(false);
    showArMissingMessage();
    return;
  }

  mv.style.display = '';
  section.hidden = false;
  setArButtonVisible(false); // מוסתר עד שנדע אם AR זמין בפועל במכשיר הזה

  mv.setAttribute('alt', aa.he + ' (' + aa.en + ') — מבנה תלת-ממדי ל-AR');
  mv.setAttribute('src', withVersion(aa.glb));
  if (aa.usdz) {
    mv.setAttribute('ios-src', withVersion(aa.usdz));
  } else {
    // אין עדיין קובץ usdz סטטי — משאירים ios-src ריק. לפי תיעוד
    // model-viewer, אם quick-look נכלל ב-ar-modes אך ios-src חסר, הספרייה
    // עצמה תנסה ליצור USDZ "on the fly" מתוך ה-GLB (ללא תמיכה באנימציה,
    // לא רלוונטי למולקולה סטטית שלנו) — לא אומת חזותית על ידי, ראו הסבר.
    mv.removeAttribute('ios-src');
  }
}

function setArButtonVisible(visible) {
  const btn = document.getElementById('ar-button');
  if (btn) btn.hidden = !visible;
}

function showArReadyMessage() {
  const el = document.getElementById('ar-ready-message');
  if (el) el.hidden = false;
}

function hideArReadyMessage() {
  const el = document.getElementById('ar-ready-message');
  if (el) el.hidden = true;
}

function showArMissingMessage() {
  const el = document.getElementById('ar-missing-message');
  if (el) el.hidden = false;
}

function hideArMissingMessage() {
  const el = document.getElementById('ar-missing-message');
  if (el) el.hidden = true;
}

function showArUnsupportedSequenceMessage() {
  const el = document.getElementById('ar-unsupported-sequence-message');
  if (el) el.hidden = false;
}

function hideArUnsupportedSequenceMessage() {
  const el = document.getElementById('ar-unsupported-sequence-message');
  if (el) el.hidden = true;
}

function showArFallbackMessage() {
  const el = document.getElementById('ar-fallback-message');
  if (el) {
    el.textContent = 'המכשיר או הדפדפן הנוכחיים אינם תומכים ב-AR — מוצגת תצוגת תלת-ממד רגילה במקום.';
    el.hidden = false;
  }
}

function hideArFallbackMessage() {
  const el = document.getElementById('ar-fallback-message');
  if (el) el.hidden = true;
}

function showArError(message) {
  const el = document.getElementById('ar-error-message');
  if (el) {
    el.textContent = message;
    el.hidden = false;
  }
}

function clearArError() {
  const el = document.getElementById('ar-error-message');
  if (el) {
    el.textContent = '';
    el.hidden = true;
  }
}

// ==================== רישום אבחון גלוי (לא רק Console) ====================
// נועד לאבחון תקלות AR בפועל במכשיר אמיתי (בעיקר Quick Look באייפון)
// בלי צורך בחיבור לכלי פיתוח מרוחקים — מציג את כל אירועי ה-AR הרלוונטיים
// (ar-status/ar-tracking/quick-look-button-tapped/error/canActivateAR)
// בזמן אמת, ישירות על המסך.
const AR_DIAG_MAX_LINES = 20;
function logArDiag(line) {
  const ts = new Date().toISOString().split('T')[1].replace('Z', '');
  const text = ts + '  ' + line;
  console.log('[ar-diag]', line);
  const el = document.getElementById('ar-diag-log');
  if (!el) return;
  const row = document.createElement('div');
  row.textContent = text;
  el.appendChild(row);
  while (el.children.length > AR_DIAG_MAX_LINES) el.removeChild(el.firstChild);
  el.scrollTop = el.scrollHeight;
}

// נקרא פעם אחת: עוקב אחרי יכולת ה-AR בפועל של המכשיר/דפדפן הנוכחיים
// (canActivateAR מתעדכן ע"י model-viewer עצמו אחרי טעינת המודל). מעדכן
// גם את כפתור ה-AR הרגיל בסיידבר וגם את הכפתור הגדול במסך הנחיתה מ-QR
// (#qr-ar-button) — שני משטחים נפרדים החולקים אותו model-viewer אחד.
function setQrArButtonEnabled(enabled) {
  const btn = document.getElementById('qr-ar-button');
  if (btn) btn.disabled = !enabled;
}

function showQrLandingUnsupported() {
  const el = document.getElementById('qr-landing-unsupported');
  if (el) el.hidden = false;
}

function hideQrLandingUnsupported() {
  const el = document.getElementById('qr-landing-unsupported');
  if (el) el.hidden = true;
}

function setupArAvailabilityWatcher() {
  const mv = document.getElementById('ar-model-viewer');
  if (!mv) return;

  mv.addEventListener('load', () => {
    const available = !!mv.canActivateAR;
    logArDiag('load: src=' + mv.getAttribute('src') + ' ios-src=' + (mv.getAttribute('ios-src') || '(none)') + ' canActivateAR=' + available);
    setArButtonVisible(available);
    setQrArButtonEnabled(available);
    const updateLinks = document.getElementById('qr-android-update-links');
    const notSupportedMsg = document.getElementById('qr-not-supported-message');
    if (available) {
      hideArFallbackMessage();
      showArReadyMessage();
      hideQrLandingUnsupported();
      if (updateLinks && !isIOS()) updateLinks.hidden = true;
      if (notSupportedMsg && !isIOS()) notSupportedMsg.hidden = true;
    } else {
      hideArReadyMessage();
      showArFallbackMessage();
      showQrLandingUnsupported();
      // חשוב: זה מעיד רק שה-activateAR() הפנימי (model-viewer) לא זיהה
      // AR זמין — לא אומר בוודאות שקישורי ה-Intent הישירים (שלא תלויים
      // בזיהוי הזה כלל) לא יעבדו. לכן: מציגים את ההודעה + קישורי עדכון
      // כרשת ביטחון, אבל לא מסתירים/מנטרלים את הקישורים הישירים עצמם —
      // המשתמש עדיין יכול לנסות אותם ולראות בעצמו (ראו בלוק השוואה).
      if (updateLinks && !isIOS()) updateLinks.hidden = false;
      if (notSupportedMsg && !isIOS()) notSupportedMsg.hidden = false;
    }
  });

  mv.addEventListener('error', (event) => {
    const detail = event && event.detail;
    console.error('שגיאת model-viewer:', event);
    logArDiag('error: ' + (detail && (detail.type || JSON.stringify(detail)) || 'לא ידוע'));
    setArButtonVisible(false);
    setQrArButtonEnabled(false);
    hideArReadyMessage();
    hideArFallbackMessage();
    showArError('אירעה שגיאה בטעינת המודל לתצוגת AR.');
    showQrLandingUnsupported();
  });

  // אירועי AR ייעודיים (קיימים בפועל ב-vendor/model-viewer.min.js):
  // ar-status: not-presenting/session-started/object-placed/failed
  // ar-tracking: אותה צורת detail.status, אחרי שהמצלמה כבר פועלת
  // quick-look-button-tapped: נורה ספציפית כש-activateAR() מנסה לפתוח Quick Look באייפון
  mv.addEventListener('ar-status', (event) => {
    const status = event && event.detail && event.detail.status;
    logArDiag('ar-status: ' + status);
    if (status === 'failed') showArError('הפעלת ה-AR נכשלה במכשיר הזה (ar-status: failed).');
  });
  mv.addEventListener('ar-tracking', (event) => {
    const status = event && event.detail && event.detail.status;
    logArDiag('ar-tracking: ' + status);
  });
  mv.addEventListener('quick-look-button-tapped', () => {
    logArDiag('quick-look-button-tapped — Safari אמור לפתוח כעת USDZ (אוטומטי או מ-ios-src)');
  });
}

// ==================== מסך פתיחה ייעודי מסריקת QR (?aa=) ====================
// נקרא מ-initFromUrl() ב-app.js, רק כאשר קוד ה-URL תקין. מעביר (reparent)
// את ה-<model-viewer> הקיים בעצמו לתוך משבצת התצוגה המקדימה במסך הנחיתה
// — לא יוצר מופע שני (שהיה טוען את ה-GLB פעמיים), רק ממקם אותו בגדול
// ובמרכז. הכפתור הגדול (#qr-ar-button) הוא אלמנט נפרד לגמרי מ-#ar-button
// הקיים בסיידבר, כדי לא לגעת בהתנהגות שכבר אושרה שם.
// זיהוי iOS/iPadOS — הכרחי כי iPadOS 13+ מסווה את עצמו כ-Mac ב-UA
// (אין WebXR/Scene Viewer באייפון בכל מקרה; הדרך היחידה האמינה לבדוק
// היא Safari עצמו, לא model-viewer). משמש רק כדי לבחור באיזה כפתור
// AR להשתמש במסך הנחיתה — לא נוגע בשום החלטה כימית/גיאומטרית.
function isIOS() {
  try {
    const ua = navigator.userAgent || '';
    const isAppleTouch = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    // navigator.platform==='MacIntel' && maxTouchPoints>1: תוכנן במקור
    // ל-iPadOS 13+ (מסווה עצמו כ-Mac ב-UA), אבל אותו בדיוק תנאי גם תופס
    // נכון אייפון אמיתי במצב "Request Desktop Website" (ה-UA הופך למראה-
    // Mac, אבל maxTouchPoints נשאר מדווח כמסך-מגע אמיתי) — אומת ב-
    // test-platform-detection.mjs מול userAgent מדויק של תרחיש כזה.
    const isMacWithTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isAppleTouch || isMacWithTouch;
  } catch (err) {
    return false;
  }
}

// זיהוי אנדרואיד — נדרש כדי לא להציג את בלוק כפתורי ה-Scene Viewer
// (intent://, אנדרואיד בלבד) במחשב רגיל, שבו הם לעולם לא יעבדו. בעבר
// enterQrArLanding הציגה את הבלוק הזה בכל מקרה שבו isIOS()==false —
// כולל מחשב שולחני — מה שיצר כפתורים מטעים. תרחיש נוסף שבו זה קריטי:
// אייפון עם "Request Desktop Website" מופעל ל-Safari/Chrome (הגדרה
// הנשמרת per-site) — ה-userAgent במצב הזה לרוב לא כולל iPhone/iPad
// ולפעמים גם navigator.platform משתנה, כך ש-isIOS() עלול להחזיר false
// באייפון אמיתי. גם אז, עדיף להציג הודעת "AR לא נתמך" נייטרלית מאשר
// כפתורי אנדרואיד שלעולם לא יפעלו על אותו מכשיר.
function isAndroid() {
  try {
    return /Android/.test(navigator.userAgent || '');
  } catch (err) {
    return false;
  }
}

// הגנת-על ברמת CSS, נוספת על ה-hidden הרגיל (ראו הסבר מלא ליד .platform-ios
// ב-style.css): קובעת בדיוק מחלקה אחת מתוך platform-ios/platform-android/
// platform-other על <html>, כדי ש-.android-only/.ios-only ב-CSS יוכלו
// להסתיר אלמנטים גם אם באג עתידי (כמו זה שתוקן כאן) ישבור שוב hidden
// לבדו. חייבת להסיר קודם את שלוש המחלקות (לא רק להוסיף) — אחרת, למשל
// אחרי pageshow עם שינוי פלטפורמה (לא סביר, אך זול להגן עליו), ייתכן
// שיישארו שתי מחלקות פלטפורמה גם יחד.
function setPlatformClass() {
  const root = document.documentElement;
  if (!root) return;
  root.classList.remove('platform-ios', 'platform-android', 'platform-other');
  if (isIOS()) {
    root.classList.add('platform-ios');
  } else if (isAndroid()) {
    root.classList.add('platform-android');
  } else {
    root.classList.add('platform-other');
  }
}

// כלי אבחון זמני (?debug=ar בלבד): מתעד ל-logArDiag כל שינוי עתידי של
// hidden/class/style על עץ מסך הנחיתה כולו — כדי שאם תיקון עתידי ישבור
// שוב את אותו דבר (אלמנט AR שאמור להיות מוסתר אך לא), האבחון הגלוי על
// המסך יראה בדיוק איזה אלמנט ואיזו תכונה השתנתה, בלי חיבור לכלי פיתוח.
function setupArDebugMutationObserver() {
  const landing = document.getElementById('qr-landing');
  if (!landing || typeof MutationObserver === 'undefined') return;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.type !== 'attributes') return;
      const el = m.target;
      const id = el.id || '(ללא id, class=' + (el.className || '') + ')';
      const value = el.getAttribute(m.attributeName);
      logArDiag('MutationObserver: ' + id + '.' + m.attributeName + ' -> ' + (value === null ? '(הוסר)' : value));
    });
  });
  observer.observe(landing, { attributes: true, attributeFilter: ['hidden', 'class', 'style'], subtree: true });
  logArDiag('MutationObserver פעיל על מסך הנחיתה (hidden/class/style)');
}

function enterQrArLanding(aa) {
  const landing = document.getElementById('qr-landing');
  const slot = document.getElementById('qr-landing-preview-slot');
  const mv = document.getElementById('ar-model-viewer');
  const androidBlock = document.getElementById('qr-android-ar-block');
  const androidButton = document.getElementById('qr-ar-button');
  const iosLink = document.getElementById('qr-ios-ar-link');
  if (!landing || !slot || !mv) return;

  setText('qr-landing-he', aa.he || '');
  setText('qr-landing-en', aa.en || '');
  setText('qr-landing-three', aa.three || '');

  slot.appendChild(mv); // הזזה אמיתית ב-DOM, לא שכפול — ה-GLB שכבר נטען/מתחיל להיטען לא נטען מחדש
  hideQrLandingUnsupported();
  // חשוב: אין ar-scale="fixed" גלובלי כאן יותר — Adjustable (ברירת המחדל
  // עכשיו) חייב לאפשר שינוי גודל חופשי דרך activateAR() גם כן. Stable
  // מוגדר אך ורק על קישור ה-Intent הישיר שלו (resizable=false בכתובת),
  // לא כתכונה על ה-<model-viewer> עצמו.
  mv.removeAttribute('ar-scale');

  // שלוש אפשרויות בלעדיות, לפי פלטפורמה בפועל — לא "isIOS() ? ... : ..."
  // כפי שהיה קודם (זה בדיוק מה שגרם לבלוק כפתורי אנדרואיד (Scene Viewer,
  // intent://) להופיע גם במחשב רגיל וגם באייפון שבו isIOS() מחזיר false
  // בטעות, למשל תחת "Request Desktop Website" — ראו הערה ליד isAndroid()).
  // ב-iOS: קישור Quick Look טבעי (rel="ar") ישירות לקובץ USDZ הקבוע —
  // לא תלוי כלל בטעינת ה-GLB או ב-canActivateAR, ולכן פעיל מיד.
  // באנדרואיד: בלוק קישורי ה-Intent הישירים ל-Scene Viewer.
  // בכל מקרה אחר (מחשב, או פלטפורמה שזוהתה אך בלי קובץ AR מתאים לחומצה
  // הזו): לא מציגים שום כפתור AR מטעה — רק הודעה נייטרלית + תצוגת
  // התלת-ממד הרגילה (אותו אלמנט #qr-landing-unsupported המשמש כבר
  // ל"AR לא נתמך במכשיר הזה" במקומות אחרים בקובץ).
  const iosHint = document.getElementById('qr-ios-hint');
  if (isIOS() && aa.usdz && iosLink) {
    iosLink.setAttribute('href', withVersion(aa.usdz));
    iosLink.hidden = false;
    if (iosHint) iosHint.hidden = false;
    if (androidBlock) androidBlock.hidden = true;
    logArDiag('iOS זוהה: קישור Quick Look טבעי (rel="ar") -> ' + aa.usdz);
  } else if (isAndroid() && aa.glb) {
    if (iosLink) iosLink.hidden = true;
    if (iosHint) iosHint.hidden = true;
    if (androidBlock) androidBlock.hidden = false;
    setQrArButtonEnabled(false); // מושבת עד שנדע בפועל (מאזין load/error למעלה)
    setupAndroidDirectArLinks(aa);
    logArDiag('Android זוהה: מציגים בלוק כפתורי Scene Viewer');
  } else {
    if (iosLink) iosLink.hidden = true;
    if (iosHint) iosHint.hidden = true;
    if (androidBlock) androidBlock.hidden = true;
    showQrLandingUnsupported();
    logArDiag('לא זוהו iOS/Android תואמים (או שאין קובץ AR לחומצה זו) — מוצגת הודעה נייטרלית ללא כפתורי AR מטעים');
  }

  const appShell = document.getElementById('app-shell');
  if (appShell) appShell.hidden = true;
  landing.hidden = false;
}

// בונה את שני קישורי ה-Intent הישירים (Stable/Adjustable) + קישורי
// ההשוואה, ומציג אותם מיד — לא תלויים בטעינת ה-GLB דרך model-viewer
// בכלל (זו בדיוק הנקודה: עוקפים את הלוגיקה הפנימית שלו).
//
// כל בלוק עצמאי עטוף ב-try/catch משלו: דווח בפועל שגם Adjustable/Stable
// (קישורי Intent סטטיים, ללא תלות ב-webxr-ar.js) וגם "AR חי" לא פעילים
// יחד — כדי שכשל באחד (או ב-checkWebXrStatus/WebXR) לא ימנע מהבלוקים
// האחרים לסיים את ההגדרה שלהם, ושכל כשל יתועד בפועל ב-logArDiag הגלוי
// על המסך (לא רק ב-console, שאין אליו גישה בבדיקת מכשיר אמיתי).
function setupAndroidDirectArLinks(aa) {
  const stableLink = document.getElementById('qr-stable-ar-link');
  const adjustableLink = document.getElementById('qr-adjustable-ar-link');
  const adjustableHint = document.getElementById('qr-adjustable-hint');
  const stableHint = document.getElementById('qr-stable-hint');
  if (!aa.glb) {
    if (stableLink) stableLink.hidden = true;
    if (adjustableLink) adjustableLink.hidden = true;
    if (adjustableHint) adjustableHint.hidden = true;
    if (stableHint) stableHint.hidden = true;
    logArDiag('Android: לחומצה/רצף הזה אין glb כלל — כפתורי AR מוסתרים');
    return;
  }
  const title = aa.three || aa.en || aa.he || 'Molecule';

  try {
    // Adjustable הוא הכפתור הראשי כעת: resizable=true, בלי ar-scale="fixed"
    // בשום מקום — צביטה/הזזה/סיבוב חופשיים דרך המחוות הטבעיות של Scene Viewer.
    if (adjustableLink) {
      adjustableLink.setAttribute('href', buildSceneViewerIntentUrl(aa.glb, title, true));
      adjustableLink.hidden = false;
    }
    if (adjustableHint) adjustableHint.hidden = false;
    // Stable הוא אפשרות משנית: resizable=false רק בקישור הזה עצמו, לא גלובלי.
    if (stableLink) {
      stableLink.setAttribute('href', buildSceneViewerIntentUrl(aa.glb, title, false));
      stableLink.hidden = false;
    }
    if (stableHint) stableHint.hidden = false;
    logArDiag('Android: קישורי Intent ישירים נבנו (Adjustable ראשי + Stable משני) עבור ' + aa.glb);
  } catch (err) {
    logArDiag('שגיאה בבניית קישורי Adjustable/Stable AR: ' + err.message);
  }

  try {
    const compBlock = document.getElementById('qr-comparison-block');
    const compOfficial = document.getElementById('qr-comparison-official-link');
    const compOurs = document.getElementById('qr-comparison-ours-link');
    if (compBlock) compBlock.hidden = false;
    if (compOfficial) compOfficial.setAttribute('href', buildSceneViewerIntentUrl(KNOWN_GOOD_COMPARISON_GLB_URL, 'Astronaut (Google)', false));
    if (compOurs) compOurs.setAttribute('href', buildSceneViewerIntentUrl(aa.glb, title, false));
  } catch (err) {
    logArDiag('שגיאה בבניית קישורי ההשוואה (Google Astronaut): ' + err.message);
  }

  checkWebXrStatus(aa).catch((err) => {
    logArDiag('שגיאה ב-checkWebXrStatus (AR חי): ' + err.message);
  });
}

// WebXR: model-viewer.min.js הנוכחי (בדקנו בקוד המקור בפועל) לא חושף API
// ציבורי לשינוי scale/מיקום בזמן session WebXR שהוא-עצמו מפעיל — לכן
// "AR חי" הוא session עצמאי (webxr-ar.js) שהעמוד מנהל ישירות, לא דרך
// model-viewer.activateAR() בכלל. מוצג רק כש-navigator.xr מדווח בפועל
// על תמיכה — לא קיים ב-Safari/iOS, ותלוי מכשיר/גרסת Chrome/ARCore באנדרואיד.
async function checkWebXrStatus(aa) {
  const statusEl = document.getElementById('qr-webxr-status');
  const liveArBtn = document.getElementById('qr-webxr-live-ar-button');
  if (!statusEl && !liveArBtn) return;
  try {
    if (!(typeof navigator !== 'undefined' && navigator.xr && navigator.xr.isSessionSupported)) {
      if (statusEl) statusEl.hidden = true;
      if (liveArBtn) liveArBtn.hidden = true;
      logArDiag('AR חי: navigator.xr.isSessionSupported לא זמין — הכפתור מוסתר');
      return;
    }
    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    if (!supported) {
      if (statusEl) statusEl.hidden = true;
      if (liveArBtn) liveArBtn.hidden = true;
      logArDiag('AR חי: isSessionSupported("immersive-ar") = false — הכפתור מוסתר');
      return;
    }
    if (statusEl) {
      statusEl.textContent = 'WebXR נתמך במכשיר זה. "AR חי" למטה פותח session עצמאי עם כפתורי סיבוב/הגדלה אמיתיים בזמן אמת (ניסיוני — תלוי בתמיכת hit-test במכשיר).';
      statusEl.hidden = false;
    }
    // הכפתור תלוי בתמיכת WebXR בלבד, לא בקובץ glb סטטי: "AR חי" קורא את
    // sequence הגלובלי בזמן אמת (webxr-ar.js:startLiveAr) ולכן עובד גם
    // לרצף מותאם-אישית שאין לו כלל קובץ AR קבוע (ראו buildCustomSequenceArEntry
    // ב-app.js) — לא רק לחומצה בודדת/AR_SEQUENCES הקבועים.
    if (liveArBtn && aa && typeof sequence !== 'undefined' && sequence && sequence.length > 0) {
      liveArBtn.hidden = false;
      liveArBtn.onclick = () => startLiveAr(aa.three || aa.en || aa.he || 'Molecule');
      logArDiag('AR חי: הכפתור פעיל ומחובר');
    } else if (liveArBtn) {
      liveArBtn.hidden = true;
    }
  } catch (err) {
    if (statusEl) statusEl.hidden = true;
    if (liveArBtn) liveArBtn.hidden = true;
    logArDiag('AR חי: checkWebXrStatus נכשל — ' + err.message);
  }
}

function exitQrArLanding() {
  const landing = document.getElementById('qr-landing');
  const section = document.getElementById('ar-section');
  const mv = document.getElementById('ar-model-viewer');
  const appShell = document.getElementById('app-shell');

  if (mv && section) section.insertBefore(mv, section.firstChild); // מחזירים למקומו המקורי בסיידבר
  if (landing) landing.hidden = true;
  if (appShell) appShell.hidden = false;
}

// setText(id, text) מוגדרת כבר ב-molecule-viewer.js (נטען לפני קובץ זה) — משתמשים בה ישירות.

// ==================== דף אבחון AR: ?debug=ar ====================
// לא מציג שום מידע אישי — רק מאפייני דפדפן/מכשיר טכניים (userAgent
// עצמו, לא מזהים אישיים) וסטטוס AR טכני. עוזר לאבחן תקלות בפועל
// במכשיר בלי חיבור לכלי פיתוח מרוחקים.
async function maybeShowArDebugPage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('debug') !== 'ar') return;

  const panel = document.getElementById('ar-debug-panel');
  const content = document.getElementById('ar-debug-content');
  if (!panel || !content) return;

  const mv = document.getElementById('ar-model-viewer');
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  const androidMatch = ua.match(/Android ([0-9.]+)/);
  const chromeMatch = ua.match(/Chrome\/([0-9.]+)/);
  const deviceType = isIOS() ? 'iOS' : (/Android/.test(ua) ? 'Android' : 'אחר/לא זוהה');

  let webxrSupported = 'navigator.xr לא קיים בדפדפן הזה';
  try {
    if (typeof navigator !== 'undefined' && navigator.xr && navigator.xr.isSessionSupported) {
      webxrSupported = (await navigator.xr.isSessionSupported('immersive-ar')) ? 'כן' : 'לא';
    }
  } catch (err) {
    webxrSupported = 'שגיאה בבדיקה: ' + (err && err.message);
  }

  const glbSrc = mv ? mv.getAttribute('src') : null;
  const absoluteGlbUrl = glbSrc ? buildAbsoluteUrl(glbSrc) : null;
  let glbLoadResult = '(אין מודל נטען — נסה ?debug=ar&aa=gly)';
  if (absoluteGlbUrl) {
    try {
      const res = await fetch(absoluteGlbUrl, { method: 'HEAD' });
      glbLoadResult = 'HTTP ' + res.status + ' | Content-Type: ' + (res.headers.get('content-type') || '(none)');
    } catch (err) {
      glbLoadResult = 'שגיאת רשת: ' + (err && err.message);
    }
  }

  const errorEl = document.getElementById('ar-error-message');
  const fallbackEl = document.getElementById('ar-fallback-message');

  const lines = [
    'userAgent: ' + ua,
    'סוג מכשיר (זיהוי גס לפי userAgent): ' + deviceType,
    'גרסת Android (אם רלוונטי): ' + (androidMatch ? androidMatch[1] : '(לא זוהתה)'),
    'גרסת Chrome (אם רלוונטי, מ-UA בלבד): ' + (chromeMatch ? chromeMatch[1] : '(לא זוהתה)'),
    'כתובת GLB מלאה: ' + (absoluteGlbUrl || '(אין)'),
    'תוצאת טעינת GLB (HEAD request): ' + glbLoadResult,
    'ar-status נוכחי (attribute על model-viewer): ' + (mv ? (mv.getAttribute('ar-status') || '(none)') : '(אין model-viewer)'),
    'canActivateAR: ' + (mv ? String(!!mv.canActivateAR) : '(אין model-viewer)'),
    'WebXR immersive-ar נתמך: ' + webxrSupported,
    'הודעת שגיאה מלאה (אם יש): ' + ((errorEl && errorEl.textContent) || '(אין)'),
    'fallback (תלת-ממד רגיל במקום AR) הופעל: ' + ((fallbackEl && fallbackEl.hidden === false) ? 'כן' : 'לא'),
  ];
  content.textContent = lines.join('\n');
  panel.hidden = false;
}

function setupArDebugClose() {
  const closeBtn = document.getElementById('ar-debug-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const panel = document.getElementById('ar-debug-panel');
      if (panel) panel.hidden = true;
    });
  }
}

function setupQrLandingButtons() {
  const qrArButton = document.getElementById('qr-ar-button');
  const iosLink = document.getElementById('qr-ios-ar-link');
  const continueButton = document.getElementById('qr-landing-continue');

  if (iosLink) {
    // לא preventDefault ולא await/setTimeout — רק רישום אבחון, Safari
    // עצמו מטפל בפתיחת Quick Look באופן טבעי דרך rel="ar"+href.
    iosLink.addEventListener('click', () => {
      logArDiag('קליק על קישור Quick Look טבעי: href=' + iosLink.getAttribute('href'));
    });
  }

  if (qrArButton) {
    qrArButton.addEventListener('click', () => {
      const mv = document.getElementById('ar-model-viewer');
      logArDiag('קליק על "הצג ב-AR": canActivateAR=' + (mv && mv.canActivateAR) + ' src=' + (mv && mv.getAttribute('src')));
      // קריאה סינכרונית ישירה מתוך מאזין הקליק — לא אחרי await/setTimeout —
      // כדי לא לעקוף את דרישת הג'סטורה של הדפדפן להפעלת מצלמה/AR.
      if (mv && typeof mv.activateAR === 'function') {
        const result = mv.activateAR();
        if (result && typeof result.catch === 'function') {
          result.catch((err) => logArDiag('activateAR() נכשלה: ' + (err && err.message ? err.message : err)));
        }
      } else {
        logArDiag('activateAR() לא קיימת על האלמנט — model-viewer לא נטען כראוי');
      }
    });
  }
  if (continueButton) {
    continueButton.addEventListener('click', exitQrArLanding);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupArAvailabilityWatcher();
  setupQrLandingButtons();
});
