/** URL pública de un objeto de media servido por la API (clave R2). */
export function mediaUrl(r2Key: string): string {
  const base = (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined) ?? '';
  return `${base}/${r2Key}`;
}
