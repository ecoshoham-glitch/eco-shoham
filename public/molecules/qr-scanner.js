// סורק QR בתוך האתר (מחוץ למצב AR): מאפשר לסרוק חומצת אמינו נוספת
// בלי לצאת מהדף, בלי לנווט לכתובת שנסרקה בפועל (רק מנתחים אותה
// ומחלצים ממנה aa), ובלי להישאר עם מצלמה פעילה ברקע. מעדיף BarcodeDetector
// הילידי (Chrome/Android; לא קיים ב-Safari/iOS נכון לכתיבת הקוד), ונופל
// בחזרה ל-jsQR — ספרייה מקומית (vendor/jsQR.js, לא CDN), נטענת בעצלנות
// (dynamic <script> מקומי) רק כשבאמת צריך אותה, כדי לא להוריד ~250KB
// למשתמשים שבהם BarcodeDetector כבר קיים.
//
// תלוי ב-handleQrScanSuccess (app.js), AMINO_ACIDS/AMINO_ACID_URL_CODES
// (amino-acids-data.js) — שני אלה טעונים לפני הקובץ הזה או אחריו, לא
// משנה, כי שום דבר כאן לא רץ ברמת המודול עצמו — רק בתגובה ללחיצת משתמש.

let activeQrStream = null;
let qrScanLoopHandle = null; // requestAnimationFrame id, לביטול הלולאה
let jsQrLoadPromise = null;

function isBarcodeDetectorSupported() {
  return typeof BarcodeDetector !== 'undefined';
}

function loadJsQr() {
  if (typeof jsQR !== 'undefined') return Promise.resolve();
  if (jsQrLoadPromise) return jsQrLoadPromise;
  jsQrLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'vendor/jsQR.js'; // מקומי בפרויקט — לא CDN, גם לא בזמן שימוש
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('טעינת ספריית jsQR המקומית נכשלה'));
    document.head.appendChild(script);
  });
  return jsQrLoadPromise;
}

// עוצרת את כל מסלולי המצלמה (MediaStreamTrack) וגם את לולאת הסריקה —
// נקראת בכל מסלול יציאה אפשרי (הצלחה/ביטול/שגיאה/יציאה מהעמוד), כדי
// שלעולם לא תישאר דליפת מצלמה פעילה ברקע.
function stopActiveQrStream() {
  if (qrScanLoopHandle !== null) {
    cancelAnimationFrame(qrScanLoopHandle);
    qrScanLoopHandle = null;
  }
  if (activeQrStream) {
    activeQrStream.getTracks().forEach((track) => track.stop());
    activeQrStream = null;
  }
}

const QR_CONTENT_REJECTED_MESSAGE = 'קוד ה-QR אינו מכיל חומצה אמינית מוכרת.';

// מקבלת רק כתובות HTTPS השייכות לאתר הזה (window.location.origin —
// בפרודקשן זה בדיוק https://ecoshoham.netlify.app, בלי הקשחה של מחרוזת
// קבועה) עם פרמטר aa תקין. לא מנווטת לכתובת שהתקבלה בכלל — מנתחת אותה
// כטקסט בלבד ומחלצת ממנה מזהה פנימי, בדיוק לפי דרישת האבטחה במפרט.
function validateQrContent(text) {
  let url;
  try {
    url = new URL(text);
  } catch (err) {
    return { ok: false, reason: QR_CONTENT_REJECTED_MESSAGE };
  }
  if (url.protocol !== 'https:') return { ok: false, reason: QR_CONTENT_REJECTED_MESSAGE };
  if (url.origin !== window.location.origin) return { ok: false, reason: QR_CONTENT_REJECTED_MESSAGE };

  const rawCode = url.searchParams.get('aa');
  if (!rawCode) return { ok: false, reason: QR_CONTENT_REJECTED_MESSAGE };

  const internalId = AMINO_ACID_URL_CODES[rawCode.trim().toLowerCase()];
  if (!internalId || !AMINO_ACIDS[internalId]) return { ok: false, reason: QR_CONTENT_REJECTED_MESSAGE };

  return { ok: true, internalId };
}

function showQrScannerError(message) {
  const el = document.getElementById('qr-scanner-error');
  if (el) {
    el.textContent = message;
    el.hidden = false;
  }
}

function hideQrScannerError() {
  const el = document.getElementById('qr-scanner-error');
  if (el) el.hidden = true;
}

// סוגרת את הסורק בכל מקרה (הצלחה/ביטול/שגיאה/יציאה מהעמוד) — עוצרת
// מצלמה ומסתירה את השכבה. לא מסתירה הודעת שגיאה קודמת אם קיימת (רק
// closeQrScanner "רגיל", למשל לחיצת ביטול, מנקה גם אותה).
function closeQrScanner() {
  stopActiveQrStream();
  const overlay = document.getElementById('qr-scanner-overlay');
  if (overlay) overlay.hidden = true;
  hideQrScannerError();
}

async function startQrScan() {
  const overlay = document.getElementById('qr-scanner-overlay');
  const video = document.getElementById('qr-scanner-video');
  if (!overlay || !video) return;

  hideQrScannerError();
  overlay.hidden = false;

  let stream;
  try {
    // facingMode: "environment" — מצלמה אחורית, לא המצלמה הקדמית.
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  } catch (err) {
    // דחיית הרשאה או היעדר מצלמה — הודעה ברורה, לא נשאר תלוי.
    showQrScannerError('לא ניתן לגשת למצלמה (ההרשאה נדחתה או שאין מצלמה זמינה).');
    return;
  }

  activeQrStream = stream;
  video.srcObject = stream;
  try {
    await video.play();
  } catch (err) {
    // חלק מהדפדפנים דורשים ג'סטורה נוספת — לא קריטי, video.play() ייכשל
    // בשקט וה-video עדיין יתחיל להציג תמונה ברגע שהמשתמש נוגע במסך.
  }

  if (isBarcodeDetectorSupported()) {
    runBarcodeDetectorLoop(video);
    return;
  }

  try {
    await loadJsQr();
  } catch (err) {
    showQrScannerError('טעינת ספריית הסריקה המקומית נכשלה.');
    stopActiveQrStream();
    return;
  }
  // ייתכן שהמשתמש לחץ "ביטול" בזמן טעינת jsQR — לא מתחילים לסרוק לריק.
  if (!activeQrStream) return;
  runJsQrLoop(video);
}

// מטפלת בטקסט שפוענח מקוד QR (מכל אחד משני מנועי הזיהוי): מאמתת, ואם
// תקין — עוצרת את המצלמה מיד וקוראת ל-handleQrScanSuccess (app.js).
// קוד לא תקין רק מציג הודעה וממשיך לסרוק — לא סוגר את המצלמה על טעות.
function handleDecodedQrText(text) {
  const result = validateQrContent(text);
  if (!result.ok) {
    showQrScannerError(result.reason);
    return;
  }
  stopActiveQrStream();
  const overlay = document.getElementById('qr-scanner-overlay');
  if (overlay) overlay.hidden = true;
  hideQrScannerError();
  handleQrScanSuccess(result.internalId); // מוגדרת ב-app.js
}

function runBarcodeDetectorLoop(video) {
  const detector = new BarcodeDetector({ formats: ['qr_code'] });
  const tick = async () => {
    if (!activeQrStream) return; // הופסק (ביטול/הצלחה/שגיאה) — לא ממשיכים
    try {
      const codes = await detector.detect(video);
      if (codes.length > 0) {
        handleDecodedQrText(codes[0].rawValue);
        if (!activeQrStream) return; // handleDecodedQrText כבר עצר בהצלחה
      }
    } catch (err) {
      // שגיאת זיהוי בפריים בודד — לא עוצרים את כל הסריקה בגללה.
    }
    qrScanLoopHandle = requestAnimationFrame(tick);
  };
  qrScanLoopHandle = requestAnimationFrame(tick);
}

function runJsQrLoop(video) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const tick = () => {
    if (!activeQrStream) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        handleDecodedQrText(code.data);
        if (!activeQrStream) return;
      }
    }
    qrScanLoopHandle = requestAnimationFrame(tick);
  };
  qrScanLoopHandle = requestAnimationFrame(tick);
}

function setupQrScannerUi() {
  const scanMoreBtn = document.getElementById('qr-scan-more-button');
  const cancelBtn = document.getElementById('qr-scanner-cancel');
  if (scanMoreBtn) scanMoreBtn.addEventListener('click', startQrScan);
  if (cancelBtn) cancelBtn.addEventListener('click', closeQrScanner);
}

// רשתות ביטחון נוספות (מעבר לעצירה המפורשת בכל מסלול הצלחה/ביטול/שגיאה
// למעלה): לעולם לא משאירים מצלמה פעילה ברקע — לא כשהדף עובר לרקע
// (Quick Look/Scene Viewer נפתחים, מעבר אפליקציות) ולא כשהוא נסגר לגמרי.
window.addEventListener('pagehide', closeQrScanner);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') closeQrScanner();
});
