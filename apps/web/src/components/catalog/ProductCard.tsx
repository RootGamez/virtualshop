import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { Product } from '@jaw/shared';
import { formatPrice } from '../../lib/whatsapp';
import { mediaUrl } from '../../lib/media';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface ProductCardProps {
  product: Product;
  coverImageKey?: string;
}

const MotionCard = motion.create(Card);

export function ProductCard({ product, coverImageKey }: ProductCardProps) {
  const hasDiscount = product.discountType != null && product.finalPrice < product.price;
  return (
    <MotionCard
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -6, rotate: -0.5 }}
      className="group border-forest/15 hover:border-forest hover:shadow-sticker-lime"
    >
      <Link to={`/producto/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {coverImageKey ? (
            <img
              src={mediaUrl(coverImageKey)}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="texture-halftone flex h-full w-full items-center justify-center text-text-muted">
              <span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold">Sin imagen</span>
            </div>
          )}
          {hasDiscount && (
            <Badge variant="accent" className="absolute left-2 top-2 -rotate-3">-{product.discountValue}%</Badge>
          )}
          {!product.isActive && (
            <span className="absolute inset-0 flex items-center justify-center bg-forest/80 font-display text-sm font-bold uppercase tracking-widest text-bone">
              Agotado
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-text">{product.name}</h3>
          <div className="mt-auto flex items-baseline gap-2">
            {hasDiscount && <span className="text-xs text-text-muted line-through">{formatPrice(product.price)}</span>}
            <span className="font-display text-lg font-bold text-forest">{formatPrice(product.finalPrice)}</span>
          </div>
        </div>
      </Link>
    </MotionCard>
  );
}
