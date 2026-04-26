import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    id: '1',
    category: 'תהליך הזמנה',
    questions: [
      {
        question: 'איך אני מזמין ערכות עבור בית הספר שלי?',
        answer: 'אתה יכול למלא את טופס בקשת הצעת המחיר באתר שלנו. צוות השיווק שלנו יצור איתך קשר בתוך 24 שעות עם הצעת מחיר מותאמת לצרכי בית הספר שלך.'
      },
      {
        question: 'מה התנאים לרכישה בכמויות גדולות?',
        answer: 'אנחנו מציעים הנחות משמעותיות לרכישות בכמויות גדולות. צרו קשר ישירות עם צוות המכירות שלנו לקבלת הצעת מחיר מיוחדת.'
      },
      {
        question: 'אם אמצא בעיות בהזמנה, למי אני פונה?',
        answer: 'צוות התמיכה שלנו זמין דרך דוא״ל, טלפון וWhatsApp. נשמח לעזור לך בכל שאלה או בעיה.'
      }
    ]
  },
  {
    id: '2',
    category: 'התאמה לתוכנית לימודים',
    questions: [
      {
        question: 'האם הערכות שלכם מתאימות לתוכנית הלימודים הישראלית?',
        answer: 'כן! כל הערכות שלנו מעוצבות בהתאמה מלאה לתוכנית הלימודים של משרד החינוך בישראל, לכל גילאים ורמות.'
      },
      {
        question: 'איך אני משלב את הערכות בשיעור קיים?',
        answer: 'הערכות שלנו מעוצבות להשתלב בקלות בשיעורים קיימים. מורים יכולים להשתמש בהן כחלק מהוראה פרונטלית, פעילות בקבוצות קטנות או עבודה עצמית של תלמידים.'
      },
      {
        question: 'האם יש חומרי הוראה תומכים?',
        answer: 'בהחלט! כל ערכה מגיעה עם מדריך מורה מפורט, תכניות שיעור וחומרי תמיכה לימודיים כדי לעזור לך להוציא את המקסימום מהערכה.'
      }
    ]
  },
  {
    id: '3',
    category: 'משלוחים וביצוע',
    questions: [
      {
        question: 'כמה זמן לוקח המשלוח?',
        answer: 'משלוחים בתוך ישראל לוקחים בדרך כלל 5-7 ימי עסקים. זמנים מהירים יותר זמינים בבקשה מיוחדת.'
      },
      {
        question: 'האם אתם משלחים לכל בתי הספר בישראל?',
        answer: 'כן, אנחנו משלחים לכל הארץ. משלוח חינם זמין לרכישות גדולות מ-10 יחידות.'
      },
      {
        question: 'מה אם הערכה הגיעה פגומה?',
        answer: 'אנחנו מעמידים אחריות מלאה על כל הערכות. במקרה של פגם, אנחנו נחליף את הערכה מיידית ללא עלות נוספת.'
      }
    ]
  }
];

export default function FAQSection() {
  return (
    <section className="py-8 sm:py-12 relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #b2eff0 0%, #d6f5f6 50%, #b2eff0 100%)' }} />
      <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            ❓ שאלות נפוצות
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary mb-3 sm:mb-4 leading-tight">
            יש לך <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent">שאלה</span>?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            כל התשובות שאתה צריך על הזמנות, התאמה לתוכנית הלימודים ומשלוחים
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {faqs.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-md border border-border/50 overflow-hidden">
              {/* Category header */}
              <div className="bg-gradient-to-r from-primary/5 to-transparent px-4 sm:px-6 py-3 sm:py-4">
                <h3 className="font-bold text-primary text-sm sm:text-base">{category.category}</h3>
              </div>

              {/* Accordion */}
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${category.id}-${index}`}
                    className="border-t border-border/30 first:border-t-0"
                  >
                    <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-muted/30 transition-colors text-right">
                      <span className="text-xs sm:text-sm font-semibold text-foreground text-right flex-1">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 py-3 sm:py-4 bg-muted/20 text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-10 sm:mt-12 p-4 sm:p-6 bg-primary/5 rounded-2xl border border-primary/10"
        >
          <p className="text-sm sm:text-base text-foreground mb-3 sm:mb-4">
            לא מצאת את התשובה שחיפשת?
          </p>
          <a
            href="https://wa.me/972503366993"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors text-xs sm:text-sm"
          >
            צרו קשר בוואטסאפ
            <span>←</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}