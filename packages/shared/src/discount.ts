/**
 * Cálculo bidireccional de descuento (spec §10).
 * El admin puede fijar el % o el precio final; el sistema calcula lo otro.
 * Usado por la API al persistir y por el CMS al previsualizar.
 */
import type { DiscountType } from './types';

export interface DiscountResult {
  discountType: DiscountType;
  discountValue: number | null;
  finalPrice: number;
}

/** A partir de un porcentaje, calcula el precio final. Redondea a 2 decimales. */
export function fromPercent(price: number, percent: number): DiscountResult {
  const finalPrice = round2(price * (1 - percent / 100));
  return { discountType: 'percent', discountValue: percent, finalPrice };
}

/** A partir de un precio final fijo, calcula el % equivalente. */
export function fromFinalPrice(price: number, finalPrice: number): DiscountResult {
  const percent = price > 0 ? round2(((price - finalPrice) / price) * 100) : 0;
  return { discountType: 'percent', discountValue: percent, finalPrice: round2(finalPrice) };
}

/** Sin descuento: precio final = precio original. */
export function noDiscount(price: number): DiscountResult {
  return { discountType: null, discountValue: null, finalPrice: round2(price) };
}

/**
 * Monto fijo de descuento (ej. -$20). No es uno de los dos modos de entrada
 * descritos en §10 (que siempre persisten como 'percent'), pero el modelo de
 * datos reserva 'fixed' para este caso de uso futuro.
 */
export function fromFixedAmount(price: number, amountOff: number): DiscountResult {
  const finalPrice = round2(Math.max(0, price - amountOff));
  return { discountType: 'fixed', discountValue: round2(amountOff), finalPrice };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
