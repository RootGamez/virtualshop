import { Eye } from 'lucide-react';
import { formatPrice, mediaUrl } from '../../lib/format';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface PreviewVariant {
  size: string;
  color: string;
  stock: number;
}

interface StoreProductPreviewProps {
  name: string;
  description?: string;
  price: number;
  /** Precio final ya con descuento aplicado. */
  finalPrice: number;
  /** Porcentaje mostrado en el badge de oferta (si aplica). */
  discountValue?: number | null;
  categoryName?: string;
  coverImageKey?: string | null;
  isActive?: boolean;
  variants?: PreviewVariant[];
  className?: string;
}

/**
 * Vista previa de cómo se verá el producto en la tienda, alimentada por el
 * estado del formulario en vivo. Reutiliza la misma estética que el catálogo
 * y la ficha pública (Card + Badge + formatPrice) para que sea fiel al real.
 */
export function StoreProductPreview({
  name,
  description,
  price,
  finalPrice,
  discountValue,
  categoryName,
  coverImageKey,
  isActive = true,
  variants,
  className,
}: StoreProductPreviewProps) {
  const hasDiscount = finalPrice < price;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wide text-text-muted">
        <Eye className="size-4" />
        Vista previa en la tienda
      </div>

      <Card className="border-forest/15">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {coverImageKey ? (
            <img src={mediaUrl(coverImageKey)} alt={name || 'Producto'} className="h-full w-full object-cover" />
          ) : (
            <div className="texture-halftone flex h-full w-full items-center justify-center text-text-muted">
              <span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold">Sin imagen</span>
            </div>
          )}
          {hasDiscount && discountValue != null && (
            <Badge variant="accent" className="absolute left-2 top-2 -rotate-3">
              -{discountValue}%
            </Badge>
          )}
          {!isActive && (
            <span className="absolute inset-0 flex items-center justify-center bg-forest/80 font-display text-sm font-bold uppercase tracking-widest text-bone">
              Agotado
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 p-4">
          {categoryName && (
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{categoryName}</p>
          )}
          <h3 className="line-clamp-2 font-display text-base font-bold text-text">
            {name || 'Nombre del producto'}
          </h3>

          <div className="flex items-baseline gap-2">
            {hasDiscount && (
              <span className="text-sm text-text-muted line-through">{formatPrice(price)}</span>
            )}
            <span className="font-display text-2xl font-bold text-forest">{formatPrice(finalPrice)}</span>
          </div>

          {description && <p className="line-clamp-3 text-sm text-text-muted">{description}</p>}

          {variants && variants.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {variants.map((variant, i) => {
                const outOfStock = variant.stock <= 0;
                return (
                  <li
                    key={`${variant.size}-${variant.color}-${i}`}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border-2 border-border px-2.5 py-1 text-xs',
                      outOfStock && 'opacity-50'
                    )}
                  >
                    <span className="font-semibold text-text">
                      {variant.size} · {variant.color}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
