import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { Category } from '@jaw/shared';
import { SectionHeading } from '../ui/SectionHeading';

interface CategoriesSectionProps {
  categories: Category[] | undefined;
}

const GRADIENTS = ['bg-gradient-cta', 'bg-gradient-fresh', 'bg-gradient-party', 'bg-gradient-hero'];

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (!categories || categories.length === 0) return null;
  const top = categories.slice(0, 6);
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="Explorá" title="Comprá por categoría" />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {top.map((category, i) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
            whileHover={{ y: -6, rotate: -1 }}
          >
            <Link
              to={`/catalogo?categoria=${category.slug}`}
              className={`${GRADIENTS[i % GRADIENTS.length]} relative flex aspect-[4/3] items-end overflow-hidden rounded-xl2 p-5 shadow-glow transition-shadow`}
            >
              <span className="absolute -right-4 -top-6 size-24 rounded-full bg-white/20 blur-xl" />
              <span className="font-display text-xl font-bold text-white drop-shadow">{category.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
