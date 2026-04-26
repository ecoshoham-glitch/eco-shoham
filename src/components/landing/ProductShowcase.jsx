import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, GraduationCap, X, Play, Sparkles } from 'lucide-react';

const products = [
  {
    id: 1,
    title: 'ערכה לתרגום חלבון',
    description: 'חובה בכל בית ספר, מתאים למגמת ביולוגיה ביוטכנולוגיה וביורפואה.',
    image: '/images/1c4285edf_WhatsAppImage2025-10-07at013113.jpg',
    badge: 'הכי נמכר',
    badgeColor: 'bg-accent text-white',
    level: 'חטיבת ביניים ותיכון',
  },
  {
    id: 2,
    title: 'ערכת סליל DNA',
    description: 'בנו את הסליל הכפול של ה-DNA בעצמכם! למדו על בסיסי חנקן, קשרים ושכפול.',
    image: '/images/57ba77922_generated_46eaa3ca.png',
    badge: 'חדש',
    badgeColor: 'bg-secondary text-white',
    level: 'חטיבת ביניים ותיכון',
    comingSoon: true,
  },
  {
    id: 3,
    title: 'ערכת תא חי',
    description: 'הכירו את האברונים של התא: גרעין, מיטוכונדריה, רשת אנדופלזמטית ועוד – הכל בתלת-מימד.',
    image: '/images/ערכת תא חי/deb6a2ed-4b7c-4349-8693-e31b1c939d6a.JPG',
    images: [
      '/images/b433d5ef5_generated_0f18aa04.png',
      '/images/ערכת תא חי/deb6a2ed-4b7c-4349-8693-e31b1c939d6a.JPG',
      '/images/ערכת תא חי/f07a3b1d-e523-43e0-9738-ba9a52115830.JPG',
      '/images/ערכת תא חי/IMG_8451.jpg',
      '/images/ערכת תא חי/IMG_8449.jpg',
      '/images/ערכת תא חי/IMG_8448.jpg',
      '/images/ערכת תא חי/IMG_8444.jpg',
    ],
    badge: 'מומלץ למורים',
    badgeColor: 'bg-primary text-white',
    level: 'יסודי וחטיבת ביניים',
    comingSoon: true,
  },
  {
    id: 5,
    title: 'ערכת זריקת קליע – פיסיקה בתלת-מימד',
    description: 'ערכה מודפסת בתלת-מימד לחקירת תנועת קליע (Projectile Motion). התלמידים משגרים כדור פלדה בעזרת קפיץ בזוויות שונות, מודדים טווח ונקודת נחיתה, ולומדים בפועל את עקרונות הפיסיקה: זווית שיגור, כוח ותאוצה.',
    image: '/images/ערכת פיסיקה/פיסיקה.jpg',
    images: [
      '/images/ערכת פיסיקה/פיסיקה.jpg',
      '/images/ערכת פיסיקה/פיסיקה 1.png',
      '/images/ערכת פיסיקה/פיסיקה 2.jpg',
    ],
    badge: 'חדש',
    badgeColor: 'bg-blue-600 text-white',
    level: 'חטיבת ביניים ותיכון',
    isWorkshop: false,
    comingSoon: true,
    bullets: [
      'שיגור כדור פלדה בזוויות משתנות וחקירת טווח הנחיתה',
      'למידה חווייתית של חוקי ניוטון, תנועת קליע ופירוק כוחות',
      'מתאים לשיעורי פיסיקה בחטיבת ביניים ובתיכון',
    ],
  },
  {
    id: 6,
    title: 'ערכת מנגנוני פעולה של וירוסים',
    description: 'ערכה תלת-ממדית אינטראקטיבית שממחישה את מחזור החיים של וירוסים: חדירה לתא המאחסן, שכפול החומר הגנטי, הרכבת וירוסים חדשים ויציאה מהתא. התלמידים בונים בידיים את כל שלבי ההדבקה ולומדים בפועל את המנגנונים שמאחורי מגפות, חיסונים ותרופות אנטי-ויראליות.',
    image: '/images/ערכת וירוסים/Gemini_Generated_Image_vwcqz9vwcqz9vwcq.png',
    badge: 'חדש',
    badgeColor: 'bg-red-600 text-white',
    level: 'חטיבת ביניים ותיכון',
    isWorkshop: false,
    comingSoon: true,
    bullets: [
      'המחשת מחזור החיים של וירוס — מחדירה לתא ועד שחרור וירוסים חדשים',
      'הבנת מנגנוני הגנה: חיסונים, נוגדנים ותרופות אנטי-ויראליות',
      'חיבור לאקטואליה — מגפות, COVID-19, שפעת ועוד',
    ],
  },
  {
    id: 4,
    title: 'סדנאות STEM וביוחקר: חוקרים, מתכננים, יוצרים!',
    description: 'הצטרפו לסדנה פורצת דרך שבה המדע פוגש את הטכנולוגיה. המשתתפים עובדים בצוותים, חוקרים לעומק מנגנונים ומתכננים המחשה שלהם בעזרת טכנולוגיות מודרניות מגוונות.',
    image: '/images/workshop_IMG_8642.jpg',
    images: [
      '/images/workshop_IMG_8642.jpg',
      '/images/workshop_IMG_8643.jpg',
      '/images/workshop_IMG_8640.jpg',
      '/images/workshop_IMG_8641.jpg',
      '/images/Gemini_Generated_Image_.png',
      '/images/workshop_browning_melanin.jpg',
    ],
    badge: 'חדש',
    badgeColor: 'bg-gradient-to-l from-secondary to-accent text-white',
    level: 'חטיבת ביניים ותיכון',
    isWorkshop: true,
  },
];

function WorkshopGallery({ images, title }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (lightbox) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length, lightbox]);

  return (
    <>
      <div className="relative w-full h-full">
        <img
          src={images[current]}
          alt={`${title} ${current + 1}`}
          className="w-full h-full object-contain bg-white transition-opacity duration-500 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
        />
        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white scale-125 shadow-md' : 'bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((current + 1) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition-colors"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((current - 1 + images.length) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition-colors"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Lightbox via Portal */}
      {createPortal(
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-4"
              onClick={() => setLightbox(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative w-[95vw] h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={images[current]}
                  alt={`${title} ${current + 1}`}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setLightbox(false)}
                  className="absolute top-3 left-3 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center text-lg transition-colors"
                >
                  ✕
                </button>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrent((current + 1) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl transition-colors"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCurrent((current - 1 + images.length) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl transition-colors"
                    >
                      ›
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default function ProductShowcase() {
  const [showModal, setShowModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  return (
    <section id="products" className="py-8 sm:py-14 relative" dir="rtl">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/14daed4b9_IMG_8451.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/85" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-block bg-secondary/10 text-secondary px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            🧬 הערכות שלנו
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-primary mb-3 sm:mb-4 leading-tight">
            ערכות למידה <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent">שמשנות את הכיתה</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            כל ערכה מתוכננת בקפידה כדי להפוך מושגים מופשטים לחוויה מוחשית ובלתי נשכחת
          </p>
        </motion.div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group"
            >
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-secondary/30 hover:-translate-y-2">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
                  {product.images ? (
                    <WorkshopGallery images={product.images} title={product.title} />
                  ) : (
                    <img
                      src={product.image}
                      alt={product.title}
                      className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ${product.id === 1 ? 'cursor-pointer' : ''}`}
                      onClick={product.id === 1 ? (e) => { e.stopPropagation(); setLightboxImage(product.image); } : undefined}
                    />
                  )}
                  {/* Badge */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className={`${product.badgeColor} font-bold px-3 py-1 text-xs shadow-lg`}>
                      {product.badge}
                    </Badge>
                    {product.comingSoon && (
                      <Badge className="bg-amber-500 text-white font-bold px-3 py-1 text-xs shadow-lg">
                        בפיתוח
                      </Badge>
                    )}
                  </div>
                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 pt-3 sm:pt-4">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">{product.level}</span>
                  </div>

                  {(product.id === 2 || product.id === 3) && (
                    <p className="text-xs text-gray-500 mb-2 italic">התמונה להמחשה בלבד</p>
                  )}

                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                  <p className={`text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 ${product.isWorkshop || product.bullets ? '' : 'line-clamp-3'}`}>
                    {product.description}
                  </p>

                  {/* Bullets for products that have them */}
                  {product.bullets && !product.isWorkshop && (
                    <div className="space-y-1.5 mb-3 text-xs text-muted-foreground leading-relaxed">
                      {product.bullets.map((bullet, i) => (
                        <div key={i} className="flex items-start gap-1.5"><Sparkles className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" /><span>{bullet}</span></div>
                      ))}
                    </div>
                  )}

                  {/* Rating — hide for workshop */}
                  {!product.isWorkshop && !product.bullets && (
                    <div className="flex items-center gap-1 mb-4 sm:mb-5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-accent text-accent" />
                      ))}
                      <span className="text-xs text-muted-foreground mr-1">(4.9)</span>
                    </div>
                  )}

                  {product.isWorkshop ? (
                    <div className="flex flex-col gap-2">
                      <div className="space-y-1.5 mb-2 text-xs text-muted-foreground leading-relaxed">
                        <div className="flex items-start gap-1.5"><Sparkles className="w-3 h-3 mt-0.5 text-accent flex-shrink-0" /><span>מתאים לצוותי מורים במקצועות השונים ולתלמידים במקצועות ה-STEM</span></div>
                        <div className="flex items-start gap-1.5"><Sparkles className="w-3 h-3 mt-0.5 text-accent flex-shrink-0" /><span>למידה חווייתית ועבודת צוות ייחודית ובלתי נשכחת</span></div>
                        <div className="flex items-start gap-1.5"><Sparkles className="w-3 h-3 mt-0.5 text-accent flex-shrink-0" /><span>חדשנות בידיים: שילוב AI, מדפסות ועטים תלת מימדיים</span></div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-l from-secondary to-accent hover:opacity-90 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm py-2 sm:py-3"
                        asChild
                      >
                        <a href="https://forms.gle/x3tx63ayCoHSkxfL8" target="_blank" rel="noopener noreferrer">
                          לפרטים נוספים ותיאום סדנה
                          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        </a>
                      </Button>
                    </div>
                  ) : product.comingSoon ? (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm py-2 sm:py-3"
                      onClick={() => setShowModal(true)}
                    >
                      בקשת הצעת מחיר
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {product.id === 1 && (
                        <Button
                          className="w-full font-bold rounded-lg sm:rounded-xl text-xs sm:text-sm py-2 sm:py-3 bg-accent hover:bg-secondary text-white shadow-md shadow-accent/30 transition-colors duration-300"
                          asChild
                        >
                          <a href="https://youtu.be/hAoS1Iht32o" target="_blank" rel="noopener noreferrer">
                            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2 fill-white" />
                            סרטון הדגמה
                          </a>
                        </Button>
                      )}
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm py-2 sm:py-3"
                        asChild
                      >
                        <a href="https://forms.gle/x3tx63ayCoHSkxfL8" target="_blank" rel="noopener noreferrer">
                          בקשת הצעת מחיר
                          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-black text-primary mb-3">ערכה בפיתוח</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                ערכה בפיתוח, נשמח לעדכן כשתהיה מוכנה.
              </p>
              <Button
                className="mt-6 w-full rounded-xl"
                onClick={() => setShowModal(false)}
              >
                סגור
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Image Lightbox */}
      {createPortal(
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-4"
              onClick={() => setLightboxImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative w-[95vw] h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={lightboxImage}
                  alt="תמונה מוגדלת"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setLightboxImage(null)}
                  className="absolute top-3 left-3 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center text-lg transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}