import React, { useState } from 'react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { motion } from 'framer-motion';
import { BookOpen, Hand, X, Check, Lightbulb, Users, Award, Zap } from 'lucide-react';

function ExpandableCard({ item, i }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.5 }}
      className="bg-white rounded-2xl p-6 border border-border/50 hover:shadow-lg transition-all duration-300"
    >
      {item.image ? (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <item.icon className="w-6 h-6 text-primary" />
        </div>
      )}
      <h4 className="font-bold text-lg text-foreground mb-2">{item.title}</h4>
      <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-4'}`}>{item.description}</p>
      {item.description.length > 150 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary font-semibold mt-2 hover:underline"
        >
          {expanded ? 'הצג פחות ←' : 'קרא עוד →'}
        </button>
      )}
    </motion.div>
  );
}

export default function ProblemSolution() {
  const { content } = useSiteContent();
  return (
    <section id="problem" className="py-8 relative overflow-hidden" dir="rtl">
      {/* Subtle background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #e8d5f5 0%, #f3e8ff 50%, #e8d5f5 100%)' }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* About ECOShoham Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary mb-4">
              {content.about.title.replace('ECOShoham', '').trim()} <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent">ECOShoham</span>?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.about.description}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {[
              {
                icon: Lightbulb,
                title: 'חדשנות פדגוגית',
                image: '/images/705cab2ce_generated_image.png',
                description: 'ערכות ECOShoham הן כלי הוראה חדשני המשלב מודלים תלת-ממדיים לבנייה עצמית עם אלמנטים של משחוק (Gamification). במקום לימוד תיאורטי יבש, התלמידים בונים בעצמם מודלים מדעיים מוחשיים, חוקרים תהליכים מורכבים בידיים ומטמיעים את החומר בדרך חוויתית ובלתי נשכחת. השיטה מקצרת את זמן הלמידה, מפשטת מושגים מורכבים והופכת כל שיעור לחוויה פעילה ומעוררת סקרנות — ללא צורך בהכנה לוגיסטית מורכבת.',
              },
              {
                icon: Users,
                title: 'עבור כל מורה',
                image: '/images/b6e1f5008_generated_image.png',
                description: 'מקסימום ערך לימודי, מינימום זמן הכנה: פתרונות ההוראה של ECOShoham מותאמים לסטנדרטים של מערכת החינוך הישראלית ומעוצבים להטמעה מהירה וחלקה במהלך השיעור, מבלי לשנות את מבנה ההוראה הקיים.'
              },
              {
                icon: Award,
                title: 'מוכח מחקרית',
                image: '/images/8580f0529_generated_image.png',
                description: 'המדע שמאחורי ההצלחה: מחקר רחב היקף שפורסם ב-PNAS מוכיח כי למידה אקטיבית מקטינה את שיעורי הכישלון ב-55% ומשפרת משמעותית את ממוצע הציונים במקצועות המדעים. ערכות ECOShoham מיישמות ממצאים אלו בשטח; על ידי הפיכת הלימוד הפסיבי לחוויית בנייה אקטיבית, אנו מאפשרים לתלמידים לעבד מידע לעומק, לתקן טעויות בזמן אמת ולהטמיע מושגים מורכבים בדרך שהרצאה פרונטלית פשוט אינה יכולה להשיג.'
              },
              {
                icon: Zap,
                title: 'השפעה בלתי נשכחת',
                image: '/images/0ee75d906_generated_image.png',
                description: 'מעבר מלמידה פסיבית ללמידה התנסותית (Experiential Learning) מייצר \'עוגנים תחושתיים\' המשפרים משמעותית את שימור הידע לאורך זמן ואת היכולת ליישם אותו בהקשרים חדשים.'
              }
            ].map((item, i) => (
              <ExpandableCard key={i} item={item} i={i} />
            ))}
          </div>
        </motion.div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 pt-10 border-t border-border/50"
        >
          <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            מהבעיה לפתרון
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary">
            למה <span className="text-transparent bg-clip-text bg-gradient-to-l from-destructive to-accent">שיטות אחרות</span> פחות עובדות?
          </h2>
        </motion.div>

        {/* Problem vs Solution */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group h-full"
          >
            <div className="relative bg-white rounded-3xl p-8 lg:p-10 border-2 border-destructive/20 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-destructive to-destructive/60" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <X className="w-7 h-7 text-destructive" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-destructive">הבעיה</h3>
                  <p className="text-sm text-muted-foreground">שיטות הוראה מסורתיות</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 flex-1">
               <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/5 flex-1">
                 <BookOpen className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                 <p className="text-foreground/80 leading-relaxed">
                   קשה לרתק כיתה שלמה? תלמידים מתקשים להבין ולשנן מודלים מופשטים דרך מצגות וספרים בלבד. העניין והמעורבות יורדים, וגם הישגיהם סובלים מכך.
                 </p>
               </div>
               <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/5 flex-1">
                 <BookOpen className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                 <p className="text-foreground/80 leading-relaxed">
                   תרשימים דו-מימדיים לא מספיקים להסבר תהליכים מרחביים ומורכבים. תלמידים מתקשים להעתיק תמונות דחוסות לתפישת מרחב תלת-מימדית, מה שיוצר בלבול ותפיסות שגויות.
                 </p>
               </div>
               <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/5 flex-1">
                 <BookOpen className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                 <p className="text-foreground/80 leading-relaxed">
                   שינון בעל-פה מוביל לשכחה מהירה ולתסכול — גם של המורה וגם של התלמיד. ללא הבנה אמיתית, הידע הנשמר הוא נחות ובדרך כלל נשכח בתוך ימים ספורים.
                 </p>
               </div>
              </div>

              <div className="mt-8 rounded-2xl overflow-hidden flex-shrink-0">
                <img src="/images/classroom-before.png" alt="שיעור ביולוגיה מסורתי — תלמידים לא מרוכזים" className="w-full h-auto object-contain" />
              </div>
            </div>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group h-full"
          >
            <div className="relative bg-white rounded-3xl p-8 lg:p-10 border-2 border-secondary/30 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-secondary to-secondary/60" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Check className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary">הפתרון</h3>
                  <p className="text-sm text-muted-foreground">למידה אקטיבית עם ECOShoham</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 flex-1">
               <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/5 flex-1">
                 <Hand className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                 <p className="text-foreground/80 leading-relaxed">
                   למידה פעילה במיטבה! הערכות שלנו מאפשרות לתלמידים לפרק, להרכיב ולחקור את חומר הלימוד בידיים. החוויה החושית והראייה התלת-ממדית יוצרות הבנה עמוקה והופכות את המידע המופשט לזיכרון מוחשי שנשאר לאורך זמן.
                 </p>
               </div>
               <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/5 flex-1">
                 <Hand className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                 <p className="text-foreground/80 leading-relaxed">
                   שיפור משמעותי בהבנה ובשימור הידע — מוכח מחקרית. מחקרים מראים שיפור של עד 55% בהישגי תלמידים בלמידה אקטיבית בהשוואה לשיטות הרצאה מסורתיות.
                 </p>
               </div>
               <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/5 flex-1">
                 <Hand className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                 <p className="text-foreground/80 leading-relaxed">
                   Plug & Play ללא הכנה מוקדמת: מוציאים מהקופסה ומתחילים לחקור מיד. אין צורך בהגדרות מעבדה משוכללות או כישורים טכניים מיוחדים.
                 </p>
               </div>
              </div>

              <div className="mt-8 rounded-2xl overflow-hidden flex-shrink-0">
                <img src="/images/classroom-after.png" alt="תלמידות נלהבות מרכיבות ערכת ECOShoham — אהההה הבנתי!" className="w-full h-auto object-contain" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}