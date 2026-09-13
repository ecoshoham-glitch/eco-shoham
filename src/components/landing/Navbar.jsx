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
      {/* בלי max-w-7xl: התוכן חייב להתפרש על כל רוחב ה-navbar בפועל (בלי
          תקרה מלאכותית), אחרת justify-between מפזר את המרווחים רק בתוך
          1280px ממורכזים, לא ברוחב המסך האמיתי — בדיוק מה שגרם למרווחים
          הזעירים (4-5px) שהתגלו קודם, גם במסכים רחבים בהרבה. */}
      <div className="w-full pe-[1cm] ps-4 sm:ps-6 lg:ps-8">
        {/* שורת דסקטופ: כל "הכפתורים" (שני הלוגואים + כל קישורי הניווט +
            כניסה/מנהל + "גלו את הערכות") הם אחים ישירים תחת flex יחיד עם
            justify-between — לא מקוננים בקבוצות עם gap-x/gap-3 נפרדים
            כמו קודם. justify-between על רשימה שטוחה כזו מבטיח: הפריט
            הראשון (הלוגו) בדיוק בקצה הימני, האחרון (CTA) בדיוק בקצה
            השמאלי, וכל המרווחים ביניהם שווים באמת — לא רק "נראים דומה".
            נפרדת לגמרי משורת המובייל למטה (לא אותם אלמנטים, לא שיתוף
            state) כי "מרווח שווה בין כל כפתור" לא רלוונטי במובייל, ששם
            מוצגים רק שני הלוגואים + כפתור ההמבורגר. */}
        <div className="hidden xl:flex items-center justify-between h-20">
          <a href="/" className="flex items-center h-full flex-shrink-0" aria-label="FG-Flying Giraph">
            <img
              src="/images/לוגו מעודכן copy.png"
              alt="FG-Flying Giraph — בונים חוויה, עפים על הלמידה"
              className="h-full w-auto object-contain"
            />
          </a>

          <a href="/" className="flex items-center gap-2 h-full flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-primary-foreground font-black text-sm leading-none">3D</span>
            </div>
            <span className="text-3xl font-black text-primary tracking-tight">
              ECO<span className="text-secondary">Shoham</span>
            </span>
          </a>

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
                className={`text-sm xl:text-base font-semibold transition-colors relative group whitespace-nowrap flex-shrink-0 ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}
              >
                {link.label}
                <span className={`absolute -bottom-1 right-0 h-0.5 bg-secondary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </a>
            );
          })}

          {user ? (
            <>
              <a
                href="/admin"
                className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors border border-border/50 px-3 py-1.5 rounded-full hover:border-primary/30 whitespace-nowrap flex-shrink-0"
              >
                🔐 מנהל
              </a>
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors whitespace-nowrap flex-shrink-0"
              >
                התנתק
              </button>
            </>
          ) : (
            <a
              href="/admin"
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors border border-primary/30 px-3 py-1.5 rounded-full hover:border-primary/60 whitespace-nowrap flex-shrink-0"
            >
              🔓 התחבר
            </a>
          )}

          <Button
            asChild
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full px-5 xl:px-6 text-sm shadow-lg shadow-accent/25 whitespace-nowrap flex-shrink-0"
          >
            <a href={isHome() ? '#products' : '/#products'} className="flex items-center gap-1.5">
              גלו את הערכות
              <ChevronLeft className="w-4 h-4" />
            </a>
          </Button>
        </div>

        {/* שורת מובייל/טאבלט — נפרדת לגמרי מהדסקטופ (לא אלמנטים משותפים),
            אותו אשכול-לוגואים קומפקטי כמו קודם (gap-[0.5cm] קבוע, לא
            שווה-מרחק כי אין כאן "כפתורים" נוספים לפזר ביניהם) + המבורגר. */}
        <div className="flex xl:hidden items-center justify-between h-16">
          <div className="flex items-center gap-[0.5cm] h-full">
            <a href="/" className="flex items-center h-full flex-shrink-0" aria-label="FG-Flying Giraph">
              <img
                src="/images/לוגו מעודכן copy.png"
                alt="FG-Flying Giraph — בונים חוויה, עפים על הלמידה"
                className="h-full w-auto object-contain"
              />
            </a>
            <a href="/" className="flex items-center gap-2 h-full">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-primary-foreground font-black text-xs leading-none">3D</span>
              </div>
              <span className="text-2xl font-black text-primary tracking-tight">
                ECO<span className="text-secondary">Shoham</span>
              </span>
            </a>
          </div>

          <button
            type="button"
            className="p-3 -m-1 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
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
            className="xl:hidden bg-background border-t border-border"
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
