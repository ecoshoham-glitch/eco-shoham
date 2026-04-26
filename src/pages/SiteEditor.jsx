import React, { useState } from 'react';
import { getSiteContent, setSiteContent, resetSiteContent, defaultContent } from '@/lib/siteContent';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, RotateCcw, Image, Type, ChevronDown, ChevronUp, Lock } from 'lucide-react';

const SECTIONS = [
  {
    key: 'hero',
    label: 'אזור פתיחה (Hero)',
    fields: [
      { key: 'badge', label: 'תג עליון', type: 'text' },
      { key: 'title', label: 'כותרת ראשית', type: 'text' },
      { key: 'subtitle', label: 'כותרת משנה', type: 'text' },
      { key: 'description', label: 'תיאור', type: 'textarea' },
      { key: 'image', label: 'תמונה (URL)', type: 'image' },
      { key: 'cta_primary', label: 'כפתור ראשי', type: 'text' },
      { key: 'cta_secondary', label: 'כפתור משני', type: 'text' },
    ],
  },
  {
    key: 'about',
    label: 'אודות',
    fields: [
      { key: 'title', label: 'כותרת', type: 'text' },
      { key: 'description', label: 'תיאור', type: 'textarea' },
    ],
  },
  {
    key: 'scienceProof',
    label: 'הוכחה מדעית',
    fields: [
      { key: 'stat', label: 'מספר סטטיסטי (כגון 55%)', type: 'text' },
      { key: 'statLabel', label: 'תיאור הסטטיסטיקה', type: 'text' },
      { key: 'title', label: 'כותרת', type: 'text' },
      { key: 'description', label: 'תיאור', type: 'textarea' },
    ],
  },
  {
    key: 'contact',
    label: 'יצירת קשר',
    fields: [
      { key: 'email', label: 'אימייל', type: 'text' },
      { key: 'whatsapp', label: 'קישור וואטסאפ', type: 'text' },
      { key: 'whatsappText', label: 'טקסט כפתור וואטסאפ', type: 'text' },
    ],
  },
  {
    key: 'stats',
    label: 'נתונים סטטיסטיים',
    fields: [
      { key: 'schools', label: 'בתי ספר', type: 'text' },
      { key: 'students', label: 'תלמידים', type: 'text' },
      { key: 'satisfaction', label: 'שביעות רצון', type: 'text' },
    ],
  },
];

function SectionEditor({ section, values, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-muted/40 hover:bg-muted/70 transition-colors text-right"
      >
        <span className="font-bold text-primary">{section.label}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="p-5 space-y-4 bg-white">
          {section.fields.map(field => (
            <div key={field.key}>
              <label className="flex items-center gap-1.5 text-sm font-semibold mb-1.5 text-foreground/80">
                {field.type === 'image' ? <Image className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={values[field.key] || ''}
                  onChange={e => onChange(field.key, e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              ) : field.type === 'image' ? (
                <div className="space-y-2">
                  <Input
                    value={values[field.key] || ''}
                    onChange={e => onChange(field.key, e.target.value)}
                    placeholder="הדבק URL של תמונה"
                    className="rounded-xl"
                  />
                  {values[field.key] && (
                    <img src={values[field.key]} alt="preview" className="w-full max-h-40 object-cover rounded-xl border border-border" onError={e => e.currentTarget.style.display = 'none'} />
                  )}
                </div>
              ) : (
                <Input
                  value={values[field.key] || ''}
                  onChange={e => onChange(field.key, e.target.value)}
                  className="rounded-xl"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteEditor() {
  const { user } = useAuth();
  const [content, setContent] = useState(getSiteContent);
  const [saved, setSaved] = useState(false);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary">גישה מוגבלת</h2>
          <p className="text-muted-foreground mt-2">רק מנהלים יכולים לגשת לפאנל העריכה</p>
        </div>
      </div>
    );
  }

  const handleChange = (section, key, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSiteContent(content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('האם לאפס את כל התוכן לברירת המחדל?')) {
      resetSiteContent();
      setContent(defaultContent);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 font-heebo" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-primary">פאנל עריכת תוכן</h1>
            <p className="text-xs text-muted-foreground">השינויים נשמרים בדפדפן</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5">
              <RotateCcw className="w-3.5 h-3.5" />
              אפס
            </Button>
            <Button size="sm" onClick={handleSave} className={`gap-1.5 ${saved ? 'bg-secondary' : 'bg-primary'}`}>
              <Save className="w-3.5 h-3.5" />
              {saved ? 'נשמר!' : 'שמור'}
            </Button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {SECTIONS.map(section => (
          <SectionEditor
            key={section.key}
            section={section}
            values={content[section.key] || {}}
            onChange={(key, value) => handleChange(section.key, key, value)}
          />
        ))}

        <div className="pt-2 pb-8 text-center">
          <a href="/" className="text-sm text-primary hover:underline">← חזור לאתר</a>
        </div>
      </div>
    </div>
  );
}