import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BRAND } from '@virtualshop/shared';

interface HeroContent {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
}

export function Hero({ content }: { content?: HeroContent }) {
  const title = content?.title || BRAND.name;
  const subtitle = content?.subtitle || BRAND.tagline;
  const ctaLabel = content?.ctaLabel || 'Ver catálogo';

  return (
    <section className="relative overflow-hidden bg-surface-dark px-4 py-24 text-center sm:px-6 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto max-w-2xl"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-text-inverse sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 text-lg text-text-inverse/80">{subtitle}</p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mt-8"
        >
          <Link
            to="/catalogo"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            {ctaLabel}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
