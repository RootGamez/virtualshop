/**
 * Portadas de producto: la primera media (menor display_order) de cada uno.
 * Compartido por el listado de productos, las secciones del catálogo y los
 * rails de merchandising (evita duplicar la subquery).
 */
export async function coverKeysByProduct(
  db: D1Database,
  productIds: number[],
): Promise<Map<number, string>> {
  const covers = new Map<number, string>();
  if (productIds.length === 0) return covers;

  const placeholders = productIds.map(() => '?').join(',');
  const { results } = await db
    .prepare(
      `SELECT pm.product_id, pm.r2_key
         FROM product_media pm
        WHERE pm.product_id IN (${placeholders})
          AND pm.display_order = (
            SELECT MIN(display_order) FROM product_media
             WHERE product_id = pm.product_id
          )`,
    )
    .bind(...productIds)
    .all<{ product_id: number; r2_key: string }>();
  for (const row of results) covers.set(row.product_id, row.r2_key);
  return covers;
}
