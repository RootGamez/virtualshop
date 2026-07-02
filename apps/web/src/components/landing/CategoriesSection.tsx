import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { Category } from '@jaw/shared';
import { SectionHeading } from '../ui/SectionHeading';
import { Skeleton } from '../ui/Skeleton';

interface CategoriesSectionProps {
  categories: Category[] | undefined;
}

/* Estilos alternados de tarjeta — nada de fondos planos repetidos */
const CARD_STYLES = [
  'bg-forest text-lime',
  'bg-secondary text-forest',
  'bg-accent text-forest',
  'bg-forest-deep text-sky',
] as const;

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const isLoading = !categories;
  
  if (categories && categories.length === 0) return null;
  
  const displayCategories = categories || Array.from({ length: 6 }, (_, i) => ({
    id: i,
    slug: '',
    name: '',
    displayOrder: i,
  }));
  
  const top = displayCategories.slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Explora" title="Compra por categoría" />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
        {top.map((category, i) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
            whileHover={isLoading ? undefined : { y: -6, rotate: i % 2 === 0 ? -1 : 1 }}
          >
            {isLoading ? (
              <Skeleton className="aspect-[4/3] w-full rounded-xl2 border-2 border-forest/10" />
            ) : (
              <Link
                to={`/catalogo?categoria=${category.slug}`}
                className={`${CARD_STYLES[i % CARD_STYLES.length]} texture-halftone group relative flex aspect-[4/3] items-end overflow-hidden rounded-xl2 border-2 border-forest p-5 transition-shadow hover:shadow-sticker`}
              >
                <ArrowUpRight
                  aria-hidden="true"
                  className="absolute right-4 top-4 size-6 opacity-60 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
                <span className="font-display text-xl font-bold uppercase leading-tight sm:text-2xl">
                  {category.name}
                </span>
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
