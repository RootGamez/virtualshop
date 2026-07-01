/**
 * Construcción del link de WhatsApp a partir de la plantilla configurada (spec §9).
 * Plantilla confirmada:
 * "Hola 👋 Me interesa este producto: *[nombre]* — Precio: [precio]. [link]"
 */
export interface WhatsappLinkParams {
  phoneNumber: string;
  messageTemplate: string;
  productName: string;
  price: string;
  productUrl: string;
}

export function buildWhatsappLink(params: WhatsappLinkParams): string {
  const { phoneNumber, messageTemplate, productName, price, productUrl } = params;
  const message = messageTemplate
    .replace('[nombre]', productName)
    .replace('[precio]', price)
    .replace('[link]', productUrl);
  const digits = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
