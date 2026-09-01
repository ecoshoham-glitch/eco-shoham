// מקור אמת יחיד לצבעי CPK — משמש את כל התצוגות (דפדפן/3Dmol.js דרך
// molecule-viewer.js, GLB/USDZ דרך tools/glb-export.mjs, ולכן גם
// Android Scene Viewer/WebXR ו-Apple Quick Look, שכולם קוראים מאותם
// קובצי GLB/USDZ). אסור להגדיר ערכי hex נפרדים במקום אחר בפרויקט —
// כל שינוי צבע CPK צריך לקרות רק כאן, ולהתפשט אוטומטית לכל התצוגות
// (אחרי הרצה מחדש של tools/build-ar-assets.mjs + tools/build-usdz-
// assets.mjs לחידוש קובצי ה-GLB/USDZ עצמם).
const CPK_HEX = {
  C: '909090', // פחמן — אפור כהה
  H: 'ffffff', // מימן — לבן
  O: 'ff0d0d', // חמצן — אדום
  N: '3050f8', // חנקן — כחול
  S: 'ffff30', // גופרית — צהוב
};
// יסוד לא-צפוי בפרויקט הזה (כרגע אף חומצה לא מכילה יסוד מחוץ ל-CPK_HEX
// למעלה) — ורוד, כדי שיהיה בולט/מזוהה מיד אם משהו משתבש.
const CPK_UNKNOWN_HEX = 'ff69b4';
