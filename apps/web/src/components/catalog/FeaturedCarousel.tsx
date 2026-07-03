import type { Product } from '@jaw/shared';
import { ProductCard } from './ProductCard';
import { SectionHeading } from '../ui/SectionHeading';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Skeleton } from '../ui/Skeleton';

interface FeaturedCarouselProps {
  products: Product[] | undefined;
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const isLoading = !products;

  if (products && products.length === 0) return null;

  const displayProducts: Product[] =
    products ??
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      categoryId: 0,
      name: '',
      description: '',
      slug: '',
      price: 0,
      discountType: null,
      discountValue: null,
      finalPrice: 0,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      coverImageKey: null,
    }));

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
          {displayProducts.map((product, i) => (
            <CarouselItem key={product.id || i} className="w-[45%] sm:w-[30%] lg:w-[23%]">
              {isLoading ? (
                <div className="flex flex-col gap-2 rounded-lg border border-forest/15 p-3">
                  <Skeleton className="aspect-square w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                  <Skeleton className="h-4 w-1/3 mt-1" />
                </div>
              ) : (
                <ProductCard product={product} coverImageKey={product.coverImageKey ?? undefined} />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
