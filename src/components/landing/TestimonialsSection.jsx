import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import SubmitTestimonialModal from './SubmitTestimonialModal';
import { FileText, ExternalLink, Building2, Star, Quote } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const officialLetters = [
  {
    title: 'המרכז הארצי למורי הביולוגיה – מכון ויצמן',
    subtitle: 'כנסים 30 ו-31 למורי הביולוגיה – תשפ"ד–תשפ"ה',
    date: '2024–2025',
    from: 'ד"ר אוהד לבקוביץ ו-ד"ר ציפי הופמן',
    org: 'מכון ויצמן למדע',
    image: '/images/7e1be4564_generated_image.png',
    summary: 'תודה על תרומה ייחודית לכנסים ה-30 וה-31 של מורי הביולוגיה (כ-360 משתתפים מכל הארץ). ההרצאות בנושא "שימוש בטכנולוגיית תלת-מימד ללמידה פעילה" זכו להערכה רבה מהמשתתפים.',
    urls: [
      { label: 'כנס 30 – תשפ"ד', url: '/files/cd7676040_2024.pdf' },
      { label: 'כנס 31 – תשפ"ה', url: '/files/512b89417_20242025.pdf' },
    ],
  },
  {
    title: 'ד"ר עומר חורש – מדריך מרכז ארצי',
    subtitle: 'אגף תכניות יחודיות, משרד החינוך',
    date: '29.01.2026',
    from: 'ד"ר עומר חורש',
    org: 'אגף תכניות יחודיות, המזכירות הפדגוגית, משרד החינוך',
    summary: 'מיזם איכותי ומבוסס פדגוגיה עדכנית המהווה קפיצת מדרגה ממשית בדרכי ההוראה. המודלים מפחיתים עומס קוגניטיבי, מחליפים שינון בלמידה פעילה וחוויתית, וכל יחידה מגיעה מוכנה עם מערך מורה, דפי עבודה וסרטון הדרכה.',
    urls: [{ label: 'מכתב המלצה', url: '/files/4a76c6a81_.pdf' }],
  },
  {
    title: 'קתי ביבי – רכזת ביולוגיה',
    subtitle: 'אורט גרינברג קריית טבעון',
    date: '01.02.2026',
    from: 'קתי ביבי',
    org: 'אורט גרינברג קריית טבעון',
    summary: 'התוכנית מנגישה תכנים מורכבים ברמה מולקולרית, מחזקת הבנה עמוקה ומעלה מעורבות תלמידים. בבוחן שנערך לאחר השימוש במודלים ניכר שיפור משמעותי בהבנה. ממליצה בחום.',
    urls: [{ label: 'מכתב המלצה', url: '/files/4a644095b_-.pdf' }],
  },
];

const STATIC_TESTIMONIALS = [
  {
    id: 1,
    name: 'עמוס גרין',
    title: 'מורה כימיה, בית ספר בן גוריון',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amos',
    text: 'בעבר הסברתי את סינתזת החלבונים בשרטוטים על הלוח. עכשיו התלמידים בונים את הדנ"א בעצמם וזה משנה הכל. התשומת הלב בכיתה עלתה משמעותית.',
    rating: 5,
  },
  {
    id: 2,
    name: 'שרה כהן',
    title: 'מנהלת מגמת STEM, תיכון מנהרה',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miriam',
    text: 'השקעה במודלים של EcoShoham היתה ההחלטה הטובה ביותר שעשינו למגמה. התלמידים יותר מעורבים, התוצאות משתפרות, והמורים מרוצים. בחום לב!',
    rating: 5,
  },
  {
    id: 3,
    name: 'יורם שמואל',
    title: 'מורה למדעים, בית ספר יסודי גלילות',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yoram',
    text: 'אפילו בכיתות יסודי, התלמידים מבינים את מבנה התא לעומק בזכות המודלים האלה. הם מגלים עניין וסקרנות רבים, וילדיי הקטנים מספרים לי בבית בהתלהבות על מה שלמדו בשיעור.',
    rating: 5,
  },
];

function TestimonialCard({ testimonial, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group h-full"
    >
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-secondary/30 p-4 sm:p-6 h-full flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-accent to-primary rounded-t-2xl sm:rounded-t-3xl" />
        <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-accent/30 mb-2 sm:mb-3" />
        <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-accent text-accent" />
          ))}
        </div>
        <p className="text-foreground/80 leading-relaxed mb-4 sm:mb-6 flex-1 text-xs sm:text-sm">
          "{testimonial.text}"
        </p>
        <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border/40">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage src={testimonial.image} alt={testimonial.name} />
            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-right min-w-0">
            <div className="text-xs sm:text-sm font-bold text-primary truncate">{testimonial.name}</div>
            <div className="text-xs text-muted-foreground line-clamp-1">{testimonial.title}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const [dynamicTestimonials, setDynamicTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    base44.entities.Testimonial.list('-created_date', 20).then(setDynamicTestimonials);
  }, []);

  const allTestimonials = [
    ...STATIC_TESTIMONIALS,
    ...dynamicTestimonials.map(t => ({
      id: t.id,
      name: t.author_name,
      title: t.title || '',
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.author_name)}`,
      text: t.text,
      rating: t.rating || 5,
      isDynamic: true,
    }))
  ];

  return (
    <section id="testimonials" className="py-8 sm:py-14 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/[0.02] to-background" />
      <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            ⭐ מה אומרים המורים שלנו
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-primary mb-3 sm:mb-4 leading-tight">
            המלצות ממורים{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent">
              בכל הארץ
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            מורים משתפים את הקול שלהם על ההשפעה של ECOShoham על כיתותיהם
          </p>
        </motion.div>

        {/* Classroom Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <img
            src="/images/2246de115_WhatsAppImage2026-03-30at032932.png"
            alt="תלמידים עובדים עם ערכות ECOShoham"
            className="w-full max-w-lg rounded-3xl shadow-lg object-contain"
          />
        </motion.div>

        {/* Classroom Image 2 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <img
            src="/images/248561285_WhatsAppImage2025-11-12at142748.png"
            alt="תלמידים עובדים עם ערכות ECOShoham בכיתה"
            className="w-full max-w-lg rounded-3xl shadow-lg object-cover"
          />
        </motion.div>

        {/* Video */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-lg border border-primary/20 aspect-video"
          >
            <iframe
              src="https://www.youtube.com/embed/ScRlJOsqcv0"
              title="המלצת מורה"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            />
          </motion.div>
        </div>

        {/* Official letters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 items-stretch">
          {officialLetters.map((letter, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group flex flex-col gap-3 bg-white rounded-2xl p-4 sm:p-5 border border-border/50 shadow-md hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full"
            >
              {letter.image && (
                <div className="flex justify-center mb-2">
                  <img src={letter.image} alt={letter.org} className="h-28 w-full object-cover rounded-xl" onError={e => e.currentTarget.style.display='none'} />
                </div>
              )}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-primary leading-snug">{letter.title}</h4>
                  <p className="text-xs font-semibold text-secondary mt-0.5">{letter.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{letter.org}</span>
              </div>
              {letter.summary && (
                <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3 border-t border-border/30 pt-2">{letter.summary}</p>
              )}
              <p className="text-xs text-muted-foreground">{letter.date}</p>
              <div className="flex flex-wrap gap-2 pt-1 border-t border-border/20">
                {letter.urls.map((link, j) => (
                  <a
                    key={j}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit testimonial button */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            ✍️ שתפו את הניסיון שלכם
          </button>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {allTestimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} delay={index * 0.1} />
          ))}
        </div>

        <AnimatePresence>
          {showModal && <SubmitTestimonialModal onClose={() => setShowModal(false)} />}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border/50"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-primary">100+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-1">בתי ספר</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-secondary">15K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-1">תלמידים</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-accent">4.9★</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-1">דירוג</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-primary">98%</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-1">שביעות רצון</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}