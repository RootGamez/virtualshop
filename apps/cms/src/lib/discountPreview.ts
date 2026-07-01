import { fromFinalPrice, fromPercent, noDiscount, type DiscountResult } from '@jaw/shared';

export type DiscountEntryMode = 'none' | 'percent' | 'finalPrice';

/**
 * Doble entrada de descuento (spec §10): el admin elige el modo y el CMS
 * previsualiza en vivo con los mismos helpers que usa la API al persistir.
 */
export function previewDiscount(
  price: number,
  mode: DiscountEntryMode,
  value: number | undefined,
): DiscountResult {
  if (mode === 'percent' && value != null && !Number.isNaN(value)) {
    return fromPercent(price, value);
  }
  if (mode === 'finalPrice' && value != null && !Number.isNaN(value)) {
    return fromFinalPrice(price, value);
  }
  return noDiscount(price);
}
