const SUBMISSIONS_KEY = 'ecoshoham_form_submissions';
const FORM_FIELDS_KEY = 'ecoshoham_form_fields';

// After deploying the Google Apps Script, paste the URL here:
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxb3oAJ4k1qQJxT_hH0tnOF3doUplJRRGnlTgNPvxL6lgrUOVAN5sWlEzQX3U4rq94k/exec';

// CallMeBot WhatsApp API — see instructions below to get API key
// 1. Save +34 644 62 49 28 in your contacts as "CallMeBot"
// 2. Send "I allow callmebot to send me messages" to that number via WhatsApp
// 3. You'll get an API key — paste it here
const CALLMEBOT_PHONE = '972503366993';
const CALLMEBOT_API_KEY = ''; // paste your API key here

// Default form fields
const DEFAULT_FIELDS = [
  { id: 'firstName', label: 'שם המורה (פרטי)', type: 'text', required: true, placeholder: 'שם המורה (פרטי) *' },
  { id: 'lastName', label: 'שם משפחה', type: 'text', required: true, placeholder: 'שם משפחה *' },
  { id: 'phone', label: 'מס׳ טלפון של המורה', type: 'tel', required: true, placeholder: 'מס׳ טלפון של המורה *' },
  { id: 'contactEmail', label: 'מייל של איש הקשר', type: 'email', required: true, placeholder: 'מייל של איש הקשר *' },
  { id: 'school', label: 'שם בית הספר', type: 'text', required: true, placeholder: 'שם בית הספר *' },
  { id: 'schoolLocation', label: 'מיקום ביה״ס', type: 'text', required: true, placeholder: 'מיקום ביה״ס *' },
  { id: 'schoolPhone', label: 'מס׳ טלפון של בית הספר', type: 'tel', required: true, placeholder: 'מס׳ טלפון של בית הספר *' },
  { id: 'institutionCode', label: 'סמל מוסד', type: 'tel', required: true, placeholder: 'סמל מוסד *' },
  { id: 'kitType', label: 'סוג ערכה', type: 'select', required: true, placeholder: 'בחרו סוג ערכה *', options: [
    'ערכה A - לכיתות של כ-23 תלמידים',
    'ערכה B - לכיתות של כ-32 תלמידים',
    'בשתי הערכות'
  ]},
  { id: 'timing', label: 'למתי צריכים את הערכה', type: 'select', required: true, placeholder: 'בחרו מועד *', options: [
    'לשבוע הראשון של תשפ״ז',
    'מיד אחרי סוכות',
    'עד חנוכה'
  ]},
  { id: 'payment', label: 'צורת תשלום', type: 'select', required: true, placeholder: 'בחרו צורת תשלום *', options: [
    'דרך גפ״ן',
    'דרך תקציב ביה״ס',
    'דרך תקציב מגמה',
    'דרך תקציב מעבדות'
  ]},
  { id: 'workshopInterest', label: 'מעוניינים בסדנא בית ספרית?', type: 'select', required: true, placeholder: 'בחרו *', options: [
    'כן, מעוניינים',
    'לא כרגע',
    'רוצה לשמוע עוד פרטים'
  ]},
];

export function getFormFields() {
  try {
    const saved = localStorage.getItem(FORM_FIELDS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_FIELDS;
}

export function saveFormFields(fields) {
  localStorage.setItem(FORM_FIELDS_KEY, JSON.stringify(fields));
}

export function resetFormFields() {
  localStorage.removeItem(FORM_FIELDS_KEY);
}

export function getSubmissions() {
  try {
    const saved = localStorage.getItem(SUBMISSIONS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
}

export function addSubmission(data) {
  const submissions = getSubmissions();
  submissions.unshift({
    ...data,
    id: Date.now().toString(),
    submittedAt: new Date().toISOString(),
  });
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

export function deleteSubmission(id) {
  const submissions = getSubmissions().filter(s => s.id !== id);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  return submissions;
}

export function sendToGoogleSheet(formData) {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn('Google Script URL not configured. Set GOOGLE_SCRIPT_URL in formSubmissions.js');
    return Promise.resolve(false);
  }

  const fields = getFormFields();
  const payload = {
    fields: fields,
    values: formData,
  };

  return fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(() => true)
    .catch((err) => {
      console.error('Failed to send to Google Sheet:', err);
      return false;
    });
}

export function sendWhatsAppNotification(formData) {
  if (!CALLMEBOT_API_KEY) {
    console.warn('CallMeBot API key not configured. Set CALLMEBOT_API_KEY in formSubmissions.js');
    return Promise.resolve(false);
  }

  const name = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'לא צוין';
  const phone = formData.phone || 'לא צוין';
  const school = formData.school || 'לא צוין';
  const kit = formData.kitType || 'לא צוין';
  const payment = formData.payment || 'לא צוין';
  const isGapan = payment.includes('גפ') ? 'כן' : 'לא';

  const message = `📋 הזמנה חדשה מהאתר!
👤 ${name}
📱 ${phone}
🏫 ${school}
📦 ${kit}
💳 גפ״ן: ${isGapan}`;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_API_KEY}`;

  return fetch(url, { mode: 'no-cors' })
    .then(() => true)
    .catch((err) => {
      console.error('Failed to send WhatsApp notification:', err);
      return false;
    });
}

// Send chatbot form data to Google Sheets via Apps Script and save locally for admin page
export function sendChatbotSubmission(chatbotData) {
  const nameParts = (chatbotData.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const kitInfo = [chatbotData.kitType, chatbotData.kitSize].filter(v => v && v !== '—').join(' | ');

  // Save to localStorage so admin page can display it
  addSubmission({
    firstName,
    lastName,
    phone: chatbotData.teacherPhone || '',
    school: chatbotData.school || '',
    schoolLocation: chatbotData.schoolCity || '',
    institutionCode: chatbotData.institutionCode || '',
    contactEmail: chatbotData.schoolEmail || '',
    kitType: kitInfo || chatbotData.kitType || '',
    timing: chatbotData.timing || '',
    workshopInterest: chatbotData.workshop || '',
  });

  if (!GOOGLE_SCRIPT_URL) {
    console.warn('Google Script URL not configured. Set GOOGLE_SCRIPT_URL in formSubmissions.js');
    return Promise.resolve(false);
  }

  const payload = {
    type: 'chatbot',
    values: {
      firstName,
      lastName,
      teacherPhone: chatbotData.teacherPhone || '',
      school: chatbotData.school || '',
      schoolCity: chatbotData.schoolCity || '',
      institutionCode: chatbotData.institutionCode || '',
      schoolEmail: chatbotData.schoolEmail || '',
      kitType: chatbotData.kitType || '',
      kitSize: chatbotData.kitSize || '',
      timing: chatbotData.timing || '',
      workshop: chatbotData.workshop || '',
      contactMethod: chatbotData.contact_method || '',
    },
  };

  return fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(() => true)
    .catch((err) => {
      console.error('Failed to send chatbot data to Google Sheet:', err);
      return false;
    });
}

// Send automatic WhatsApp notification to Moti via CallMeBot when chatbot form is filled
export function sendChatbotWhatsApp(chatbotData) {
  if (!CALLMEBOT_API_KEY) {
    console.warn('CallMeBot API key not configured. Set CALLMEBOT_API_KEY in formSubmissions.js');
    return Promise.resolve(false);
  }

  const nameParts = (chatbotData.name || '').split(' ');
  const firstName = nameParts[0] || 'לא צוין';
  const lastName = nameParts.slice(1).join(' ') || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  const lines = [
    '📋 פנייה חדשה מהבוט!',
    `👤 ${fullName}`,
    `📱 ${chatbotData.teacherPhone || 'לא צוין'}`,
    chatbotData.school ? `🏫 ${chatbotData.school}${chatbotData.schoolCity ? ', ' + chatbotData.schoolCity : ''}` : null,
    chatbotData.institutionCode && chatbotData.institutionCode !== '—' ? `🔢 סמל: ${chatbotData.institutionCode}` : null,
    chatbotData.schoolEmail && chatbotData.schoolEmail !== '—' ? `✉️ ${chatbotData.schoolEmail}` : null,
    chatbotData.kitType ? `📦 ${chatbotData.kitType}${chatbotData.kitSize ? ' | ' + chatbotData.kitSize : ''}` : null,
    chatbotData.timing ? `⏰ ${chatbotData.timing}` : null,
    chatbotData.workshop && chatbotData.workshop !== '—' ? `🎓 סדנה: ${chatbotData.workshop}` : null,
  ].filter(Boolean);

  const message = lines.join('\n');
  const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_API_KEY}`;

  return fetch(url, { mode: 'no-cors' })
    .then(() => true)
    .catch((err) => {
      console.error('Failed to send chatbot WhatsApp notification:', err);
      return false;
    });
}

export function clearSubmissions() {
  localStorage.removeItem(SUBMISSIONS_KEY);
}

export function exportToExcel(submissions, fields) {
  if (!submissions.length) return;

  const headers = [
    ...fields.map(f => f.label),
    'תאריך הגשה'
  ];

  const rows = submissions.map(sub => [
    ...fields.map(f => sub[f.id] || ''),
    sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('he-IL') : ''
  ]);

  // BOM for Hebrew support in Excel
  let csv = '﻿';
  csv += headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ecoshoham-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
