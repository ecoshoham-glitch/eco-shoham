import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const isHome = () => window.location.pathname === '/';

const navLinks = [
  { label: 'דף הבית', href: '/' },
  { label: 'אודות', anchor: 'about' },
  { label: 'חדשנות פדגוגית', anchor: 'problem' },
  { label: 'מגזין', href: '/blog' },
  { label: 'קהילת מורים', href: '/community' },
  { label: 'צור קשר', anchor: 'footer' },
  { label: 'חומרי עזר', href: '/resources' },
  { label: 'ממליצים עלינו', anchor: 'testimonials' },
];

const getHref = (link) => {
  if (link.href) return link.href;
  return isHome() ? `#${link.anchor}` : `/#${link.anchor}`;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background shadow-md shadow-primary/10`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={getHref(link)}
                className="text-sm xl:text-base font-semibold text-foreground/80 hover:text-primary transition-colors relative group whitespace-nowrap"
              >
                {link.label}
                <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            <div className="flex items-center gap-2 border-r border-border/40 pr-5 xl:pr-7">
              {user ? (
                <>
                  <a
                    href="/admin"
                    className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors border border-border/50 px-3 py-1.5 rounded-full hover:border-primary/30 whitespace-nowrap"
                  >
                    🔐 מנהל
                  </a>
                  <button
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
            </div>
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

          {/* Mobile/Tablet Toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={getHref(link)}
                  className="block py-2 text-lg font-medium text-foreground/80 hover:text-primary transition-colors"
                  onClick={(e) => {
                    setMobileOpen(false);
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
              ))}
              {user?.role === 'admin' && (
                <a
                  href="/editor"
                  className="block py-2 text-lg font-bold text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  ✏️ ערוך אתר
                </a>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
