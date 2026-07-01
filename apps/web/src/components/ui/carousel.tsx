import * as React from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

type CarouselApi = UseEmblaCarouselType[1];
type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

interface CarouselContextProps {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

export function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('useCarousel debe usarse dentro de <Carousel>');
  return context;
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: CarouselOptions;
  setApi?: (api: CarouselApi) => void;
}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ opts, setApi, className, children, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel({ align: 'start', ...opts });
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((emblaApi: CarouselApi) => {
      if (!emblaApi) return;
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
    const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

    React.useEffect(() => {
      if (!api) return;
      setApi?.(api);
      onSelect(api);
      api.on('reInit', onSelect);
      api.on('select', onSelect);
      return () => {
        api.off('reInit', onSelect);
        api.off('select', onSelect);
      };
    }, [api, onSelect, setApi]);

    return (
      <CarouselContext.Provider
        value={{ carouselRef, api, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
      >
        <div ref={ref} className={cn('relative', className)} role="region" aria-roledescription="carousel" {...props}>
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = 'Carousel';

export function CarouselContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { carouselRef } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div className={cn('flex gap-4', className)} {...props} />
    </div>
  );
}

export function CarouselItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="group" aria-roledescription="slide" className={cn('min-w-0 shrink-0 grow-0', className)} {...props} />;
}

export function CarouselPrevious({ className }: { className?: string }) {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <Button variant="outline" size="icon" className={cn('bg-surface', className)} disabled={!canScrollPrev} onClick={scrollPrev} aria-label="Anterior">
      <ArrowLeft />
    </Button>
  );
}

export function CarouselNext({ className }: { className?: string }) {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <Button variant="outline" size="icon" className={cn('bg-surface', className)} disabled={!canScrollNext} onClick={scrollNext} aria-label="Siguiente">
      <ArrowRight />
    </Button>
  );
}
