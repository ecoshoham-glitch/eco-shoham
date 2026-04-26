import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Lightbulb, Users, Award } from 'lucide-react';

const PROFILE_IMAGE = '/images/3aeef5f2b_generated_image.png';

const values = [
  { icon: Heart, label: 'תשוקה למדע', color: 'bg-destructive/10 text-destructive', image: '/images/59573db81_generated_image.png' },
  { icon: Lightbulb, label: 'חדשנות בחינוך', color: 'bg-accent/10 text-accent', image: '/images/26ada624b_generated_image.png' },
  { icon: Users, label: 'קהילת מורים', color: 'bg-primary/10 text-primary', image: '/images/187281cea_generated_image.png' },
  { icon: Award, label: 'איכות ללא פשרות', color: 'bg-secondary/10 text-secondary', image: '/images/948d015e9_generated_image.png' },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-8 sm:py-12 relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #fff9c4 0%, #fffde7 50%, #fff9c4 100%)' }} />
      <div className="absolute bottom-0 left-0 w-48 sm:w-80 h-48 sm:h-80 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <span className="inline-block bg-accent/10 text-accent px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            ✨ הסיפור שלנו
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-primary leading-tight">
            הסיפור של <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent">ECOShoham</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-first lg:order-none"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl shadow-primary/10">
              <img
                src={PROFILE_IMAGE}
                alt="מייסד EcoShoham"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Floating accent */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-4 border border-border/50"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-secondary">10+</div>
                <div className="text-xs text-muted-foreground font-medium">שנות ניסיון</div>
              </div>
            </motion.div>

            <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 w-16 sm:w-20 h-16 sm:h-20 border-4 border-accent/20 rounded-full hidden sm:block" />
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-4 sm:mb-6 leading-tight">
              אודות אקו-שוהם
            </h3>

            <div className="space-y-3 sm:space-y-4 text-foreground/80 leading-relaxed text-sm sm:text-base">
              <p>
                <strong className="text-primary">נעים להכיר, אני מוטי אשר, המייסד והבעלים של ״אקו-שוהם״.</strong>
              </p>
              <p>
                אני מורה לביולוגיה מזה כ-9 שנים, חובש במד"א ומורה במגמד"א, ומאז ומתמיד דגלתי בשיטות הוראה לא שגרתיות. מתוך התשוקה האישית שלי לעולם ההדפסה בתלת-מימד, זיהיתי את הפוטנציאל העצום והערך המוסף האדיר שיש לטכנולוגיה זו בכיתה.
              </p>
              <p>
                שילוב טכנולוגיות תלת-מימד, כמו עט תלת-מימד ומדפסת תלת-מימד, ביחד עם ערכות לימודיות שפותחו במיוחד לנושאי לימוד מורכבים, עוזר לתלמידים להטמיע את חומר הלימוד בצורה יעילה, חוויתית ובלתי נשכחת. גישה זו הופכת את הלמידה מתיאורטית לחוויה מוחשית, מהנה ויוצאת דופן.
              </p>
              <p>
                כדי להעמיק את המומחיות שלי בתחום, למדתי קורס הדפסה ביולוגית רפואית במכון הטכנולוגי HIT בחולון, ובזכות הידע שרכשתי בקורס הקמתי את ״אקו-שוהם״. את הרעיון שלי להכנסת חדשנות לכיתות פרסמתי במאמר במגזין המורים לביולוגיה ״שמורת טבע״, ואף זכיתי להציג אותו בשני כנסים מקצועיים במכון ויצמן למדע. בכנס השני חשפתי פיתוח ייחודי שלי – ערכת "תרגום חלבון" מודפסת בתלת-מימד. כיום, הערכה נמכרת לבתי ספר ברחבי הארץ ומאפשרת לתלמידים להבין תהליכים ביולוגיים מורכבים הלכה למעשה.
              </p>
              <p className="text-primary font-bold text-base sm:text-lg mt-4">
                החזון שלנו ב״אקו-שוהם״
              </p>
              <p>
                מתוך הניסיון והעשייה בשטח, שמנו לנו למטרה לעזור לתלמידים להבין תכנים מורכבים בתחומי המדע ולהמחיש אותם באופן ויזואלי, ובכך להטמיע את התוכן הלימודי <strong className="text-primary">באופן מעמיק ומשמעותי</strong>. באמצעות פיתוח וייצור של ערכות לימודיות מתקדמות והעברת סדנאות ייעודיות, אנו מנגישים תכנים פדגוגיים מורכבים. בדרך זו, אנו מעניקים למורים ולתלמידים כלים יישומיים המייעלים את תהליך הלימוד והלמידה ומשפרים את הישגי התלמידים.
              </p>
              <p className="text-secondary font-semibold text-sm sm:text-base">
                באמצעות ״אקו שוהם״, אני מזמין אתכם להפוך את הלמידה למרתקת, מוחשית וחדשנית יותר. 🧬
              </p>
            </div>

            {/* Values grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-6 sm:mt-8">
              {values.map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-border/50"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                    <img src={val.image} alt={val.label} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-foreground">{val.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}