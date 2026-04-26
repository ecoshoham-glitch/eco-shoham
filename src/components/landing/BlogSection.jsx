import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const posts = [
  {
    id: 1,
    image: '/images/f22d11531_generated_image.png',
    tag: 'מחקר מוביל',
    tagColor: 'bg-secondary/10 text-secondary',
    emoji: '📊',
    title: 'למה למידה אקטיבית מפחיתה את אחוזי הכישלון ב-55%?',
    excerpt: 'מטא-אנליזה מקיפה שפורסמה בכתב העת PNAS חושפת נתונים מדהימים על היתרונות של שילוב למידה פעילה בשיעורי STEM.',
    source: 'PNAS Journal',
    readTime: '5 דקות קריאה',
  },
  {
    id: 2,
    image: '/images/dd9f6fd5a_generated_image.png',
    tag: 'מדעי המוח',
    tagColor: 'bg-accent/10 text-accent',
    emoji: '🧠',
    title: 'להבין את הבלתי נראה: הכוח של מודלים תלת-מימדיים',
    excerpt: 'מחקר מכתב העת CBE—Life Sciences Education מוכיח כי מגע פיזי במודלים משפר דרמטית את הבנת התלמידים בתהליכים תאיים.',
    source: 'CBE Life Sciences Education',
    readTime: '4 דקות קריאה',
  },
  {
    id: 3,
    image: '/images/fec4c4e91_generated_image.png',
    tag: 'פדגוגיה',
    tagColor: 'bg-primary/10 text-primary',
    emoji: '💡',
    title: 'סוף לשינון: כך מודלים מוחשיים מפחיתים עומס קוגניטיבי',
    excerpt: 'על פי פרסומים ב-Journal of Chemical Education, שימוש במודלים תלת-מימדיים מונע תפיסות שגויות ומקל על המוח לעבד מידע מרחבי.',
    source: 'Journal of Chemical Education',
    readTime: '6 דקות קריאה',
  },
];

export default function BlogSection() {
  return (
    <section id="blog" className="py-8 sm:py-14 relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-white/60 to-background" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            📚 מגזין פדגוגי
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-primary mb-3 sm:mb-4 leading-tight">
            מגזין ECOShoham:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent">
              מדע, חינוך ומה שביניהם
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            מחקרים עדכניים, תובנות פדגוגיות וכלים מעשיים למורי מדעים ורכזי STEM
          </p>
        </motion.div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group"
            >
              <div className="h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-md hover:shadow-lg sm:hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-secondary/30 hover:-translate-y-0.5 sm:hover:-translate-y-1 flex flex-col">
                {/* Image */}
                {post.image && (
                  <div className="overflow-hidden h-44">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}

                <div className="p-4 sm:p-6 lg:p-7 flex flex-col flex-1">
                  {/* Emoji + badge */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl">{post.emoji}</span>
                    <Badge className={`${post.tagColor} font-semibold text-xs px-2 sm:px-3`}>
                      {post.tag}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-primary leading-snug mb-2 sm:mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1 mb-4 sm:mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-border/40 pt-3 sm:pt-4 gap-2">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                      <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">{post.readTime}</span>
                      <span className="sm:hidden">{post.readTime.split(' ')[0]}d</span>
                    </div>
                    <Link
                      to={`/blog/${post.id}`}
                      className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-bold text-secondary hover:text-accent transition-colors group/link flex-shrink-0"
                    >
                      <span className="hidden sm:inline">קראו המאמר</span>
                      <span className="sm:hidden">קרא</span>
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/link:translate-x-[-2px] transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-10 sm:mt-12"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-secondary transition-colors text-xs sm:text-sm"
          >
            לכל המאמרים במגזין
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}