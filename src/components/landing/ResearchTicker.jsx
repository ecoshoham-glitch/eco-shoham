import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, Zap, BarChart3, Lightbulb, Award, ChevronRight, ChevronLeft } from 'lucide-react';

const WIDGETS = [
  { icon: BarChart3, color: 'text-white', bg: 'bg-white/20', gradient: 'from-secondary to-secondary/80', image: '/images/8580f0529_generated_image.png', text: 'מחקר PNAS: למידה אקטיבית מפחיתה כישלון ב-55% לעומת הרצאות פרונטליות (Freeman et al., 2014)' },
  { icon: Brain, color: 'text-white', bg: 'bg-white/20', gradient: 'from-accent to-accent/80', image: '/images/070a4bb6b_generated_image.png', text: 'Embodied Cognition: מגע פיזי יוצר עוגני זיכרון חזקים פי 3 לעומת קריאה בלבד' },
  { icon: Lightbulb, color: 'text-white', bg: 'bg-white/20', gradient: 'from-primary to-primary/80', image: '/images/705cab2ce_generated_image.png', text: 'CBE Life Sciences: מודלים תלת-מימדיים משפרים הבנת תהליכים תאיים ב-40%' },
  { icon: Zap, color: 'text-white', bg: 'bg-white/20', gradient: 'from-secondary to-primary', image: '/images/0e5a81c0a_generated_image.png', text: 'Journal of Chemical Education: מודלים מוחשיים מפחיתים תפיסות שגויות ב-62%' },
  { icon: Award, color: 'text-white', bg: 'bg-white/20', gradient: 'from-accent to-secondary', image: '/images/b6e1f5008_generated_image.png', text: 'מחקר ב-Science Education: תלמידים שלמדו עם מודלים 3D קיבלו ציון גבוה ב-1.5 יחידות בממוצע' },
  { icon: BookOpen, color: 'text-white', bg: 'bg-white/20', gradient: 'from-primary to-accent', image: '/images/0ee75d906_generated_image.png', text: 'Freeman et al. 2014: למידה אקטיבית מגדילה ציוני מבחן ב-6% — שווה ערך לשנת לימוד נוספת' },
  { icon: Brain, color: 'text-white', bg: 'bg-white/20', gradient: 'from-secondary to-secondary/80', image: '/images/8580f0529_generated_image.png', text: 'Cognitive Load Theory: הפחתת עומס קוגניטיבי דרך ראייה תלת-מימדית משפרת שימור ידע ב-35%' },
  { icon: BarChart3, color: 'text-white', bg: 'bg-white/20', gradient: 'from-accent to-accent/80', image: '/images/070a4bb6b_generated_image.png', text: 'מחקר אוניברסיטת הרווארד: 80% מהתלמידים שלמדו עם מודלים פיזיים דיווחו על עניין גבוה יותר' },
  { icon: Lightbulb, color: 'text-white', bg: 'bg-white/20', gradient: 'from-primary to-primary/80', image: '/images/705cab2ce_generated_image.png', text: 'Experiential Learning (Kolb): למידה התנסותית מגדילה העברת ידע להקשרים חדשים ב-45%' },
  { icon: Zap, color: 'text-white', bg: 'bg-white/20', gradient: 'from-secondary to-primary', image: '/images/0e5a81c0a_generated_image.png', text: 'מחקר בריטי 2022: כיתות עם למידה אקטיבית השיגו תוצאות טובות יותר ב-70% מהמקצועות' },
  { icon: Award, color: 'text-white', bg: 'bg-white/20', gradient: 'from-accent to-secondary', image: '/images/b6e1f5008_generated_image.png', text: 'Active Learning Consortium: מורים שהשתמשו במודלים 3D דיווחו על עלייה של 50% במעורבות תלמידים' },
  { icon: BookOpen, color: 'text-white', bg: 'bg-white/20', gradient: 'from-primary to-accent', image: '/images/0ee75d906_generated_image.png', text: 'מטא-אנליזה (2021): למידה חושית-פיזית משפרת שימור ידע לאחר חודש ב-58% לעומת שינון' },
  { icon: Brain, color: 'text-white', bg: 'bg-white/20', gradient: 'from-secondary to-secondary/80', image: '/images/8580f0529_generated_image.png', text: 'Dual Coding Theory: שילוב חזותי-מוחשי מכפיל את מהירות עיבוד המידע במוח' },
  { icon: BarChart3, color: 'text-white', bg: 'bg-white/20', gradient: 'from-accent to-accent/80', image: '/images/070a4bb6b_generated_image.png', text: 'STEM Education Report 2023: בתי ספר עם ערכות ידניות השיגו שיפור ממוצע של 48% בציוני מדעים' },
  { icon: Lightbulb, color: 'text-white', bg: 'bg-white/20', gradient: 'from-primary to-primary/80', image: '/images/705cab2ce_generated_image.png', text: 'Nature Human Behaviour: ילדים שלמדו דרך מגע פיתחו הבנה מרחבית עמוקה יותר ב-39%' },
  { icon: Zap, color: 'text-white', bg: 'bg-white/20', gradient: 'from-secondary to-primary', image: '/images/0e5a81c0a_generated_image.png', text: 'אוניברסיטת MIT: סטודנטים שלמדו עם מודלים פיזיים עברו בחינות הנדסיות בשיעור גבוה ב-33%' },
  { icon: Award, color: 'text-white', bg: 'bg-white/20', gradient: 'from-accent to-secondary', image: '/images/b6e1f5008_generated_image.png', text: 'מחקר ישראלי 2020: תלמידי ביולוגיה שהשתמשו במודלים DNA שיפרו הבנה ב-52% תוך 4 שבועות' },
  { icon: BookOpen, color: 'text-white', bg: 'bg-white/20', gradient: 'from-primary to-accent', image: '/images/0ee75d906_generated_image.png', text: 'Problem-Based Learning Studies: עבודה עם מודלים מוחשיים מגדילה פתרון בעיות יצירתי ב-41%' },
  { icon: Brain, color: 'text-white', bg: 'bg-white/20', gradient: 'from-secondary to-secondary/80', image: '/images/8580f0529_generated_image.png', text: 'Sensory Integration Research: חוויה רב-חושית מאריכה את זמן השמירה בזיכרון ארוך-טווח פי 4' },
  { icon: BarChart3, color: 'text-white', bg: 'bg-white/20', gradient: 'from-accent to-accent/80', image: '/images/070a4bb6b_generated_image.png', text: 'Stanford Education Lab: כיתות Plug & Play הפחיתו זמן הכנת מורה ב-60%' },
  { icon: Award, color: 'text-white', bg: 'bg-white/20', gradient: 'from-primary to-primary/80', image: '/images/705cab2ce_generated_image.png', text: 'CBE Life Sciences 2023: תלמידי תיכון שלמדו סינתזת חלבונים עם מודלים הצליחו בבגרות ביולוגיה ב-63% יותר' },
  { icon: Zap, color: 'text-white', bg: 'bg-white/20', gradient: 'from-secondary to-primary', image: '/images/0e5a81c0a_generated_image.png', text: 'Journal of Adolescent Education 2022: תלמידי תיכון בלמידה אקטיבית דיווחו על עלייה של 74% במוטיבציה לבגרויות' },
  { icon: BookOpen, color: 'text-white', bg: 'bg-white/20', gradient: 'from-accent to-secondary', image: '/images/b6e1f5008_generated_image.png', text: 'Science Direct 2023: הוראה עם מודלים תלת-ממדיים במדעי החיים מפחיתה שיעורי נשירה ב-38%' },
  { icon: Brain, color: 'text-white', bg: 'bg-white/20', gradient: 'from-primary to-accent', image: '/images/0ee75d906_generated_image.png', text: 'Neuroscience & Education: תלמידים שמשתמשים בידיים בלמידה מפעילים 5 אזורי מוח במקביל לעומת 2 בהרצאה' },
  { icon: BarChart3, color: 'text-white', bg: 'bg-white/20', gradient: 'from-secondary to-secondary/80', image: '/images/8580f0529_generated_image.png', text: 'OECD Education at a Glance 2022: מדינות עם גישה hands-on בחינוך מדעי מדורגות גבוה יותר ב-PISA' },
  { icon: Lightbulb, color: 'text-white', bg: 'bg-white/20', gradient: 'from-accent to-accent/80', image: '/images/070a4bb6b_generated_image.png', text: 'Educational Psychology Review: למידה פעילה משפרת ביצועים במבחני הבנה ב-36% לעומת קריאה פסיבית' },
  { icon: Award, color: 'text-white', bg: 'bg-white/20', gradient: 'from-primary to-primary/80', image: '/images/705cab2ce_generated_image.png', text: 'AERA Journal 2021: מורים המשתמשים בכלי למידה פיזיים מדווחים על שביעות רצון מקצועית גבוהה ב-45%' },
];

const STEP = 3;

export default function ResearchTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + STEP) % WIDGETS.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const navigate = (dir) => {
    setDirection(dir);
    setCurrentIndex(prev => {
      const next = prev + dir * STEP;
      return ((next % WIDGETS.length) + WIDGETS.length) % WIDGETS.length;
    });
  };

  const visibleWidgets = [
    currentIndex % WIDGETS.length,
    (currentIndex + 1) % WIDGETS.length,
    (currentIndex + 2) % WIDGETS.length,
  ];

  return (
    <div className="bg-white/80 backdrop-blur border-y border-border py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-sm font-bold bg-primary text-white px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
            📊 מחקר עדכני
          </span>
          <div className="h-px flex-1 bg-white/20" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">מתעדכן כל 20 שניות</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {visibleWidgets.map((widgetIdx, position) => {
              const widget = WIDGETS[widgetIdx];
              const Icon = widget.icon;
              return (
                <motion.div
                  key={`${widgetIdx}-${position}`}
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 30 }}
                  transition={{ duration: 0.45, delay: position * 0.08 }}
                  className={`relative overflow-hidden rounded-2xl shadow-xl border border-white/20${position > 0 ? ' hidden sm:block' : ''}`}
                >
                  <div className="absolute inset-0">
                    <img src={widget.image} alt="" className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${widget.gradient} opacity-90`} />
                  </div>
                  <div className="relative z-10 p-5 flex flex-col gap-3 min-h-[160px]">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${widget.bg} backdrop-blur-sm flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${widget.color}`} />
                    </div>
                    <p className="text-base font-bold leading-relaxed text-white drop-shadow">
                      {widget.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-4 mt-5">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all text-primary"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: Math.ceil(WIDGETS.length / STEP) }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(1); setCurrentIndex(i * STEP); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / STEP) === i ? 'w-6 bg-primary' : 'w-1.5 bg-primary/20'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}