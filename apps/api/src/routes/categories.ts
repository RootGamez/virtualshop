import { Hono } from 'hono';
import {
  ALLOWED_MEDIA_MIME,
  CATEGORY_MEDIA_KEY_PREFIX,
  MEDIA_MAX_UPLOAD_BYTES,
  MEDIA_MAX_UPLOAD_MB,
  createCategorySchema,
  updateCategorySchema,
  type CategorySection,
  type Product,
} from '@jaw/shared';
import type { AppEnv } from '../env';
import type { CategoryRow, ProductRow } from '../db/rows';
import { mapCategory, mapProduct } from '../db/rows';
import { requireAuth, requireRole } from '../middleware/auth';
import { badRequest, conflict, notFound } from '../lib/http-error';
import { parseBody } from '../lib/validate';

/** Convención de claves R2 para banners: categories/{category_id}/{uuid}.{ext}. */
function buildBannerKey(categoryId: number, ext: string): string {
  return `${CATEGORY_MEDIA_KEY_PREFIX}${categoryId}/${crypto.randomUUID()}.${ext}`;
}

export const categoryRoutes = new Hono<AppEnv>();

categoryRoutes.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM categories ORDER BY display_order ASC, name ASC',
  ).all<CategoryRow>();
  return c.json(results.map(mapCategory));
});

const SECTION_PRODUCTS_DEFAULT = 4;
const SECTION_PRODUCTS_MAX = 12;

/**
 * Catálogo por secciones (público): cada categoría con una muestra de sus
 * productos activos más recientes. Se resuelve en un número constante de
 * queries (categorías + top-N por window function + portadas), sin N+1.
 */
categoryRoutes.get('/sections', async (c) => {
  const limit = Math.min(
    SECTION_PRODUCTS_MAX,
    Math.max(1, Number(c.req.query('limit') ?? SECTION_PRODUCTS_DEFAULT)),
  );

  const [{ results: categories }, { results: products }] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM categories ORDER BY display_order ASC, name ASC').all<CategoryRow>(),
    c.env.DB.prepare(
      `SELECT * FROM (
         SELECT p.*, ROW_NUMBER() OVER (
           PARTITION BY p.category_id ORDER BY p.created_at DESC, p.id DESC
         ) AS rn
         FROM products p
         WHERE p.is_active = 1
       ) WHERE rn <= ?`,
    )
      .bind(limit)
      .all<ProductRow & { rn: number }>(),
  ]);

  // Imagen de portada por producto: la primera media (menor display_order),
  // mismo criterio que el listado de productos.
  const coverByProduct = new Map<number, string>();
  const ids = products.map((r) => r.id);
  if (ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');
    const { results: covers } = await c.env.DB.prepare(
      `SELECT pm.product_id, pm.r2_key
         FROM product_media pm
        WHERE pm.product_id IN (${placeholders})
          AND pm.display_order = (
            SELECT MIN(display_order) FROM product_media
             WHERE product_id = pm.product_id
          )`,
    )
      .bind(...ids)
      .all<{ product_id: number; r2_key: string }>();
    for (const row of covers) coverByProduct.set(row.product_id, row.r2_key);
  }

  const productsByCategory = new Map<number, Product[]>();
  for (const row of products) {
    const list = productsByCategory.get(row.category_id) ?? [];
    productsByCategory.set(row.category_id, [
      ...list,
      { ...mapProduct(row), coverImageKey: coverByProduct.get(row.id) ?? null },
    ]);
  }

  const sections: CategorySection[] = categories
    .filter((category) => productsByCategory.has(category.id))
    .map((category) => ({
      category: mapCategory(category),
      products: productsByCategory.get(category.id)!,
    }));
  return c.json(sections);
});

categoryRoutes.post('/', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const body = await parseBody(c, createCategorySchema);

  const existing = await c.env.DB.prepare('SELECT id FROM categories WHERE slug = ?')
    .bind(body.slug)
    .first();
  if (existing) throw conflict('Ya existe una categoría con ese slug');

  const result = await c.env.DB.prepare(
    'INSERT INTO categories (name, slug, display_order) VALUES (?, ?, ?) RETURNING *',
  )
    .bind(body.name, body.slug, body.displayOrder ?? 0)
    .first<CategoryRow>();
  return c.json(mapCategory(result!), 201);
});

categoryRoutes.patch('/:id', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const id = Number(c.req.param('id'));
  const body = await parseBody(c, updateCategorySchema);

  const current = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
    .bind(id)
    .first<CategoryRow>();
  if (!current) throw notFound('Categoría no encontrada');

  const updated = await c.env.DB.prepare(
    'UPDATE categories SET name = ?, slug = ?, display_order = ? WHERE id = ? RETURNING *',
  )
    .bind(
      body.name ?? current.name,
      body.slug ?? current.slug,
      body.displayOrder ?? current.display_order,
      id,
    )
    .first<CategoryRow>();
  return c.json(mapCategory(updated!));
});

categoryRoutes.delete('/:id', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const id = Number(c.req.param('id'));
  const current = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
    .bind(id)
    .first<CategoryRow>();
  if (!current) throw notFound('Categoría no encontrada');

  // D1 primero, R2 después (mismo criterio que media.ts): si el borrado del
  // objeto falla, queda un huérfano facturable pero inofensivo.
  await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  if (current.banner_image_key) await c.env.MEDIA.delete(current.banner_image_key);
  return c.body(null, 204);
});

/**
 * Sube (o reemplaza) el banner de una categoría. Multipart con campo "file";
 * solo imágenes (los banners no admiten video). Espejo del flujo de subida de
 * media de productos (routes/media.ts).
 */
categoryRoutes.post('/:id/banner', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const id = Number(c.req.param('id'));
  const current = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
    .bind(id)
    .first<CategoryRow>();
  if (!current) throw notFound('Categoría no encontrada');

  const formData = await c.req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) throw badRequest('Se requiere un archivo en el campo "file"');

  const rule = ALLOWED_MEDIA_MIME[file.type];
  if (!rule || rule.type !== 'image') {
    throw badRequest('Tipo de archivo no permitido (usar JPG, PNG, WebP o GIF)');
  }
  if (file.size > MEDIA_MAX_UPLOAD_BYTES) {
    throw badRequest(`El archivo supera el máximo de ${MEDIA_MAX_UPLOAD_MB} MB`);
  }

  const key = buildBannerKey(id, rule.ext);
  await c.env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const updated = await c.env.DB.prepare(
    'UPDATE categories SET banner_image_key = ? WHERE id = ? RETURNING *',
  )
    .bind(key, id)
    .first<CategoryRow>();

  // El banner anterior se borra al final: si falla, D1 ya apunta al nuevo.
  if (current.banner_image_key) await c.env.MEDIA.delete(current.banner_image_key);
  return c.json(mapCategory(updated!));
});

/** Quita el banner de una categoría (columna a NULL + borrado del objeto R2). */
categoryRoutes.delete('/:id/banner', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const id = Number(c.req.param('id'));
  const current = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
    .bind(id)
    .first<CategoryRow>();
  if (!current) throw notFound('Categoría no encontrada');

  const updated = await c.env.DB.prepare(
    'UPDATE categories SET banner_image_key = NULL WHERE id = ? RETURNING *',
  )
    .bind(id)
    .first<CategoryRow>();
  if (current.banner_image_key) await c.env.MEDIA.delete(current.banner_image_key);
  return c.json(mapCategory(updated!));
});
