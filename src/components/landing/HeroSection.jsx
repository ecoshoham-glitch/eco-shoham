import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Sparkles, MessageCircle, Volume2, VolumeX } from 'lucide-react';

const HERO_IMAGE = '/images/b82c137a8_Gemini_Generated_Image_ze7oq0ze7oq0ze7o.png';
const HERO_VIDEO = '/סרטון שיווקי 1.mp4';

export default function HeroSection() {
  const { content } = useSiteContent();
  const h = content.hero;
  const s = content.stats;
  return (
    <section className="relative flex flex-col pb-[76px] sm:pb-0" dir="rtl" style={{ minHeight: 'calc(100svh - 80px)', marginTop: '80px' }}>
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

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center flex-1 min-h-0 pt-8 pb-12">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 bg-white/90 text-primary px-4 py-2 rounded-full text-base font-bold mb-6 drop-shadow-lg"
        >
          <Sparkles className="w-4 h-4" />
          <span>{h.badge}</span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="font-black leading-tight mb-6 drop-shadow-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 sm:gap-3 bg-white/95 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-lg" dir="ltr">
            <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-primary tracking-tight">
              ECO<span className="text-secondary">Shoham</span>
            </span>
          </span>
          <span className="block text-white text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mt-3">
            {h.tagline}
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mt-2">
            {h.subtitle}
          </span>
        </motion.h1>

        {/* P */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-base sm:text-xl text-white leading-relaxed mb-8 max-w-2xl text-center drop-shadow-lg"
        >
          {h.description}
        </motion.p>

        {/* Video + Image player */}
        <HeroMedia image={h.image || HERO_IMAGE} />

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4"
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
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex justify-center gap-6 sm:gap-12 mt-12 pt-8 border-t border-white/20 w-full"
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
    </section>
  );
}

function HeroMedia({ image }) {
  const videoRef = useRef(null);
  const [showImage, setShowImage] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showHint, setShowHint] = useState(true);

  const handleVideoEnd = useCallback(() => {
    setShowImage(true);
    setTimeout(() => {
      setShowImage(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    }, 30000);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
    // Hide hint after the pulse animation finishes (~5 seconds)
    const timer = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const next = !muted;
      videoRef.current.muted = next;
      setMuted(next);
      setShowHint(false);
    }
  }, [muted]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="relative mb-8 mt-4 w-full max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden aspect-video bg-black/10"
    >
      {showImage ? (
        <motion.img
          src={image}
          alt="EcoShoham"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full rounded-2xl object-contain"
        />
      ) : (
        <>
          <video
            ref={videoRef}
            src={HERO_VIDEO}
            playsInline
            controls
            onEnded={handleVideoEnd}
            className="w-full h-full rounded-2xl object-contain"
          />
          {/* Animated volume hint button */}
          <motion.button
            onClick={toggleMute}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white p-3 sm:p-4 rounded-full shadow-lg touch-manipulation z-10"
            animate={showHint && muted ? {
              scale: [1, 1.3, 1, 1.3, 1, 1.3, 1, 1.3, 1, 1.3, 1],
            } : {}}
            transition={{
              duration: 5,
              ease: "easeInOut",
            }}
          >
            {muted ? <VolumeX className="w-6 h-6 sm:w-7 sm:h-7" /> : <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />}
          </motion.button>
        </>
      )}
    </motion.div>
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
      transition={{ delay: 0.4, duration: 0.3 }}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-4 py-3 rounded-full shadow-xl shadow-black/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
    >
      <MessageCircle className="w-5 h-5 fill-white" />
      <span className="text-sm">צרו קשר בוואטסאפ</span>
    </motion.a>
  );
}