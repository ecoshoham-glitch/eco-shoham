import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Star, Loader2, CheckCircle2 } from 'lucide-react';

export default function SubmitTestimonialModal({ onClose }) {
  const [form, setForm] = useState({ author_name: '', title: '', text: '', rating: 5 });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.PendingTestimonial.create({ ...form, status: 'pending' });
    setLoading(false);
    setDone(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        dir="rtl"
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h3 className="text-lg font-black text-primary">שתפו את חוויתכם</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {done ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-secondary mx-auto" />
              <h4 className="text-lg font-black text-primary">תודה רבה!</h4>
              <p className="text-muted-foreground text-sm">ההמלצה שלכם התקבלה ותפורסם לאחר אישור.</p>
              <Button onClick={onClose} className="mt-2 bg-secondary text-white rounded-xl">סגור</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">שם מלא *</label>
                  <Input value={form.author_name} onChange={e => setForm({...form, author_name: e.target.value})} placeholder="ישראל ישראלי" required className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">תפקיד / בית ספר</label>
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder='מורה ביולוגיה, תיכון...' className="rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">דירוג</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <button type="button" key={i} onClick={() => setForm({...form, rating: i})}>
                      <Star className={`w-6 h-6 transition-colors ${i <= form.rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">ההמלצה שלכם *</label>
                <textarea
                  value={form.text}
                  onChange={e => setForm({...form, text: e.target.value})}
                  placeholder="שתפו את הניסיון שלכם עם מודלי ECOShoham..."
                  required
                  rows={4}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-secondary text-white rounded-xl py-5 font-bold">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />שולח...</> : 'שלחו המלצה'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">ההמלצה תפורסם לאחר אישור המנהל</p>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}