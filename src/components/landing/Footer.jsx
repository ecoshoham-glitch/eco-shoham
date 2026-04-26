import React from 'react';
import { Mail, MessageCircle, ChevronUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer" className="relative bg-primary text-primary-foreground" dir="rtl">
      {/* Top wave */}
      <div className="absolute -top-1 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 28C840 36 960 42 1080 40C1200 38 1320 28 1380 23L1440 18V60H0Z" fill="hsl(220 70% 25%)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-primary-foreground/15 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-black text-xs leading-none">3D</span>
              </div>
              <span className="text-3xl font-black tracking-tight">
                ECO<span className="text-secondary">Shoham</span>
              </span>
            </div>
            <p className="text-primary-foreground/70 mt-3 text-sm leading-relaxed">
              מדע מורכב, פשוט בידיים.
              <br />
              ערכות למידה תלת-מימדיות חדשניות לבתי ספר ותלמידים.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">קישורים</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="/#products" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  הערכות שלנו
                </a>
              </li>
              <li>
                <a href="/#about" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  אודות
                </a>
              </li>
              <li>
                <a href="/blog" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  מגזין
                </a>
              </li>
              <li>
                <a href="mailto:ecoshoham@gmail.com" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  צור קשר
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">צור קשר</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:ecoshoham@gmail.com"
                  className="flex items-center gap-2 text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  ecoshoham@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/972503366993"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  צור קשר לייעוץ פדגוגי
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} ECOShoham. כל הזכויות שמורות.
          </p>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-secondary/30 flex items-center justify-center transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </footer>
  );
}