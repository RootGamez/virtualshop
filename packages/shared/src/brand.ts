/**
 * Punto único de configuración de marca.
 *
 * "VirtualShop" es un nombre TEMPORAL (ver PLAN.md / especificación §1 y §13).
 * Ningún componente de apps/web o apps/cms debe escribir el nombre de la
 * marca de forma literal: siempre se importa desde acá. Cuando se decida el
 * nombre definitivo, este es el único archivo que hay que tocar.
 */
export const BRAND = {
  name: 'VirtualShop',
  shortName: 'VS',
  tagline: 'Tu tienda, a un mensaje de distancia',
  domain: 'virtualshop.example.com',
} as const;

export type Brand = typeof BRAND;
