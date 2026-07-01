import type { Product } from '@jaw/shared';
import { formatPrice } from '../../lib/whatsapp';
import { Badge } from '../ui/badge';

export function PriceDisplay({ product }: { product: Product }) {
  const hasDiscount = product.discountType != null && product.finalPrice < product.price;
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-3xl font-bold text-text">{formatPrice(product.finalPrice)}</span>
      {hasDiscount && (
        <>
          <span className="text-base text-text-muted line-through">{formatPrice(product.price)}</span>
          <Badge variant="accent">-{product.discountValue}%</Badge>
        </>
      )}
    </div>
  );
}
