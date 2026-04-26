import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Heart, Plus, X, Upload, FileText, Lightbulb, BookOpen,
  HelpCircle, Search, Loader2, ChevronDown, ChevronUp, School
} from 'lucide-react';

const CATEGORIES = ['הכל', 'מערך שיעור', 'דף עבודה', 'טיפ מניסיון', 'שאלה לקהילה'];

const CATEGORY_META = {
  'מערך שיעור': { icon: BookOpen, color: 'bg-primary/10 text-primary border-primary/20' },
  'דף עבודה': { icon: FileText, color: 'bg-secondary/10 text-secondary border-secondary/20' },
  'טיפ מניסיון': { icon: Lightbulb, color: 'bg-accent/10 text-accent border-accent/20' },
  'שאלה לקהילה': { icon: HelpCircle, color: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
};

const emptyForm = { title: '', content: '', author_name: '', school: '', category: 'טיפ מניסיון', tags: '' };

function PostCard({ post, onLike }) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[post.category] || CATEGORY_META['טיפ מניסיון'];
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-xs px-2.5 py-0.5 border ${meta.color} font-semibold`}>
              <Icon className="w-3 h-3 ml-1" />
              {post.category}
            </Badge>
            {post.tags && post.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
              <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(post.created_date).toLocaleDateString('he-IL')}
          </span>
        </div>

        <h3 className="font-bold text-primary text-base sm:text-lg mb-1 leading-snug">{post.title}</h3>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <School className="w-3 h-3" />
          <span className="font-medium text-foreground/70">{post.author_name}</span>
          {post.school && <><span>•</span><span>{post.school}</span></>}
        </div>

        <p className={`text-sm text-foreground/75 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {post.content}
        </p>

        {post.content.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 text-xs text-secondary font-semibold flex items-center gap-1 hover:text-accent transition-colors"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" />הצג פחות</> : <><ChevronDown className="w-3 h-3" />קרא עוד</>}
          </button>
        )}

        {post.file_url && (
          <a
            href={post.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-secondary transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            צפה בקובץ המצורף
          </a>
        )}
      </div>

      <div className="px-5 py-3 border-t border-border/30 flex items-center justify-end">
        <button
          onClick={() => onLike(post)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors group"
        >
          <Heart className="w-4 h-4 group-hover:fill-accent group-hover:text-accent transition-all" />
          <span className="font-semibold">{post.likes || 0}</span>
        </button>
      </div>
    </motion.div>
  );
}

function NewPostForm({ onClose, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let file_url = '';
      if (file) {
        const res = await base44.integrations.Core.UploadFile({ file });
        file_url = res.file_url;
      }
      await base44.entities.CommunityPost.create({ ...form, likes: 0, file_url });
      onCreated();
    } catch (err) {
      console.error('Failed to submit post:', err);
    } finally {
      setLoading(false);
    }
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
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h3 className="text-lg font-black text-primary">שתפו את הניסיון שלכם</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">קטגוריה *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.slice(1).map(cat => {
                const meta = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      form.category === cat ? `${meta.color} border-current` : 'bg-muted text-muted-foreground border-border hover:border-primary/30'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">כותרת *</label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="למשל: מערך שיעור DNA לכיתה י'"
              required
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5">שמכם *</label>
              <Input
                value={form.author_name}
                onChange={e => setForm({ ...form, author_name: e.target.value })}
                placeholder="שם מלא"
                required
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">בית ספר</label>
              <Input
                value={form.school}
                onChange={e => setForm({ ...form, school: e.target.value })}
                placeholder="שם בית הספר"
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">תוכן *</label>
            <textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="שתפו את הניסיון, הטיפ או המערך שיעור שלכם..."
              required
              rows={5}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">תגיות (מופרדות בפסיק)</label>
            <Input
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="DNA, כיתה י, ביולוגיה"
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">קובץ מצורף (PDF, Word, תמונה)</label>
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{file ? file.name : 'בחרו קובץ'}</span>
              <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl py-5"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />מעלה...</> : 'פרסם לקהילה'}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function TeacherCommunity() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('הכל');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadPosts = async () => {
    const data = await base44.entities.CommunityPost.list('-created_date', 50);
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const handleLike = async (post) => {
    await base44.entities.CommunityPost.update(post.id, { likes: (post.likes || 0) + 1 });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: (p.likes || 0) + 1 } : p));
  };

  const filtered = posts.filter(p => {
    const matchCat = activeCategory === 'הכל' || p.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.author_name?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background font-heebo" dir="rtl">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/f8af1695a_WhatsAppImage2025-11-12at142748.png" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-background/80" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              👩‍🏫 קהילת מורים
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary mb-4 leading-tight">
              שתפו, למדו{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent">
                והשתייכו
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              מורים משתפים מערכי שיעור, דפי עבודה וטיפים מניסיונם האישי עם מודלי ECOShoham
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-full px-8 py-6 text-base shadow-lg shadow-secondary/25 gap-2"
            >
              <Plus className="w-5 h-5" />
              שתפו את הניסיון שלכם
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Filters + Search */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-white text-foreground/70 border-border hover:border-primary/40 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="חפשו פוסט..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-10 rounded-xl"
            />
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">🔍</span>
            <p className="mt-4 text-xl font-bold text-primary">לא נמצאו פוסטים</p>
            <p className="text-muted-foreground mt-2">היו הראשונים לשתף!</p>
            <Button onClick={() => setShowForm(true)} className="mt-6 bg-secondary text-white rounded-full gap-2">
              <Plus className="w-4 h-4" />שתפו עכשיו
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map(post => (
                <PostCard key={post.id} post={post} onLike={handleLike} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Footer />

      <AnimatePresence>
        {showForm && (
          <NewPostForm
            onClose={() => setShowForm(false)}
            onCreated={() => { setShowForm(false); loadPosts(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}