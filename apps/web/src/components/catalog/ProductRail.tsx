import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import type { Product } from '@jaw/shared';
import { ProductCard } from './ProductCard';
import { SectionHeading } from '../ui/SectionHeading';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Skeleton } from '../ui/Skeleton';

interface ProductRailProps {
  eyebrow: string;
  title: string;
  /** undefined = cargando (skeletons); [] = el rail no se renderiza. */
  products: Product[] | undefined;
  /** Badge de merchandising por producto (NUEVO, urgencia…). */
  renderBadge?: (product: Product) => ReactNode;
  className?: string;
}

/**
 * Rail horizontal de productos reutilizable (Embla + reveal con Motion).
 * Base de los carruseles de merchandising del catálogo y del destacado de la
 * landing. Mobile-first: en móvil se navega por arrastre/scroll horizontal.
 */
export function ProductRail({ eyebrow, title, products, renderBadge, className = '' }: ProductRailProps) {
  const isLoading = !products;
  if (products && products.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {/* Los controles usan el contexto de <Carousel>, por eso van dentro de él. */}
      <Carousel opts={{ align: 'start', dragFree: true }}>
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow={eyebrow} title={title} align="left" />
          <div className="hidden gap-2 sm:flex">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </div>
        <CarouselContent className="mt-8">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <CarouselItem key={`rail-skeleton-${i}`} className="w-[45%] sm:w-[30%] lg:w-[23%]">
                  <div className="flex flex-col gap-2 rounded-lg border border-forest/15 p-3">
                    <Skeleton className="aspect-square w-full rounded-md" />
                    <Skeleton className="mt-2 h-4 w-3/4" />
                    <Skeleton className="mt-1 h-4 w-1/3" />
                  </div>
                </CarouselItem>
              ))
            : products.map((product) => (
                <CarouselItem key={product.id} className="w-[45%] sm:w-[30%] lg:w-[23%]">
                  <ProductCard
                    product={product}
                    coverImageKey={product.coverImageKey ?? undefined}
                    badge={renderBadge?.(product)}
                  />
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
    </motion.section>
  );
}
