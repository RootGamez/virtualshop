/**
 * Punto único de configuración de marca.
 */
export const BRAND = {
  name: 'JAW Project',
  shortName: 'JAW',
  tagline: 'Ropa importada para que brilles ✨',
  domain: 'jawproject.example.com',
} as const;

export type Brand = typeof BRAND;
