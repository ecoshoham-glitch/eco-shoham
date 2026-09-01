import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
const isHome = () => window.location.pathname === '/';

// activeWhen: פונקציה אופציונלית שמחליטה אם הפריט "פעיל" (הנתיב הנוכחי
// תואם לו) — משמשת כרגע רק לפריט "מולקולות ו-AR", שנפתח כעמוד עליון
// עצמאי (public/molecules/, לא route של React Router) ולכן חייב סימון
// מפורש לפי window.location.pathname, לא לפי match פנימי של הראוטר.
const navLinks = [
  { label: 'דף הבית', href: '/' },
  { label: 'אודות', anchor: 'about' },
  { label: 'חדשנות פדגוגית', anchor: 'problem' },
  { label: 'מגזין', href: '/blog' },
  { label: 'קהילת מורים', href: '/community' },
  { label: 'חומרי עזר', href: '/resources' },
  { label: 'מולקולות ו-AR', href: '/molecules/', activeWhen: (path) => path.startsWith('/molecules/') },
  { label: 'צור קשר', anchor: 'footer' },
  { label: 'ממליצים עלינו', anchor: 'testimonials' },
];

const getHref = (link) => {
  if (link.href) return link.href;
  return isHome() ? `#${link.anchor}` : `/#${link.anchor}`;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasAnimated = useRef(false);
  const shouldAnimate = !hasAnimated.current;
  if (shouldAnimate) hasAnimated.current = true;

  return (
    <motion.nav
      initial={shouldAnimate ? { y: -100 } : false}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background shadow-md shadow-primary/10`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto pe-[1cm] ps-4 sm:ps-6 lg:ps-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-primary-foreground font-black text-xs md:text-sm leading-none">3D</span>
            </div>
            <span className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              ECO<span className="text-secondary">Shoham</span>
            </span>
          </a>

          {/* Desktop Nav — מרווח אופקי אחיד בין טאבים */}
          <div className="hidden lg:flex items-center min-w-0 shrink mr-8 xl:mr-10">
            <nav
              className="flex items-center gap-x-6"
              aria-label="ניווט ראשי"
            >
              {navLinks.map((link) => {
                const isActive = link.activeWhen ? link.activeWhen(window.location.pathname) : false;
                return (
                  <a
                    key={link.label}
                    href={getHref(link)}
                    {...(link.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    {...(link.activeWhen ? { 'aria-label': link.label, 'aria-current': isActive ? 'page' : undefined } : {})}
                    className={`text-sm xl:text-base font-semibold transition-colors relative group whitespace-nowrap ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}
                  >
                    {link.label}
                    <span className={`absolute -bottom-1 right-0 h-0.5 bg-secondary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </a>
                );
              })}
            </nav>
            <div className="flex items-center gap-3 ms-6 ps-6 border-s border-border/40 shrink-0">
              {user ? (
                <>
                  <a
                    href="/admin"
                    className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors border border-border/50 px-3 py-1.5 rounded-full hover:border-primary/30 whitespace-nowrap"
                  >
                    🔐 מנהל
                  </a>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors whitespace-nowrap"
                  >
                    התנתק
                  </button>
                </>
              ) : (
                <a
                  href="/admin"
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors border border-primary/30 px-3 py-1.5 rounded-full hover:border-primary/60 whitespace-nowrap"
                >
                  🔓 התחבר
                </a>
              )}
              <Button
                asChild
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full px-5 xl:px-6 text-sm shadow-lg shadow-accent/25 whitespace-nowrap"
              >
                <a href={isHome() ? '#products' : '/#products'} className="flex items-center gap-1.5">
                  גלו את הערכות
                  <ChevronLeft className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Mobile/Tablet Toggle */}
          <button
            type="button"
            className="lg:hidden p-3 -m-1 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => {
                const isActive = link.activeWhen ? link.activeWhen(window.location.pathname) : false;
                return (
                  <a
                    key={link.label}
                    href={getHref(link)}
                    {...(link.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    {...(link.activeWhen ? { 'aria-label': link.label, 'aria-current': isActive ? 'page' : undefined } : {})}
                    className={`block py-3 text-lg font-medium transition-colors touch-manipulation ${isActive ? 'text-primary font-bold' : 'text-foreground/80 hover:text-primary active:text-primary'}`}
                    onClick={(e) => {
                      setMobileOpen(false);
                      if (link.external) return;
                      if (link.anchor) {
                        e.preventDefault();
                        setTimeout(() => {
                          const el = document.getElementById(link.anchor);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
                      }
                    }}
                  >
                    {link.label}
                  </a>
                );
              })}
              <div className="border-t border-border/40 pt-3 mt-3 space-y-1">
                {user ? (
                  <>
                    <a
                      href="/admin"
                      className="block py-3 text-lg font-bold text-primary active:text-primary/70 touch-manipulation"
                      onClick={() => setMobileOpen(false)}
                    >
                      🔐 לוח בקרה
                    </a>
                    {user.role === 'admin' && (
                      <a
                        href="/editor"
                        className="block py-3 text-lg font-bold text-primary active:text-primary/70 touch-manipulation"
                        onClick={() => setMobileOpen(false)}
                      >
                        ✏️ ערוך אתר
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="block py-3 text-lg font-medium text-destructive active:text-destructive/70 touch-manipulation"
                    >
                      התנתק
                    </button>
                  </>
                ) : (
                  <a
                    href="/admin"
                    className="block py-3 text-lg font-bold text-primary active:text-primary/70 touch-manipulation"
                    onClick={() => setMobileOpen(false)}
                  >
                    🔓 התחבר
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
