import React, { useState, useEffect } from "react";
import { Zap, Clock, Sparkles, TrendingUp, AlertTriangle, ArrowLeft } from "lucide-react";
import { getFormFields, addSubmission, sendToGoogleSheet, sendWhatsAppNotification } from "@/lib/formSubmissions";

const RETURNING_USER_KEY = 'ecoshoham_chat_user';

export default function UrgencyOffer() {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const f = getFormFields();
    setFields(f);
    // Initialize formData with empty strings
    const init = {};
    f.forEach(field => { init[field.id] = ''; });
    // Try to restore saved user data
    try {
      const saved = localStorage.getItem(RETURNING_USER_KEY);
      if (saved) {
        const userData = JSON.parse(saved);
        if (userData.firstName) init.firstName = userData.firstName;
        if (userData.lastName) init.lastName = userData.lastName;
        if (userData.phone) init.phone = userData.phone;
        if (userData.school) init.school = userData.school;
        // Support old format
        if (userData.name && !userData.firstName) {
          const parts = userData.name.trim().split(/\s+/);
          init.firstName = parts[0] || '';
          init.lastName = parts.slice(1).join(' ') || '';
        }
        if (userData.teacherPhone && !userData.phone) {
          init.phone = userData.teacherPhone;
        }
      }
    } catch (e) {}
    setFormData(init);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    const missing = fields.filter(f => f.required && !formData[f.id]);
    if (missing.length) {
      alert(`נא למלא את כל השדות:\n${missing.map(f => '• ' + f.label).join('\n')}`);
      return;
    }

    // Validate email format
    const emailFields = fields.filter(f => f.type === 'email');
    for (const f of emailFields) {
      if (formData[f.id] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[f.id])) {
        alert(`כתובת מייל לא תקינה בשדה "${f.label}". נדרש פורמט: example@domain.com`);
        return;
      }
    }

    // Validate phone/number fields
    const telFields = fields.filter(f => f.type === 'tel');
    for (const f of telFields) {
      if (formData[f.id] && !/^[\d\-\+\(\)\s]+$/.test(formData[f.id])) {
        alert(`השדה "${f.label}" חייב להכיל מספרים בלבד`);
        return;
      }
    }

    setSending(true);

    // 1. Save to dashboard (localStorage) — immediately available in admin
    addSubmission(formData);

    // 2. Send to Google Sheet
    sendToGoogleSheet(formData);

    // 3. Save returning user info
    try {
      localStorage.setItem(RETURNING_USER_KEY, JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        school: formData.school,
        formCompleted: true,
      }));
    } catch (e) {}

    // 4. Send automatic WhatsApp notification to admin (via CallMeBot)
    sendWhatsAppNotification(formData);

    setSending(false);
    setSubmitted(true);
  };

  const textFields = fields.filter(f => f.type !== 'select');
  const selectFields = fields.filter(f => f.type === 'select');

  return (
    <section id="urgency-offer" className="py-12 sm:py-16 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/85" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-tl from-accent/10 to-transparent" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 shadow-lg shadow-accent/40 animate-pulse">
            <Zap className="w-4 h-4 fill-current" />
            אספקה מיידית - לפני הבגרות
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white text-center leading-tight mb-6 drop-shadow-lg">
          נלחמים בזמן? הפכו את תרגום החלבון{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent">ממופשט למוחשי</span>
          {" "}- כבר בשיעור הקרוב!
        </h2>
        <div className="rounded-2xl overflow-hidden shadow-2xl mb-6 max-w-[300px] mx-auto border-2 border-white/10 aspect-[9/16] bg-black/20">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover block">
            <source src="/videos/kit-demo.mp4" type="video/mp4" />
          </video>
        </div>
        <blockquote className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 my-6 max-w-3xl mx-auto">
          <p className="text-foreground/80 leading-relaxed text-sm sm:text-base mb-3 italic">
            "היה לי מעט מאוד זמן ולא ידעתי איך אצליח ללמד את השלבים השונים... המשחק הזה פשוט חסך לי שעות הוראה. מה שהידיים משחקות והעיניים רואות - עובד טוב יותר מכל מצגת. במבחן המתכונת, אחוז התלמידים שענו נכון על שאלת התרגום היה גבוה במיוחד!"
          </p>
          <footer className="text-sm font-semibold text-primary">- מורה לביולוגיה</footer>
        </blockquote>
        <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-4 drop-shadow">
          למה הערכה שלנו היא ה-"פיצוח" שחיפשת לבגרות?
        </h3>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-2xl border border-white/20">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <h4 className="font-bold text-primary mb-1 text-sm sm:text-base">חיסכון בזמן</h4>
            <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">הבנה עמוקה של תהליכים מורכבים במינימום זמן.</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-2xl border border-white/20">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <h4 className="font-bold text-primary mb-1 text-sm sm:text-base">ביטחון לתלמידים</h4>
            <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">עוברים מ"חומר לא מובן" לשליטה מלאה במנגנון.</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-2xl border border-white/20">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <h4 className="font-bold text-primary mb-1 text-sm sm:text-base">הוכחה בשטח</h4>
            <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">שיפור משמעותי בתוצאות המבחנים והמתכונות.</p>
          </div>
        </div>

        {/* Dynamic Form */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-accent/40 p-5 sm:p-6">
          <div className="flex items-center justify-center gap-2 mb-4 text-accent">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-sm sm:text-base">מורות ומורים, הזמינו ערכה לשנת הלימודים הקרובה!</span>
          </div>
          <p className="text-foreground/80 mb-4 text-sm sm:text-base text-center">
            מלאו את הפרטים ונחזור אליכם בהקדם:
          </p>

          {/* Text/Tel/Email inputs */}
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {textFields.map(field => (
              <input
                key={field.id}
                type={field.type}
                name={field.id}
                placeholder={field.placeholder || field.label + (field.required ? ' *' : '')}
                value={formData[field.id] || ''}
                onChange={handleInputChange}
                dir={field.type === 'email' ? 'ltr' : 'rtl'}
                inputMode={field.type === 'tel' ? 'numeric' : field.type === 'email' ? 'email' : 'text'}
                pattern={field.type === 'tel' ? '[0-9\\-\\+\\(\\)\\s]*' : undefined}
                className={`px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent ${field.type === 'email' ? 'text-left placeholder:text-right' : 'text-right'}`}
                required={field.required}
              />
            ))}
          </div>

          {/* Select inputs */}
          {selectFields.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {selectFields.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-foreground/70 mb-1 text-right">{field.label}</label>
                  <select
                    name={field.id}
                    value={formData[field.id] || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent bg-white text-right"
                  >
                    <option value="">{field.placeholder || 'בחרו'}</option>
                    {(field.options || []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-foreground/50 text-center mb-4">
            חדש! סדנא למורים ולתלמידים להמחשת תוכן לימודי ומנגנונים ביולוגיים בעזרת טכנולוגיות תלת מימד (מדפסת ועט תלת מימד) בשילוב AI — מתאים לביוחקר ולכל מורה שרוצה להמחיש מנגנונים ביולוגיים.
          </p>

          <div className="text-center">
            {submitted ? (
              <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 text-center">
                <p className="text-secondary font-bold text-lg mb-1">הפרטים נשלחו בהצלחה!</p>
                <p className="text-sm text-foreground/60">נחזור אליכם בהקדם. תודה!</p>
                <button
                  onClick={() => { setSubmitted(false); setFormData(Object.fromEntries(fields.map(f => [f.id, '']))); }}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  שלח טופס נוסף
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={sending}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 active:bg-accent/80 text-accent-foreground font-bold rounded-full px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg shadow-xl shadow-accent/30 hover:shadow-2xl transition-all duration-300 cursor-pointer touch-manipulation min-h-[48px] disabled:opacity-50"
              >
                {sending ? 'שולח...' : 'שלח'}
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
