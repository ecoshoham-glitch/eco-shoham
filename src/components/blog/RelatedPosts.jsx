import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function RelatedPosts({ currentPost, allPosts }) {
  const related = allPosts
    .filter((p) => p.id !== currentPost.id && p.category === currentPost.category)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" dir="rtl">
      <h3 className="text-xl font-black text-primary mb-6">מאמרים קשורים</h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {related.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Link
              to={`/blog/${post.id}`}
              className="group block h-full bg-white rounded-2xl border border-border/50 hover:border-secondary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-l from-secondary via-accent to-primary" />
              <div className="p-4 flex flex-col gap-3 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{post.emoji}</span>
                  <Badge className={`${post.categoryColor} text-xs font-semibold`}>{post.category}</Badge>
                </div>
                <p className="text-sm font-bold text-primary leading-snug group-hover:text-secondary transition-colors">
                  {post.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                  <span className="text-xs font-bold text-secondary group-hover:text-accent transition-colors">
                    קראו עוד ←
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}