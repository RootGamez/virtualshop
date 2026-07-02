import type { Product } from '@jaw/shared';
import { ProductCard } from './ProductCard';
import { SectionHeading } from '../ui/SectionHeading';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';

interface FeaturedCarouselProps {
  products: Product[] | undefined;
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  if (!products || products.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {/* Los controles usan el contexto de <Carousel>, por eso van dentro de él. */}
      <Carousel opts={{ align: 'start', dragFree: true }}>
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow="Recién llegado" title="Últimos drops" align="left" />
          <div className="hidden gap-2 sm:flex">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </div>
        <CarouselContent className="mt-8">
          {products.map((product) => (
            <CarouselItem key={product.id} className="w-[45%] sm:w-[30%] lg:w-[23%]">
              <ProductCard product={product} coverImageKey={product.coverImageKey ?? undefined} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
