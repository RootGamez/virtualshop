import { Hono } from 'hono';
import {
  createProductSchema,
  fromFixedAmount,
  fromPercent,
  noDiscount,
  updateProductSchema,
  type PaginatedResult,
  type ProductDetail,
} from '@jaw/shared';
import { slugify } from '../lib/slug';
import type { AppEnv } from '../env';
import type { CategoryRow, MediaRow, ProductRow, VariantRow } from '../db/rows';
import { mapMedia, mapProduct, mapVariant } from '../db/rows';
import { coverKeysByProduct } from '../db/covers';
import { authenticate, requireAuth, requireRole } from '../middleware/auth';
import { conflict, notFound } from '../lib/http-error';
import { parseBody } from '../lib/validate';

export const productRoutes = new Hono<AppEnv>();

const PAGE_SIZE_DEFAULT = 24;

productRoutes.get('/', async (c) => {
  const categoryId = c.req.query('categoryId');
  const search = c.req.query('search');
  const page = Math.max(1, Number(c.req.query('page') ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(c.req.query('pageSize') ?? PAGE_SIZE_DEFAULT)));

  const conditions = ['is_active = 1'];
  const params: unknown[] = [];
  if (categoryId) {
    conditions.push('category_id = ?');
    params.push(Number(categoryId));
  }
  if (search) {
    conditions.push('name LIKE ?');
    params.push(`%${search}%`);
  }
  const where = conditions.join(' AND ');

  const countRow = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM products WHERE ${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM products WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
  )
    .bind(...params, pageSize, (page - 1) * pageSize)
    .all<ProductRow>();

  // Imagen de portada por producto: la primera media (menor display_order) de cada uno.
  const coverByProduct = await coverKeysByProduct(c.env.DB, results.map((r) => r.id));

  const body: PaginatedResult<ReturnType<typeof mapProduct>> = {
    items: results.map((r) => ({ ...mapProduct(r), coverImageKey: coverByProduct.get(r.id) ?? null })),
    page,
    pageSize,
    total: countRow?.total ?? 0,
  };
  return c.json(body);
});

/* Rutas estáticas ANTES de /:slug — Hono matchea en orden de registro y
 * /:slug se tragaría "best-sellers"/"low-stock" como si fueran slugs. */

const RAIL_LIMIT_DEFAULT = 8;
const RAIL_LIMIT_MAX = 24;
const BEST_SELLER_DAYS_DEFAULT = 30;
const BEST_SELLER_DAYS_MAX = 365;
const LOW_STOCK_THRESHOLD_DEFAULT = 5;
const LOW_STOCK_THRESHOLD_MAX = 50;

function clampQuery(value: string | undefined, fallback: number, max: number): number {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(1, Math.trunc(n)));
}

/**
 * Best sellers (público): productos activos ordenados por clicks de pedido
 * (events.type='order_click') en los últimos `days` días. Mismo criterio que
 * el reporte admin de order-clicks, acotado con LIMIT.
 */
productRoutes.get('/best-sellers', async (c) => {
  const days = clampQuery(c.req.query('days'), BEST_SELLER_DAYS_DEFAULT, BEST_SELLER_DAYS_MAX);
  const limit = clampQuery(c.req.query('limit'), RAIL_LIMIT_DEFAULT, RAIL_LIMIT_MAX);

  const { results } = await c.env.DB.prepare(
    `SELECT p.*
       FROM products p
       JOIN events e ON e.product_id = p.id
      WHERE p.is_active = 1
        AND e.type = 'order_click'
        AND e.created_at >= datetime('now', ?)
      GROUP BY p.id
      ORDER BY COUNT(e.id) DESC
      LIMIT ?`,
  )
    .bind(`-${days} days`, limit)
    .all<ProductRow>();

  const covers = await coverKeysByProduct(c.env.DB, results.map((r) => r.id));
  return c.json(
    results.map((r) => ({ ...mapProduct(r), coverImageKey: covers.get(r.id) ?? null })),
  );
});

/**
 * Stock bajo (público): productos activos cuyo stock total está entre 1 y el
 * umbral (los agotados no generan urgencia, generan frustración). A propósito
 * NO se expone el número de stock: el front solo muestra el badge de urgencia.
 */
productRoutes.get('/low-stock', async (c) => {
  const threshold = clampQuery(
    c.req.query('threshold'),
    LOW_STOCK_THRESHOLD_DEFAULT,
    LOW_STOCK_THRESHOLD_MAX,
  );
  const limit = clampQuery(c.req.query('limit'), RAIL_LIMIT_DEFAULT, RAIL_LIMIT_MAX);

  const { results } = await c.env.DB.prepare(
    `SELECT p.*
       FROM products p
       JOIN product_variants v ON v.product_id = p.id
      WHERE p.is_active = 1
      GROUP BY p.id
     HAVING SUM(v.stock) BETWEEN 1 AND ?
      ORDER BY SUM(v.stock) ASC
      LIMIT ?`,
  )
    .bind(threshold, limit)
    .all<ProductRow>();

  const covers = await coverKeysByProduct(c.env.DB, results.map((r) => r.id));
  return c.json(
    results.map((r) => ({ ...mapProduct(r), coverImageKey: covers.get(r.id) ?? null })),
  );
});

productRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  // El CMS reusa esta misma ruta para cargar por id numerico (ediciones via /productos/:id);
  // el publico siempre entra por slug.
  const isNumericId = /^\d+$/.test(slug);

  let product: ProductRow | null;
  if (isNumericId) {
    // Acceso por id numérico = edición desde el CMS: exige auth y permite ver
    // productos inactivos (borradores). Sin token, 401.
    await authenticate(c);
    product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
      .bind(Number(slug))
      .first<ProductRow>();
  } else {
    // Acceso público por slug: solo productos activos, para no filtrar borradores.
    product = await c.env.DB.prepare('SELECT * FROM products WHERE slug = ? AND is_active = 1')
      .bind(slug)
      .first<ProductRow>();
  }
  if (!product) throw notFound('Producto no encontrado');

  const [{ results: variants }, { results: media }, category] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM product_variants WHERE product_id = ?')
      .bind(product.id)
      .all<VariantRow>(),
    c.env.DB.prepare('SELECT * FROM product_media WHERE product_id = ? ORDER BY display_order ASC')
      .bind(product.id)
      .all<MediaRow>(),
    c.env.DB.prepare('SELECT id, name, slug FROM categories WHERE id = ?')
      .bind(product.category_id)
      .first<Pick<CategoryRow, 'id' | 'name' | 'slug'>>(),
  ]);

  const detail: ProductDetail = {
    ...mapProduct(product),
    variants: variants.map(mapVariant),
    media: media.map(mapMedia),
    category: category ?? { id: product.category_id, name: '', slug: '' },
  };
  return c.json(detail);
});

productRoutes.post('/', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const body = await parseBody(c, createProductSchema);
  const slug = body.slug?.trim() || slugify(body.name);

  const existing = await c.env.DB.prepare('SELECT id FROM products WHERE slug = ?')
    .bind(slug)
    .first();
  if (existing) throw conflict('Ya existe un producto con ese slug');

  const discount = computeDiscount(body.price, body.discountType, body.discountValue);

  const result = await c.env.DB.prepare(
    `INSERT INTO products
      (category_id, name, description, slug, price, discount_type, discount_value, final_price, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING *`,
  )
    .bind(
      body.categoryId,
      body.name,
      body.description ?? '',
      slug,
      body.price,
      discount.discountType,
      discount.discountValue,
      discount.finalPrice,
      body.isActive ?? true ? 1 : 0,
    )
    .first<ProductRow>();
  return c.json(mapProduct(result!), 201);
});

productRoutes.patch('/:id', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const id = Number(c.req.param('id'));
  const body = await parseBody(c, updateProductSchema);

  const current = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
    .bind(id)
    .first<ProductRow>();
  if (!current) throw notFound('Producto no encontrado');

  const price = body.price ?? current.price;
  const discountType = body.discountType !== undefined ? body.discountType : current.discount_type;
  const discountValue =
    body.discountValue !== undefined ? body.discountValue : current.discount_value;
  const discount = computeDiscount(price, discountType, discountValue);

  const updated = await c.env.DB.prepare(
    `UPDATE products SET
      category_id = ?, name = ?, description = ?, slug = ?, price = ?,
      discount_type = ?, discount_value = ?, final_price = ?, is_active = ?, updated_at = datetime('now')
     WHERE id = ? RETURNING *`,
  )
    .bind(
      body.categoryId ?? current.category_id,
      body.name ?? current.name,
      body.description ?? current.description,
      body.slug ?? current.slug,
      price,
      discount.discountType,
      discount.discountValue,
      discount.finalPrice,
      body.isActive !== undefined ? (body.isActive ? 1 : 0) : current.is_active,
      id,
    )
    .first<ProductRow>();
  return c.json(mapProduct(updated!));
});

productRoutes.delete('/:id', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const id = Number(c.req.param('id'));

  // Recolectar las claves R2 ANTES de borrar el producto, para poder limpiar el
  // bucket (las filas de product_media caen por CASCADE, los objetos R2 no).
  const { results: media } = await c.env.DB.prepare(
    'SELECT r2_key FROM product_media WHERE product_id = ?',
  )
    .bind(id)
    .all<{ r2_key: string }>();

  const result = await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  if (result.meta.changes === 0) throw notFound('Producto no encontrado');

  // Borrado explícito de los objetos R2 huérfanos para no acumular almacenamiento facturable.
  await Promise.all(media.map((m) => c.env.MEDIA.delete(m.r2_key)));

  return c.body(null, 204);
});

/**
 * El CMS ya resuelve la doble entrada de %/precio-final del lado del cliente
 * (con los helpers de @jaw/shared) y siempre manda discountType +
 * discountValue normalizados. Aca solo se recalcula server-side para no
 * confiar en el final_price que mande el cliente.
 */
function computeDiscount(
  price: number,
  discountType: 'percent' | 'fixed' | null | undefined,
  discountValue: number | null | undefined,
) {
  if (discountType === 'percent' && discountValue != null) {
    return fromPercent(price, discountValue);
  }
  if (discountType === 'fixed' && discountValue != null) {
    return fromFixedAmount(price, discountValue);
  }
  return noDiscount(price);
}
