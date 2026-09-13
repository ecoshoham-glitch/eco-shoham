// בדיקות להפניית קודי QR ישנים (/?aa=xxx, /?sequence=xxx) ל-/molecules/.
// הרצה: node tests/legacy-qr-redirect.test.mjs (אין תלות חדשה בפרויקט —
// בכוונה לא Playwright/כלי דפדפן, כדי לא להוסיף devDependency בלי אישור
// מפורש. הבדיקה הזו מכסה את לוגיקת ההחלטה הטהורה בלבד — בדיקת דפדפן
// אמיתי מלאה-עד-מלאה (ניווט בפועל, טעינת GLB/USDZ מ-/molecules/molecules/,
// אפס שגיאות קונסולה) בוצעה ידנית מול netlify-cli dev + Playwright,
// ותוצאותיה דווחו בנפרד; היא לא נכללת כאן.
//
// shouldRedirectToMolecules() כאן היא העתק מדויק של הלוגיקה שב-
// index.html (<script> בתוך <head>) — אם היא משתנה שם, יש לעדכן גם כאן.
// לא ייבוא משותף כי סקריפט ההפניה חייב להישאר עצמאי וסינכרוני, רץ ממש
// בתחילת <head> לפני טעינת כל משאב אחר, ולא כדאי להפוך אותו לתלוי במודול.

const VALID_AA = ['gly', 'ala', 'ser', 'phe'];
const VALID_SEQUENCES = ['gly-gly', 'gly-ala', 'gly-ala-ser'];

function shouldRedirectToMolecules(pathname, search) {
  if (pathname.indexOf('/molecules/') === 0) return { redirect: false, reason: 'already under /molecules/' };

  const params = new URLSearchParams(search);
  const aa = params.get('aa');
  const sequence = params.get('sequence');
  const aaValid = aa !== null && VALID_AA.indexOf(aa.trim().toLowerCase()) !== -1;
  const sequenceValid = sequence !== null && VALID_SEQUENCES.indexOf(sequence.trim().toLowerCase()) !== -1;

  if (aaValid || sequenceValid) {
    return { redirect: true, destination: '/molecules/' + search };
  }
  return { redirect: false, reason: 'no valid aa/sequence' };
}

let passed = 0, failed = 0;
function check(name, fn) {
  try {
    const result = fn();
    if (result === true) { passed++; console.log('  [PASS] ' + name); }
    else { failed++; console.log('  [FAIL] ' + name + ' -- ' + result); }
  } catch (err) {
    failed++;
    console.log('  [FAIL] ' + name + ' -- חריגה: ' + err.message);
  }
}

console.log('\n--- 1+8: כתובות QR ישנות (aa) מופנות ---');
for (const aa of ['gly', 'ala', 'ser', 'phe']) {
  check('?aa=' + aa + ' -> מפנה ל-/molecules/?aa=' + aa, () => {
    const r = shouldRedirectToMolecules('/', '?aa=' + aa);
    return (r.redirect === true && r.destination === '/molecules/?aa=' + aa) || JSON.stringify(r);
  });
}
check('?AA=GLY (אותיות גדולות) -> עדיין מתקבל (מנורמל)', () => {
  const r = shouldRedirectToMolecules('/', '?aa=GLY');
  return r.redirect === true || JSON.stringify(r);
});

console.log('\n--- 2: פרמטר sequence מועבר בשלמותו ---');
for (const seq of ['gly-gly', 'gly-ala', 'gly-ala-ser']) {
  check('?sequence=' + seq + ' -> מפנה ל-/molecules/?sequence=' + seq, () => {
    const r = shouldRedirectToMolecules('/', '?sequence=' + seq);
    return (r.redirect === true && r.destination === '/molecules/?sequence=' + seq) || JSON.stringify(r);
  });
}

console.log('\n--- 3: פרמטרים נוספים נשמרים בשלמותם (לא רק aa/sequence) ---');
check('?aa=gly&debug=ar -> שני הפרמטרים עוברים יחד', () => {
  const r = shouldRedirectToMolecules('/', '?aa=gly&debug=ar');
  return (r.redirect === true && r.destination === '/molecules/?aa=gly&debug=ar') || JSON.stringify(r);
});

console.log('\n--- 4: כניסה רגילה ל-/ (בלי פרמטרים) אינה מופנית ---');
check('/ בלי query כלל -> לא מפנה', () => {
  const r = shouldRedirectToMolecules('/', '');
  return r.redirect === false || JSON.stringify(r);
});
check('/ עם query לא-קשור (למשל ?utm_source=x) -> לא מפנה', () => {
  const r = shouldRedirectToMolecules('/', '?utm_source=newsletter');
  return r.redirect === false || JSON.stringify(r);
});

console.log('\n--- 6: אין לולאת הפניה — נתיב שכבר תחת /molecules/ לעולם לא מופנה ---');
check('/molecules/ עם ?aa=gly -> לא מפנה (כבר שם)', () => {
  const r = shouldRedirectToMolecules('/molecules/', '?aa=gly');
  return r.redirect === false || JSON.stringify(r);
});
check('/molecules/index.html עם ?aa=gly -> לא מפנה', () => {
  const r = shouldRedirectToMolecules('/molecules/index.html', '?aa=gly');
  return r.redirect === false || JSON.stringify(r);
});

console.log('\n--- 7: קלט לא חוקי לעולם לא עובר הלאה ---');
check('?aa=xxx (לא ברשימה) -> לא מפנה', () => {
  const r = shouldRedirectToMolecules('/', '?aa=xxx');
  return r.redirect === false || JSON.stringify(r);
});
check('?aa= (ריק) -> לא מפנה', () => {
  const r = shouldRedirectToMolecules('/', '?aa=');
  return r.redirect === false || JSON.stringify(r);
});
check('?aa=<script>alert(1)</script> -> לא מפנה, אין החדרת תוכן', () => {
  const r = shouldRedirectToMolecules('/', '?aa=' + encodeURIComponent('<script>alert(1)</script>'));
  return r.redirect === false || JSON.stringify(r);
});
check('?sequence=not-a-real-sequence -> לא מפנה', () => {
  const r = shouldRedirectToMolecules('/', '?sequence=not-a-real-sequence');
  return r.redirect === false || JSON.stringify(r);
});
check('?sequence=gly-gly-gly-gly (לא ברשימה למרות שדומה) -> לא מפנה', () => {
  const r = shouldRedirectToMolecules('/', '?sequence=gly-gly-gly-gly');
  return r.redirect === false || JSON.stringify(r);
});

console.log('\n=== סיכום legacy-qr-redirect: ' + passed + ' עברו, ' + failed + ' נכשלו ===');
process.exit(failed > 0 ? 1 : 0);
