import { useState } from 'react';
import type { ProductMedia } from '@jaw/shared';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '../ui/dialog';

function mediaUrl(r2Key: string): string {
  const base = (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined) ?? '';
  return `${base}/${r2Key}`;
}

interface MediaGalleryProps {
  media: ProductMedia[];
  productName: string;
}

export function MediaGallery({ media, productName }: MediaGalleryProps) {
  const [zoomed, setZoomed] = useState<ProductMedia | null>(null);
  if (media.length === 0) {
    return <div className="aspect-square w-full rounded-xl2 bg-muted" aria-label="Sin imágenes" />;
  }
  return (
    <Dialog open={zoomed !== null} onOpenChange={(open) => !open && setZoomed(null)}>
      <Carousel opts={{ loop: false }} className="relative">
        <CarouselContent>
          {media.map((item, i) => (
            <CarouselItem key={item.id} className="w-full">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl2 bg-muted">
                {item.type === 'video' ? (
                  <video src={mediaUrl(item.r2Key)} controls className="h-full w-full object-cover" aria-label={`Video ${i + 1} de ${productName}`} />
                ) : (
                  <DialogTrigger asChild>
                    <button type="button" onClick={() => setZoomed(item)} className="h-full w-full cursor-zoom-in" aria-label={`Ampliar imagen ${i + 1} de ${productName}`}>
                      <img src={mediaUrl(item.r2Key)} alt={`${productName} — imagen ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                    </button>
                  </DialogTrigger>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {media.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2" />
          </>
        )}
      </Carousel>
      <DialogContent className="max-w-4xl">
        <DialogTitle className="sr-only">{productName}</DialogTitle>
        {zoomed && <img src={mediaUrl(zoomed.r2Key)} alt={productName} className="max-h-[80vh] w-full rounded-xl object-contain" />}
      </DialogContent>
    </Dialog>
  );
}
