import React from 'react';
import { motion } from 'framer-motion';

export default function ImageBanner() {
  return (
    <section className="relative overflow-hidden" dir="rtl">
      {/* Full-width image with overlay */}
      <div className="relative h-[300px] sm:h-[400px] lg:h-[450px]">
        <img
          src="/images/classroom-hero.png"
          alt="מורה ותלמידים לומדים עם ערכת ECOShoham"
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-primary/80 via-primary/60 to-primary/80" />

        {/* Quote text */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl"
          >
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 drop-shadow-lg">
              מדע מורכב,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent">
                פשוט בידיים
              </span>
            </p>
            <p className="text-base sm:text-lg text-white/80 font-medium max-w-xl mx-auto drop-shadow">
              כשתלמידים בונים את החומר בעצמם — הם לא שוכחים אותו
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
