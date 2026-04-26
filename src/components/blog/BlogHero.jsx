import React from 'react';
import { motion } from 'framer-motion';
import { Search, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function BlogHero({ search, onSearch }) {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <Home className="w-4 h-4" />
                דף הבית
              </Button>
            </Link>
          </div>
          <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            📚 מגזין ECOShoham
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary mb-4">
            מדע, חינוך ו
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-accent">
              מה שביניהם
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            מחקרים עדכניים, תובנות פדגוגיות וכלים מעשיים למורי מדעים ורכזי STEM
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="חפשו מאמר..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="pr-12 py-6 text-base rounded-2xl border-border/60 shadow-md focus:shadow-lg transition-shadow"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}