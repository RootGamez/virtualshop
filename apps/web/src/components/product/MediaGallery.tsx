import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { ProductMedia } from '@virtualshop/shared';

function mediaUrl(r2Key: string): string {
  const base = (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined) ?? '';
  return `${base}/${r2Key}`;
}

interface MediaGalleryProps {
  media: ProductMedia[];
  productName: string;
}

export function MediaGallery({ media, productName }: MediaGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  if (media.length === 0) {
    return (
      <div className="aspect-square w-full rounded-xl bg-border" aria-label="Sin imágenes" />
    );
  }

  return (
    <div>
      <div ref={emblaRef} className="overflow-hidden rounded-xl">
        <div className="flex">
          {media.map((item, i) => (
            <div key={item.id} className="relative aspect-square w-full shrink-0 bg-border">
              {item.type === 'video' ? (
                <video
                  src={mediaUrl(item.r2Key)}
                  controls
                  className="h-full w-full object-cover"
                  aria-label={`Video ${i + 1} de ${productName}`}
                />
              ) : (
                <img
                  src={mediaUrl(item.r2Key)}
                  alt={`${productName} — imagen ${i + 1}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {media.length > 1 && (
        <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Miniaturas">
          {media.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === selectedIndex}
              aria-label={`Ver media ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === selectedIndex ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
