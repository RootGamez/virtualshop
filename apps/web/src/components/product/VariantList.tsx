import type { ProductVariant } from '@virtualshop/shared';

interface VariantListProps {
  variants: ProductVariant[];
}

/**
 * Solo informativo (spec §9): el cliente puede consultar talla/color/stock,
 * pero no está obligado a elegir nada para pedir por WhatsApp.
 */
export function VariantList({ variants }: VariantListProps) {
  if (variants.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-text">Tallas y colores disponibles</h2>
      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {variants.map((variant) => {
          const outOfStock = variant.stock <= 0;
          return (
            <li
              key={variant.id}
              className={`flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm ${
                outOfStock ? 'opacity-50' : ''
              }`}
            >
              <span className="text-text">
                {variant.size} · {variant.color}
              </span>
              <span className={outOfStock ? 'text-primary' : 'text-success'}>
                {outOfStock ? 'Agotado' : `${variant.stock} disp.`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
