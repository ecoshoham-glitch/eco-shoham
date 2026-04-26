import React, { useState, useMemo } from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import BlogHero from '../components/blog/BlogHero';
import BlogFilters from '../components/blog/BlogFilters';
import BlogGrid from '../components/blog/BlogGrid';

export const ALL_POSTS = [
  {
    id: 10,
    image: '/images/7815f88c1_generated_image.png',
    category: 'פדגוגיה',
    categoryColor: 'bg-primary/10 text-primary',
    emoji: '🖊️',
    title: 'בניית מודל לימודי באמצעות טכנולוגיות תלת-ממד | מוטי אשר',
    excerpt: 'כיצד עט תלת-ממד ומדפסת תלת-ממד יכולים להפוך שיעורי ביולוגיה לחוויה מוחשית ובלתי נשכחת? מורה מבית ספר בגין בראש העין משתף בגישה חדשנית להוראת מ-DNA לחלבון.',
    source: 'שמורת טבע – עלון מורי הביולוגיה, גיליון 202',
    readTime: '7 דקות קריאה',
    date: '2023-02-01',
    featured: true,
  },
  {
    id: 9,
    image: '/images/cd023e73e_generated_image.png',
    category: 'מחקר',
    categoryColor: 'bg-secondary/10 text-secondary',
    emoji: '🔭',
    title: 'מעבר לשינון: המדע מאחורי למידה מוחשית בתלת-מימד',
    excerpt: 'הוראת STEM מציבה אתגר קבוע: איך מסבירים תהליכים מורכבים ובלתי נראים? המחקר האקדמי מצביע בבירור על פתרון אחד — למידה פעילה במודלים מוחשיים.',
    source: 'PNAS, CBE-LSE, Journal of Chemical Education',
    readTime: '6 דקות קריאה',
    date: '2026-03-21',
    featured: true,
  },
  {
    id: 1,
    image: '/images/26a87cd03_generated_image.png',
    category: 'מחקר',
    categoryColor: 'bg-secondary/10 text-secondary',
    emoji: '📊',
    title: 'למה למידה אקטיבית מפחיתה את אחוזי הכישלון ב-55%?',
    excerpt: 'מטא-אנליזה מקיפה שפורסמה בכתב העת PNAS חושפת נתונים מדהימים על היתרונות של שילוב למידה פעילה בשיעורי STEM. המחקר כלל יותר מ-225 מחקרים ו-46,000 תלמידים.',
    source: 'PNAS Journal',
    sourceUrl: 'https://www.pnas.org/doi/10.1073/pnas.1319030111',
    readTime: '5 דקות קריאה',
    date: '2026-03-10',
    featured: true,
  },
  {
    id: 2,
    image: '/images/013a92372_generated_image.png',
    category: 'מדעי המוח',
    categoryColor: 'bg-accent/10 text-accent',
    emoji: '🧠',
    title: 'להבין את הבלתי נראה: הכוח של מודלים תלת-מימדיים',
    excerpt: 'מחקר מכתב העת CBE—Life Sciences Education מוכיח כי מגע פיזי במודלים משפר דרמטית את הבנת התלמידים בתהליכים תאיים מורכבים כגון שעתוק ותרגום.',
    source: 'CBE Life Sciences Education',
    sourceUrl: 'https://www.lifescied.org/doi/10.1187/cbe.19-11-0255',
    readTime: '4 דקות קריאה',
    date: '2026-03-01',
    featured: true,
  },
  {
    id: 3,
    image: '/images/a82899073_generated_image.png',
    category: 'פדגוגיה',
    categoryColor: 'bg-primary/10 text-primary',
    emoji: '💡',
    title: 'סוף לשינון: כך מודלים מוחשיים מפחיתים עומס קוגניטיבי',
    excerpt: 'על פי פרסומים ב-Journal of Chemical Education, שימוש במודלים תלת-מימדיים מונע תפיסות שגויות ומקל על המוח לעבד מידע מרחבי — הפחתה של 40% בעומס הקוגניטיבי.',
    source: 'Journal of Chemical Education',
    sourceUrl: 'https://pubs.acs.org/journal/jceda8',
    readTime: '6 דקות קריאה',
    date: '2026-02-20',
    featured: false,
  },
  {
    id: 4,
    image: '/images/507eef642_generated_image.png',
    category: 'חדשנות',
    categoryColor: 'bg-chart-4/10 text-chart-4',
    emoji: '🚀',
    title: 'STEM בישראל 2026: מגמות ואתגרים בהוראת מדעים',
    excerpt: 'סקירה מקיפה של מצב הוראת המדעים בישראל, פערים בין בתי ספר, ומה אפשר לעשות כדי לשפר את הישגי התלמידים בתחומי STEM.',
    source: 'משרד החינוך',
    sourceUrl: 'https://edu.gov.il',
    readTime: '7 דקות קריאה',
    date: '2026-02-10',
    featured: false,
  },
  {
    id: 5,
    image: '/images/024b7449d_generated_image.png',
    category: 'מחקר',
    categoryColor: 'bg-secondary/10 text-secondary',
    emoji: '🔬',
    title: 'ביולוגיה מולקולרית בכיתה: מה עובד ומה לא?',
    excerpt: 'ניתוח של שיטות הוראה שונות לביולוגיה מולקולרית, ומדוע שיטות המשלבות מודלים פיזיים מביאות לתוצאות טובות משמעותית בבחינות הבגרות.',
    source: 'International Journal of Science Education',
    sourceUrl: 'https://www.tandfonline.com/journals/tsed20',
    readTime: '5 דקות קריאה',
    date: '2026-01-28',
    featured: false,
  },
  {
    id: 6,
    image: '/images/91de386a8_generated_image.png',
    category: 'פדגוגיה',
    categoryColor: 'bg-primary/10 text-primary',
    emoji: '👩‍🏫',
    title: 'מורה כמנחה: שינוי תפקיד המורה בעידן הלמידה הפעילה',
    excerpt: 'כיצד הגישה הפדגוגית של למידה פעילה משנה את תפקיד המורה ממרצה לחוויה ללמידה? מדריך מעשי למורים שרוצים לאמץ שינוי.',
    source: 'Edutopia',
    sourceUrl: 'https://www.edutopia.org/active-learning',
    readTime: '4 דקות קריאה',
    date: '2026-01-15',
    featured: false,
  },
  {
    id: 7,
    image: '/images/fa5be0153_generated_image.png',
    category: 'מדעי המוח',
    categoryColor: 'bg-accent/10 text-accent',
    emoji: '⚡',
    title: 'תיאוריית העומס הקוגניטיבי ויישומה בשיעורי מדעים',
    excerpt: 'הכירו את אחת התיאוריות המשפיעות ביותר על עיצוב חומרי לימוד, ומדוע מודלים תלת-מימדיים עונים בדיוק על הצרכים הקוגניטיביים של המוח הלומד.',
    source: 'Cognitive Science',
    sourceUrl: 'https://onlinelibrary.wiley.com/journal/15516709',
    readTime: '8 דקות קריאה',
    date: '2025-12-20',
    featured: false,
  },
  {
    id: 8,
    image: '/images/5b5c87ced_generated_image.png',
    category: 'חדשנות',
    categoryColor: 'bg-chart-4/10 text-chart-4',
    emoji: '🌍',
    title: 'מה אפשר ללמוד מהוראת מדעים בפינלנד, סינגפור ואסטוניה?',
    excerpt: 'מדינות המובילות בהישגים בינלאומיים בחינוך מדעי חולקות מכנה משותף אחד: שילוב מסיבי של למידה חקרנית ומוחשית בתכניות הלימודים.',
    source: 'PISA Report 2025',
    sourceUrl: 'https://www.oecd.org/pisa/',
    readTime: '6 דקות קריאה',
    date: '2025-12-05',
    featured: false,
  },
];

export const CATEGORIES = ['הכל', 'מחקר', 'מדעי המוח', 'פדגוגיה', 'חדשנות'];

export default function Blog() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('הכל');

  const filtered = useMemo(() => {
    return ALL_POSTS.filter((p) => {
      const matchCat = activeCategory === 'הכל' || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-background font-heebo">
      <Navbar />
      <BlogHero search={search} onSearch={setSearch} />
      <BlogFilters categories={CATEGORIES} active={activeCategory} onChange={setActiveCategory} />
      <BlogGrid posts={filtered} />
      <Footer />
    </div>
  );
}