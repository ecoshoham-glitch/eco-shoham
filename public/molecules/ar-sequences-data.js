// טבלת רצפים בעלי-שם ל-AR (בניגוד ל-AMINO_ACIDS, שהיא חומצה חופשית
// בודדת בלבד). כל ערך כאן מייצג שרשרת פפטידית מאוחדת (עם קשר פפטידי
// אמיתי, לא שתי חומצות נפרדות זו ליד זו) שיש לה קובצי GLB/USDZ סטטיים
// משלה, ומופעלת דרך ?sequence=<key> בכתובת (למשל ?sequence=gly-gly).
//
// זהו שלב הוכחת-היתכנות: תומך רק ברצפים מוגדרים-מראש (לא במנגנון כללי
// דינמי לכל רצף אפשרי — זה עדיין בתכנון, ראו תיעוד ההחלטה בשיחה). כדי
// להוסיף רצף נוסף בעתיד:
//   1. להוסיף כאן ערך חדש (ids בסדר N->C, בדיוק כמו ל-buildPeptide).
//   2. להריץ tools/build-ar-assets.mjs ואז tools/build-usdz-assets.mjs
//      מחדש — הם קוראים את הטבלה הזו אוטומטית ובונים glb/usdz תואמים.
// אין צורך בשינוי קוד נוסף בשום מקום אחר.
const AR_SEQUENCES = {
  'gly-gly': {
    ids: ['gly', 'gly'],
    glb: 'molecules/gly-gly.glb',
    usdz: 'molecules/gly-gly.usdz',
    he: 'גליצין-גליצין (דיפפטיד)',
    en: 'Glycine-Glycine (dipeptide)',
    three: 'Gly–Gly',
  },
  'gly-ala': {
    ids: ['gly', 'ala'],
    glb: 'molecules/gly-ala.glb',
    usdz: 'molecules/gly-ala.usdz',
    he: 'גליצין-אלנין (דיפפטיד)',
    en: 'Glycine-Alanine (dipeptide)',
    three: 'Gly–Ala',
  },
  'gly-ala-ser': {
    ids: ['gly', 'ala', 'ser'],
    glb: 'molecules/gly-ala-ser.glb',
    usdz: 'molecules/gly-ala-ser.usdz',
    he: 'גליצין-אלנין-סרין (טריפפטיד)',
    en: 'Glycine-Alanine-Serine (tripeptide)',
    three: 'Gly–Ala–Ser',
  },
};
