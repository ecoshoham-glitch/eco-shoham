import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, Clock } from 'lucide-react';

function PostCard({ post, index, featured }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`group ${featured ? 'sm:col-span-2' : ''}`}
    >
      <div className={`h-full bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-secondary/30 hover:-translate-y-1 flex flex-col`}>
        {/* Image */}
        {post.image && (
          <div className="h-44 overflow-hidden flex-shrink-0">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}

        <div className="p-6 flex flex-col flex-1">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">{post.emoji}</span>
            <Badge className={`${post.categoryColor} font-semibold text-xs px-3`}>
              {post.category}
            </Badge>
          </div>

          {/* Title */}
          <h3 className={`font-bold text-primary leading-snug mb-3 group-hover:text-secondary transition-colors ${featured ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/40 pt-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
              {post.sourceUrl ? (
                <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-secondary transition-colors" onClick={(e) => e.stopPropagation()}>
                  <BookOpen className="w-3.5 h-3.5" />
                  {post.source}
                </a>
              ) : (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {post.source}
                </span>
              )}
            </div>
            <Link
                      to={`/blog/${post.id}`}
                      className="flex items-center gap-1.5 text-sm font-bold text-secondary hover:text-accent transition-colors"
                    >
                      קראו עוד
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BlogGrid({ posts }) {
  if (posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-center" dir="rtl">
        <div className="py-20">
          <span className="text-6xl">🔍</span>
          <p className="mt-4 text-xl font-bold text-primary">לא נמצאו מאמרים</p>
          <p className="text-muted-foreground mt-2">נסו לחפש מילה אחרת או לשנות את הקטגוריה</p>
        </div>
      </div>
    );
  }

  const featured = posts.filter((p) => p.featured);
  const regular = posts.filter((p) => !p.featured);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" dir="rtl">
      <AnimatePresence mode="popLayout">
        {/* Featured posts */}
        {featured.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            {featured.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} featured={false} />
            ))}
          </div>
        )}

        {/* Regular posts */}
        {regular.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regular.map((post, i) => (
              <PostCard key={post.id} post={post} index={i + featured.length} featured={false} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}