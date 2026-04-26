import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Star, Loader2, ShieldCheck, ShieldAlert, Home, Pencil, LogIn, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-accent text-accent' : 'text-muted'}`} />
      ))}
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const needsPassword = !base44.auth.isEmailOnlyAdmin(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const success = onLogin(email, needsPassword ? password : undefined);
    if (!success) {
      setError(needsPassword ? 'פרטי התחברות שגויים' : 'כתובת אימייל לא מורשית');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center font-heebo" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-sm border border-border">
        <div className="text-center mb-6">
          <LogIn className="w-14 h-14 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black text-primary mb-2">כניסת מנהל</h2>
          <p className="text-muted-foreground text-sm">הזינו כתובת אימייל</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">אימייל</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="rounded-xl"
              dir="ltr"
            />
          </div>
          {needsPassword && (
            <div>
              <label className="block text-sm font-semibold mb-1.5">סיסמה</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="rounded-xl pl-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full rounded-xl py-5 font-bold">
            התחבר
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-primary hover:underline">← חזרה לדף הבית</Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, isLoadingAuth, login } = useAuth();
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const isAdmin = user?.role === 'admin';

  const load = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        base44.entities.PendingTestimonial.filter({ status: 'pending' }, '-created_date'),
        base44.entities.Testimonial.list('-created_date', 50)
      ]);
      setPending(p);
      setApproved(a);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const handleApprove = async (item) => {
    setActionLoading(item.id + '_approve');
    try {
      await base44.entities.Testimonial.create({
        author_name: item.author_name,
        title: item.title || '',
        text: item.text,
        rating: item.rating || 5
      });
      await base44.entities.PendingTestimonial.update(item.id, { status: 'approved' });
      await load();
    } catch (err) {
      console.error('Failed to approve testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (item) => {
    setActionLoading(item.id + '_reject');
    try {
      await base44.entities.PendingTestimonial.update(item.id, { status: 'rejected' });
      setPending(prev => prev.filter(p => p.id !== item.id));
    } catch (err) {
      console.error('Failed to reject testimonial:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteApproved = async (id) => {
    await base44.entities.Testimonial.delete(id);
    setApproved(prev => prev.filter(t => t.id !== id));
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center font-heebo" dir="rtl">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-sm border border-border">
          <ShieldAlert className="w-14 h-14 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-black text-primary mb-2">אין גישה</h2>
          <p className="text-muted-foreground">עמוד זה נגיש לבעל האתר בלבד.</p>
          <Button className="mt-6 rounded-full" onClick={() => window.location.href = '/'}>חזרה לדף הבית</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 font-heebo" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-black text-primary">לוח בקרה – ECOShoham</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Link to="/editor">
              <Button size="sm" className="gap-1.5 rounded-full bg-primary hover:bg-primary/90">
                <Pencil className="w-4 h-4" />
                ערוך אתר
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                <Home className="w-4 h-4" />
                דף הבית
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* Pending */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-black text-primary">המלצות ממתינות לאישור</h2>
            <Badge className="bg-accent/10 text-accent border-accent/20 font-bold">{pending.length}</Badge>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : pending.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-muted-foreground border border-border/50">
              אין המלצות ממתינות לאישור
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {pending.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl border border-border/50 shadow-sm p-5"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-primary">{item.author_name}</p>
                        {item.title && <p className="text-xs text-muted-foreground">{item.title}</p>}
                      </div>
                      <StarRating rating={item.rating || 5} />
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">"{item.text}"</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-secondary hover:bg-secondary/90 text-white rounded-xl gap-1.5 text-xs"
                        disabled={actionLoading === item.id + '_approve'}
                        onClick={() => handleApprove(item)}
                      >
                        {actionLoading === item.id + '_approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        אשר ופרסם
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/5 rounded-xl gap-1.5 text-xs"
                        disabled={actionLoading === item.id + '_reject'}
                        onClick={() => handleReject(item)}
                      >
                        {actionLoading === item.id + '_reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        דחה
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Approved */}
        <section>
          <h2 className="text-xl font-black text-primary mb-4">המלצות מפורסמות ({approved.length})</h2>
          {approved.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-muted-foreground border border-border/50">
              אין המלצות מפורסמות עדיין
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {approved.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-secondary/20 shadow-sm p-4">
                  <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs mb-2">מפורסם</Badge>
                  <p className="font-bold text-primary text-sm">{item.author_name}</p>
                  {item.title && <p className="text-xs text-muted-foreground mb-1">{item.title}</p>}
                  <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3 mt-1">"{item.text}"</p>
                  <button onClick={() => handleDeleteApproved(item.id)} className="mt-3 text-xs text-destructive hover:underline">
                    הסר
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
