import useEmblaCarousel from 'embla-carousel-react';
import type { Product } from '@virtualshop/shared';
import { ProductCard } from './ProductCard';
import { SectionHeading } from '../ui/SectionHeading';

interface FeaturedCarouselProps {
  products: Product[] | undefined;
}

/** Carrusel de productos destacados en la landing (spec §3, Embla Carousel). */
export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const [emblaRef] = useEmblaCarousel({ align: 'start', dragFree: true, loop: false });

  if (!products || products.length === 0) return null;

  return (
    <section className="px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="Nuevo" title="Destacados" />
      <div ref={emblaRef} className="mt-8 overflow-hidden">
        <div className="flex gap-4">
          {products.map((product) => (
            <div key={product.id} className="w-[45%] shrink-0 sm:w-[30%] lg:w-[22%]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
