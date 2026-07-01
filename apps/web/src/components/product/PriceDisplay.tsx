import type { Product } from '@virtualshop/shared';
import { formatPrice } from '../../lib/whatsapp';

/** Precio tachado + final + etiqueta de % con token de acento (spec §10). */
export function PriceDisplay({ product }: { product: Product }) {
  const hasDiscount = product.discountType != null && product.finalPrice < product.price;

  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl font-bold text-text">{formatPrice(product.finalPrice)}</span>
      {hasDiscount && (
        <>
          <span className="text-base text-text-muted line-through">
            {formatPrice(product.price)}
          </span>
          <span className="rounded-full bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">
            -{product.discountValue}%
          </span>
        </>
      )}
    </div>
  );
}
