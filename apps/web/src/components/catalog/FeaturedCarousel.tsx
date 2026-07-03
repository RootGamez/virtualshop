import type { Product } from '@jaw/shared';
import { ProductRail } from './ProductRail';

interface FeaturedCarouselProps {
  products: Product[] | undefined;
}

/** Carrusel destacado de la landing — wrapper del rail reutilizable. */
export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  return (
    <ProductRail
      eyebrow="Recién llegado"
      title="Últimos drops"
      products={products}
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    />
  );
}
