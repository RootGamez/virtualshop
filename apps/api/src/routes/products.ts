import { Hono } from 'hono';
import {
  fromFixedAmount,
  fromPercent,
  noDiscount,
  type CreateProductInput,
  type PaginatedResult,
  type ProductDetail,
  type UpdateProductInput,
} from '@virtualshop/shared';
import { slugify } from '../lib/slug';
import type { AppEnv } from '../env';
import type { CategoryRow, MediaRow, ProductRow, VariantRow } from '../db/rows';
import { mapMedia, mapProduct, mapVariant } from '../db/rows';
import { requireAuth, requireRole } from '../middleware/auth';
import { badRequest, conflict, notFound } from '../lib/http-error';

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

  const body: PaginatedResult<ReturnType<typeof mapProduct>> = {
    items: results.map(mapProduct),
    page,
    pageSize,
    total: countRow?.total ?? 0,
  };
  return c.json(body);
});

productRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  // El CMS reusa esta misma ruta para cargar por id numerico (ediciones via /productos/:id);
  // el publico siempre entra por slug.
  const isNumericId = /^\d+$/.test(slug);
  const product = await c.env.DB.prepare(
    isNumericId ? 'SELECT * FROM products WHERE id = ?' : 'SELECT * FROM products WHERE slug = ?',
  )
    .bind(isNumericId ? Number(slug) : slug)
    .first<ProductRow>();
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
  const body = await c.req.json<CreateProductInput>();
  if (!body?.name || !body?.categoryId || body.price == null) {
    throw badRequest('categoryId, name y price son requeridos');
  }
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
  const body = await c.req.json<UpdateProductInput>();

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
  const result = await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  if (result.meta.changes === 0) throw notFound('Producto no encontrado');
  return c.body(null, 204);
});

/**
 * El CMS ya resuelve la doble entrada de %/precio-final del lado del cliente
 * (con los helpers de @virtualshop/shared) y siempre manda discountType +
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
