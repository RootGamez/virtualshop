import type { ProductVariant } from '@jaw/shared';
import { Badge } from '../ui/badge';

interface VariantListProps {
  variants: ProductVariant[];
}

export function VariantList({ variants }: VariantListProps) {
  if (variants.length === 0) return null;
  return (
    <div>
      <h2 className="font-display text-sm font-bold text-text">Tallas y colores disponibles</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {variants.map((variant) => {
          const outOfStock = variant.stock <= 0;
          return (
            <li key={variant.id} className={`flex items-center gap-2 rounded-full border-2 border-border px-3 py-1.5 text-sm ${outOfStock ? 'opacity-50' : ''}`}>
              <span className="font-semibold text-text">{variant.size} · {variant.color}</span>
              <Badge variant={outOfStock ? 'muted' : 'success'}>{outOfStock ? 'Agotado' : `${variant.stock} disp.`}</Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
