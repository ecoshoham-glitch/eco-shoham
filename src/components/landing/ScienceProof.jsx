import React from 'react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { motion } from 'framer-motion';
import { BarChart3, Brain, Zap } from 'lucide-react';

export default function ScienceProof() {
  const { content } = useSiteContent();
  const sp = content.scienceProof;
  return (
    <section className="py-8 sm:py-12 relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #cce8ff 0%, #e0f2ff 50%, #cce8ff 100%)' }} />
      <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main stat card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-10"
        >
          <div className="relative bg-gradient-to-br from-secondary via-accent to-primary rounded-2xl p-5 sm:p-8 shadow-xl border border-white/10 overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Big number */}
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <div className="text-5xl sm:text-6xl font-black text-white leading-none">
                    {sp.stat}
                  </div>
                  <p className="text-base text-white/90 font-bold mt-2">
                    {sp.statLabel}
                  </p>
                </motion.div>
              </div>

              {/* Text content */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-white"
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                  {sp.title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  {sp.description}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              icon: Brain,
              image: '/images/6f480a755_generated_image.png',
              title: 'הפחתת עומס קוגניטיבי',
              description: 'מגע פיזי והראייה התלת-ממדית מונעות עומס קוגניטיבי מיותר. התלמידים מבינים תהליכים מורכבים ביתר קלות.'
            },
            {
              icon: BarChart3,
              image: '/images/31af3cbab_generated_image.png',
              title: 'עוגני זיכרון חזקים',
              description: 'חוויה חושית ומגע יוצרים עוגני זיכרון ממשיים. הידע שנלמד נשמר לאורך זמן בהרבה יותר טוב מאשר שינון.'
            },
            {
              icon: Zap,
              image: '/images/687706649_generated_image.png',
              title: 'הבנה מושגית עמוקה',
              description: 'Embodied Cognition מעמיקה הבנה אמיתית של תהליכים מדעיים. התלמידים לא רק זוכרים — הם בעצם מבינים.'
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl overflow-hidden border border-border/50 shadow-md hover:shadow-lg transition-all duration-300"
            >
              {item.image && (
                <div className="h-40 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-6">
              <h4 className="font-bold text-lg text-primary mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}