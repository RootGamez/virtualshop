import type { EventType } from '@virtualshop/shared';
import { api } from './api';

/**
 * Fire-and-forget: nunca debe bloquear ni romper la UI si falla.
 * (spec §9: view al entrar al detalle, order_click al tocar "Pedir")
 */
export function registerEvent(productId: number, type: EventType): void {
  api.post('/events', { productId, type }).catch(() => {
    // Tracking best-effort: un fallo acá no debe afectar la experiencia de compra.
  });
}
