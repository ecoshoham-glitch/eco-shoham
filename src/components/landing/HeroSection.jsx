import React from 'react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Sparkles, MessageCircle } from 'lucide-react';

const HERO_IMAGE = '/images/b82c137a8_Gemini_Generated_Image_ze7oq0ze7oq0ze7o.png';

export default function HeroSection() {
  const { content } = useSiteContent();
  const h = content.hero;
  const s = content.stats;
  return (
    <section className="relative flex flex-col pb-[76px] sm:pb-0" dir="rtl" style={{ minHeight: 'calc(100vh - 80px)', marginTop: '80px' }}>
      {/* Background - brick wall pattern */}
      <div className="absolute inset-0 z-0" style={{
        backgroundColor: '#d0d0d0',
        backgroundImage: `
          linear-gradient(335deg, #b8b8b8 23px, transparent 23px),
          linear-gradient(155deg, #b8b8b8 23px, transparent 23px),
          linear-gradient(335deg, #b8b8b8 23px, transparent 23px),
          linear-gradient(155deg, #b8b8b8 23px, transparent 23px)
        `,
        backgroundSize: '58px 30px',
        backgroundPosition: '0px 2px, 4px 35px, 29px 17px, 34px 0px'
      }}>
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/70 via-primary/50 to-background/85" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-1 min-h-0">
        
        {/* Right column - text content */}
        <div className="w-full lg:w-1/2 pt-8 pb-12">
          <div className="text-right">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/90 text-primary px-4 py-2 rounded-full text-base font-bold mb-6 drop-shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>{h.badge}</span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight mb-6 drop-shadow-2xl"
            >
              {h.title}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent">
                {h.subtitle}
              </span>
            </motion.h1>

            {/* P */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-base sm:text-xl text-white leading-relaxed mb-8 max-w-xl drop-shadow-lg"
            >
              {h.description}
            </motion.p>

            {/* Mobile image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="lg:hidden mb-8 mt-6"
            >
              <img src={HERO_IMAGE} alt="EcoShoham" className="w-full max-w-xs mx-auto rounded-xl shadow-xl object-contain" />
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap gap-3 sm:gap-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg shadow-xl shadow-accent/30 hover:shadow-2xl hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                <a href="#products">
                  {h.cta_primary}
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="rounded-full px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg border-2 border-white bg-white/20 text-white font-bold hover:bg-white/35 hover:border-white transition-all duration-300"
              >
                <a href="/#about">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  {h.cta_secondary}
                </a>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="hidden sm:flex gap-6 sm:gap-8 mt-12 pt-8 border-t border-white/20"
            >
              {[
                { number: s.schools, label: 'בתי ספר' },
                { number: s.students, label: 'תלמידים' },
                { number: s.satisfaction, label: 'שביעות רצון' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-xl sm:text-3xl font-black text-white">{stat.number}</div>
                  <div className="text-xs sm:text-sm text-white/70 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

        </div>

        {/* Left column - image, desktop only */}
        <div className="hidden lg:flex w-1/2 items-center justify-center">
          <motion.img
            src={h.image || HERO_IMAGE}
            alt="EcoShoham"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full max-w-lg rounded-2xl shadow-2xl object-contain"
          />
        </div>

      </div>
    </section>
  );
}

export function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/972503366993"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-4 py-3 rounded-full shadow-xl shadow-black/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
    >
      <MessageCircle className="w-5 h-5 fill-white" />
      <span className="text-sm">צרו קשר בוואטסאפ</span>
    </motion.a>
  );
}