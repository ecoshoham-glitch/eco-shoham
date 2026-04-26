import React from 'react';
import { motion } from 'framer-motion';

export default function BlogFilters({ categories, active, onChange }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-wrap gap-2 justify-center"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
              active === cat
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                : 'bg-white text-foreground/70 border-border hover:border-primary/40 hover:text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>
    </div>
  );
}