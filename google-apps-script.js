// ===========================================================
// Google Apps Script - הדבק את הקוד הזה ב-Google Sheets
// ===========================================================
// הוראות:
// 1. פתח את הגיליון: https://docs.google.com/spreadsheets/d/1ga6RfCoSJBtDmzqU2tSw8TGF5WMSgobw4DU33048-o0/edit
// 2. לחץ על Extensions > Apps Script
// 3. מחק את כל הקוד הקיים והדבק את הקוד הבא
// 4. לחץ Deploy > New deployment
// 5. בחר Type: Web app
// 6. הגדר Execute as: Me, Who has access: Anyone
// 7. לחץ Deploy
// 8. העתק את ה-URL שמתקבל
// 9. הדבק אותו בקובץ src/lib/formSubmissions.js בשורה GOOGLE_SCRIPT_URL
// ===========================================================

var NOTIFY_EMAIL = 'ecoshoham@gmail.com';

var CHATBOT_HEADERS = [
  'שם פרטי', 'שם משפחה', 'טלפון מורה', 'בית ספר', 'עיר',
  'סמל מוסד', 'מייל', 'סוג ערכה', 'גודל ערכה', 'עיתוי',
  'סדנה', 'אמצעי קשר', 'תאריך'
];

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function sendEmailNotification(v) {
  try {
    var fullName = (v.firstName + ' ' + v.lastName).trim() || 'לא צוין';
    var subject = '📋 פנייה חדשה מהבוט - ' + fullName;
    var body = [
      'פנייה חדשה מהבוט באתר ECOShoham:',
      '',
      'שם: ' + fullName,
      'טלפון: ' + (v.teacherPhone || 'לא צוין'),
      'בית ספר: ' + (v.school || 'לא צוין') + (v.schoolCity ? ', ' + v.schoolCity : ''),
      v.institutionCode ? 'סמל מוסד: ' + v.institutionCode : '',
      v.schoolEmail ? 'מייל: ' + v.schoolEmail : '',
      'ערכה: ' + (v.kitType || 'לא צוין') + (v.kitSize ? ' | ' + v.kitSize : ''),
      'עיתוי: ' + (v.timing || 'לא צוין'),
      v.workshop ? 'סדנה: ' + v.workshop : '',
      'אמצעי קשר: ' + (v.contactMethod || 'לא צוין'),
      '',
      'תאריך: ' + new Date().toLocaleString('he-IL'),
    ].filter(function(line) { return line !== ''; }).join('\n');

    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch (err) {
    Logger.log('Email notification failed: ' + err);
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.type === 'chatbot') {
      var sheet = getOrCreateSheet('פניות בוט');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(CHATBOT_HEADERS);
        sheet.getRange(1, 1, 1, CHATBOT_HEADERS.length).setFontWeight('bold');
      }
      var v = data.values;
      sheet.appendRow([
        v.firstName || '', v.lastName || '', v.teacherPhone || '',
        v.school || '', v.schoolCity || '', v.institutionCode || '',
        v.schoolEmail || '', v.kitType || '', v.kitSize || '',
        v.timing || '', v.workshop || '', v.contactMethod || '',
        new Date().toLocaleString('he-IL')
      ]);
      sendEmailNotification(v);
    } else {
      // Original form format
      var mainSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var fields = data.fields || [];
      if (mainSheet.getLastRow() === 0) {
        var headers = fields.map(function(f) { return f.label; });
        headers.push('תאריך הגשה');
        mainSheet.appendRow(headers);
      }
      var row = fields.map(function(f) { return (data.values && data.values[f.id]) ? data.values[f.id] : ''; });
      row.push(new Date().toLocaleString('he-IL'));
      mainSheet.appendRow(row);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
