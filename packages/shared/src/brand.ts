/**
 * Punto único de configuración de marca.
 * "JAW Project" sigue siendo reemplazable desde aquí si cambia el nombre.
 */
export const BRAND = {
  name: 'JAW Project',
  shortName: 'JAW',
  tagline: 'Ropa importada con otro flow',
  description:
    'Tienda virtual de ropa importada ubicada en Caracas. Piezas originales seleccionadas en el exterior, envíos a toda Venezuela y pedidos directos por WhatsApp.',
  location: 'Caracas, Venezuela',
  shippingNote: 'Envíos nacionales por MRW y Zoom · Delivery en Caracas',
  schedule: 'Lun – Sáb · 9:00 am – 6:00 pm',
  domain: 'jawproject.example.com',
} as const;

export type Brand = typeof BRAND;
