import { buildWhatsappLink, type Product, type WhatsappConfig } from '@jaw/shared';
import { registerEvent } from './events';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}

/**
 * Arma el link de pedido y registra el order_click (spec §9).
 * El precio en el mensaje es siempre el final (con descuento aplicado si hay).
 */
export function openWhatsappOrder(product: Product, config: WhatsappConfig): void {
  registerEvent(product.id, 'order_click');

  const productUrl = `${window.location.origin}/producto/${product.slug}`;
  const link = buildWhatsappLink({
    phoneNumber: config.phoneNumber,
    messageTemplate: config.messageTemplate,
    productName: product.name,
    price: formatPrice(product.finalPrice),
    productUrl,
  });

  window.open(link, '_blank', 'noopener,noreferrer');
}

export { formatPrice };
