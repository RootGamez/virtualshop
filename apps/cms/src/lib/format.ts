/**
 * Utilidades de formato compartidas por el CMS.
 * `formatPrice` replica el formato de la tienda (apps/web/lib/whatsapp.ts) para
 * que la vista previa del producto se vea idéntica al catálogo real.
 */

/** Precio en la misma moneda/locale que la tienda pública. */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}

/** Fecha/hora de D1 (UTC "YYYY-MM-DD HH:MM:SS") en el formato local del navegador. */
export function formatDateTime(sqliteUtc: string): string {
  const date = new Date(`${sqliteUtc.replace(' ', 'T')}Z`);
  if (Number.isNaN(date.getTime())) return sqliteUtc;
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

/** Arma la URL pública de una media a partir de su clave R2. */
export function mediaUrl(r2Key: string): string {
  const base = (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined) ?? '';
  return `${base}/${r2Key}`;
}
