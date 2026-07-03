import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { Category } from '@jaw/shared';
import { mediaUrl } from '../../lib/media';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { PaintSplat } from '../ui/PaintDecor';

interface CategoryBannerProps {
  category: Category;
  /** Posición de la sección; rota el estilo del fallback sin imagen. */
  index?: number;
}

/* Estilos alternados para categorías sin banner — mismos de CategoriesSection */
const FALLBACK_STYLES = [
  'bg-forest text-lime',
  'bg-secondary text-forest',
  'bg-accent text-forest',
  'bg-forest-deep text-sky',
] as const;

/**
 * Banner de sección del catálogo: imagen con parallax sutil al scroll y
 * título con reveal. Con `prefers-reduced-motion` todo queda estático.
 * Aspect ratio fijo para no provocar saltos de layout (CLS).
 */
export function CategoryBanner({ category, index = 0 }: CategoryBannerProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Progreso del banner a través del viewport (0 = entra, 1 = sale).
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const hasImage = Boolean(category.bannerImageKey);

  return (
    <div
      ref={ref}
      className={`texture-grain relative aspect-[5/2] w-full overflow-hidden rounded-xl2 border-2 border-forest sm:aspect-[3/1] ${
        hasImage ? 'bg-forest' : `texture-halftone ${FALLBACK_STYLES[index % FALLBACK_STYLES.length]}`
      }`}
    >
      {hasImage && (
        <>
          <motion.img
            src={mediaUrl(category.bannerImageKey!)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            style={reduced ? undefined : { y: imageY }}
            className="absolute inset-0 h-full w-full scale-110 object-cover"
          />
          {/* Velo para asegurar contraste del título sobre cualquier foto */}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/25 to-transparent" />
        </>
      )}
      {!hasImage && (
        <PaintSplat aria-hidden="true" className="absolute -right-10 -top-12 w-44 rotate-12 opacity-25" />
      )}

      <div className="relative z-[2] flex h-full items-end p-5 sm:p-7">
        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`font-display text-3xl font-bold uppercase leading-none sm:text-5xl ${
            hasImage ? 'text-bone' : ''
          }`}
        >
          {category.name}
        </motion.h2>
      </div>
    </div>
  );
}
