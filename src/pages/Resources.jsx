import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { TEACHER_RESOURCES_DRIVE_URL } from "@/lib/teacherResources";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

export default function Resources() {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center font-heebo">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== "teacher") {
    return (
      <main
        className="mx-auto max-w-lg px-6 py-16 font-heebo text-center"
        dir="rtl"
      >
        <h1 className="text-2xl font-black text-primary">חומרי עזר</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          התכנים נגישים למורים שהמנהל הוסיף אותם בלוח הניהול. התחברו עם אותו
          אימייל או מספר טלפון שמופיעים ברשימת המורים.
        </p>
        <Button asChild className="mt-8 rounded-xl font-bold">
          <Link to="/admin?return=/resources">מעבר להתחברות</Link>
        </Button>
        <div className="mt-6">
          <Link to="/" className="text-sm text-primary underline">
            חזרה לדף הבית
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 font-heebo" dir="rtl">
      <h1 className="text-3xl font-bold text-primary">חומרי עזר</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        כאן מרוכזים חומרי העזר לערכת הריבוזום. ניתן לפתוח את תיקיית Google Drive
        עם המצגות, המסמכים והסרטונים.
      </p>
      <a
        href={TEACHER_RESOURCES_DRIVE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
      >
        פתיחת תיקיית Drive — ערכת ריבוזום למורה
      </a>
      <p className="mt-4 text-xs text-muted-foreground break-all" dir="ltr">
        {TEACHER_RESOURCES_DRIVE_URL}
      </p>
      <Link to="/" className="mt-10 inline-block text-sm text-primary underline">
        חזרה לדף הבית
      </Link>
    </main>
  );
}
