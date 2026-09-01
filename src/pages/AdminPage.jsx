import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Star, Loader2, ShieldCheck, ShieldAlert, Home, Pencil, LogIn, Eye, EyeOff, UserPlus, Trash2, Download, FileSpreadsheet, Settings, Plus, GripVertical, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { getSubmissions, clearSubmissions, deleteSubmission, exportToExcel, getFormFields, saveFormFields, resetFormFields } from '@/lib/formSubmissions';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const trimmedUsername = username.trim();
  const needsPassword = base44.auth.isPasswordRequired(trimmedUsername);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const success = onLogin(trimmedUsername, needsPassword ? password : undefined);
    if (!success) {
      setError('פרטי התחברות שגויים');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center font-heebo" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-sm border border-border">
        <div className="text-center mb-6">
          <LogIn className="w-14 h-14 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black text-primary mb-2">כניסה למערכת</h2>
          <p className="text-muted-foreground text-sm">
            מנהלים ומורים רשומים: הזינו את כתובת האימייל או מספר הטלפון כפי שנרשמו בלוח הניהול.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">שם משתמש</label>
            <Input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your@email.com או 0501234567"
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

function FormSubmissionsSection() {
  const [submissions, setSubmissions] = useState([]);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    setSubmissions(getSubmissions());
    setFields(getFormFields());
  }, []);

  const handleExport = () => exportToExcel(submissions, fields);
  const handleClear = () => {
    if (confirm('האם למחוק את כל הנתונים? פעולה זו בלתי הפיכה.')) {
      clearSubmissions();
      setSubmissions([]);
    }
  };
  const handleDeleteRow = (id) => {
    const updated = deleteSubmission(id);
    setSubmissions(updated);
  };

  return (
    <section className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black text-primary">נתוני טפסים ({submissions.length})</h2>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="gap-1.5 rounded-full bg-secondary hover:bg-secondary/90"
            onClick={handleExport}
            disabled={!submissions.length}
          >
            <Download className="w-4 h-4" />
            הורד אקסל
          </Button>
          {submissions.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 rounded-full border-destructive/40 text-destructive hover:bg-destructive/5"
              onClick={handleClear}
            >
              <Trash2 className="w-4 h-4" />
              נקה הכל
            </Button>
          )}
        </div>
      </div>

      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">עדיין לא התקבלו נתונים מהטופס.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right py-2 px-2 font-bold text-primary">#</th>
                {fields.slice(0, 5).map(f => (
                  <th key={f.id} className="text-right py-2 px-2 font-bold text-primary whitespace-nowrap">{f.label}</th>
                ))}
                <th className="text-right py-2 px-2 font-bold text-primary">תאריך</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {submissions.slice(0, 50).map((sub, i) => (
                <tr key={sub.id} className="border-b border-border/30 hover:bg-muted/20 group">
                  <td className="py-2 px-2 text-muted-foreground">{i + 1}</td>
                  {fields.slice(0, 5).map(f => (
                    <td key={f.id} className="py-2 px-2 whitespace-nowrap">{sub[f.id] || '-'}</td>
                  ))}
                  <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('he-IL') : '-'}
                  </td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => handleDeleteRow(sub.id)}
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-opacity p-1 rounded-lg hover:bg-destructive/10 touch-manipulation"
                      title="מחק שורה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {submissions.length > 50 && (
            <p className="text-xs text-muted-foreground mt-2">מוצגים 50 מתוך {submissions.length}. הורידו אקסל לצפייה בכל הנתונים.</p>
          )}
        </div>
      )}
    </section>
  );
}

function FormFieldsEditor() {
  const [fields, setFields] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFields(getFormFields());
  }, []);

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const updateOption = (fieldIndex, optIndex, value) => {
    const updated = [...fields];
    const opts = [...(updated[fieldIndex].options || [])];
    opts[optIndex] = value;
    updated[fieldIndex] = { ...updated[fieldIndex], options: opts };
    setFields(updated);
  };

  const addOption = (fieldIndex) => {
    const updated = [...fields];
    const opts = [...(updated[fieldIndex].options || []), ''];
    updated[fieldIndex] = { ...updated[fieldIndex], options: opts };
    setFields(updated);
  };

  const removeOption = (fieldIndex, optIndex) => {
    const updated = [...fields];
    const opts = (updated[fieldIndex].options || []).filter((_, i) => i !== optIndex);
    updated[fieldIndex] = { ...updated[fieldIndex], options: opts };
    setFields(updated);
  };

  const addField = () => {
    const id = 'field_' + Date.now();
    setFields([...fields, { id, label: 'שדה חדש', type: 'text', required: false, placeholder: '' }]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFields(updated);
  };

  const handleSave = () => {
    saveFormFields(fields);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('האם לאפס את שדות הטופס לברירת המחדל?')) {
      resetFormFields();
      setFields(getFormFields());
      setEditing(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black text-primary">עריכת שדות הטופס</h2>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <Button size="sm" className="gap-1.5 rounded-full" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4" />
              ערוך
            </Button>
          ) : (
            <>
              <Button size="sm" className="gap-1.5 rounded-full bg-secondary hover:bg-secondary/90" onClick={handleSave}>
                <CheckCircle2 className="w-4 h-4" />
                שמור
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 rounded-full" onClick={() => { setFields(getFormFields()); setEditing(false); }}>
                ביטול
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 rounded-full border-destructive/40 text-destructive hover:bg-destructive/5" onClick={handleReset}>
                איפוס
              </Button>
            </>
          )}
        </div>
      </div>

      {saved && <p className="text-secondary text-sm mb-3">השינויים נשמרו! רענן את הדף הראשי כדי לראות אותם.</p>}

      <div className="space-y-3">
        {fields.map((field, i) => (
          <div key={field.id} className="border border-border/50 rounded-xl p-3">
            {editing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveField(i, -1)} className="text-xs text-muted-foreground hover:text-primary" disabled={i === 0}>▲</button>
                    <button onClick={() => moveField(i, 1)} className="text-xs text-muted-foreground hover:text-primary" disabled={i === fields.length - 1}>▼</button>
                  </div>
                  <div className="flex-1 grid sm:grid-cols-4 gap-2">
                    <Input
                      value={field.label}
                      onChange={e => updateField(i, 'label', e.target.value)}
                      placeholder="שם השדה"
                      className="rounded-lg text-sm"
                    />
                    <Input
                      value={field.placeholder || ''}
                      onChange={e => updateField(i, 'placeholder', e.target.value)}
                      placeholder="placeholder"
                      className="rounded-lg text-sm"
                    />
                    <select
                      value={field.type}
                      onChange={e => updateField(i, 'type', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border text-sm"
                    >
                      <option value="text">טקסט</option>
                      <option value="tel">טלפון</option>
                      <option value="email">אימייל</option>
                      <option value="select">תפריט בחירה</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={field.required || false} onChange={e => updateField(i, 'required', e.target.checked)} />
                        חובה
                      </label>
                      <button onClick={() => removeField(i)} className="text-destructive hover:text-destructive/80 mr-auto">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {field.type === 'select' && (
                  <div className="mr-8 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">אפשרויות:</p>
                    {(field.options || []).map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <Input
                          value={opt}
                          onChange={e => updateOption(i, oi, e.target.value)}
                          className="rounded-lg text-sm flex-1"
                          placeholder={`אפשרות ${oi + 1}`}
                        />
                        <button onClick={() => removeOption(i, oi)} className="text-destructive">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addOption(i)} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" /> הוסף אפשרות
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{field.label}</span>
                <span className="text-xs text-muted-foreground">({field.type === 'select' ? 'בחירה' : field.type})</span>
                {field.required && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">חובה</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <button onClick={addField} className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Plus className="w-4 h-4" /> הוסף שדה חדש
        </button>
      )}
    </section>
  );
}

export default function AdminPage() {
  const [searchParams] = useSearchParams();
  const { user, isLoadingAuth, login } = useAuth();
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherError, setTeacherError] = useState('');
  const [teacherSuccess, setTeacherSuccess] = useState('');
  const [teacherLoading, setTeacherLoading] = useState(false);

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

  const loadTeachers = async () => {
    try {
      const items = await base44.auth.listTeacherUsers();
      setTeachers(items.sort((a, b) => (b.created_date || '').localeCompare(a.created_date || '')));
    } catch (err) {
      console.error('Failed to load teacher users:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      load();
      loadTeachers();
    }
  }, [isAdmin]);

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

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setTeacherError('');
    setTeacherSuccess('');

    const u = teacherUsername.trim();
    if (!u) {
      setTeacherError('יש להזין שם משתמש');
      return;
    }

    setTeacherLoading(true);
    try {
      await base44.auth.createTeacherUser({
        username: u,
        name: teacherName.trim(),
      });
      setTeacherUsername('');
      setTeacherName('');
      setTeacherSuccess('משתמש מורה נוסף בהצלחה');
      await loadTeachers();
    } catch (err) {
      setTeacherError(err?.message || 'הוספת משתמש נכשלה');
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    setTeacherError('');
    setTeacherSuccess('');
    try {
      await base44.auth.deleteTeacherUser(id);
      await loadTeachers();
    } catch (err) {
      setTeacherError('מחיקת משתמש נכשלה');
    }
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

  if (user.role === 'teacher') {
    const rawReturn = searchParams.get('return');
    const returnTo =
      rawReturn && rawReturn.startsWith('/') && !rawReturn.startsWith('//')
        ? rawReturn
        : '/resources';
    return <Navigate to={returnTo} replace />;
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
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-0">
              <button
                onClick={() => window.history.back()}
                className="p-3 -m-1 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation"
                title="אחורה"
              >
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </button>
              <button
                onClick={() => window.history.forward()}
                className="p-3 -m-1 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation"
                title="קדימה"
              >
                <ChevronLeft className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
            <h1 className="text-base sm:text-xl font-black text-primary truncate">לוח בקרה</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Link to="/editor">
              <Button size="sm" className="gap-1.5 rounded-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-2 min-h-[44px] touch-manipulation">
                <Pencil className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">ערוך אתר</span>
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full active:bg-muted text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-2 min-h-[44px] touch-manipulation">
                <Home className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">דף הבית</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* Form Submissions */}
        <FormSubmissionsSection />

        {/* Form Fields Editor */}
        <FormFieldsEditor />

        {/* Teachers */}
        <section className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-primary">משתמשי מורה</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            רק מורים שמופיעים כאן יכולים להתחבר עם אותו אימייל או מספר טלפון ולצפות בלשונית «חומרי עזר».
          </p>

          <form onSubmit={handleAddTeacher} className="grid sm:grid-cols-3 gap-3 mb-4">
            <Input
              type="text"
              value={teacherUsername}
              onChange={(e) => setTeacherUsername(e.target.value)}
              placeholder="אימייל או טלפון"
              className="rounded-xl"
              dir="ltr"
              required
            />
            <Input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="שם המורה (אופציונלי)"
              className="rounded-xl"
            />
            <Button type="submit" className="rounded-xl gap-2" disabled={teacherLoading}>
              {teacherLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              הוסף מורה
            </Button>
          </form>

          {teacherError && <p className="text-destructive text-sm mb-3">{teacherError}</p>}
          {teacherSuccess && <p className="text-secondary text-sm mb-3">{teacherSuccess}</p>}

          {teachers.length === 0 ? (
            <p className="text-sm text-muted-foreground">עדיין לא נוספו משתמשי מורה.</p>
          ) : (
            <div className="space-y-2">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold">{teacher.name || 'מורה'}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">{teacher.username}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-destructive border-destructive/40 hover:bg-destructive/5"
                    onClick={() => handleDeleteTeacher(teacher.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

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
