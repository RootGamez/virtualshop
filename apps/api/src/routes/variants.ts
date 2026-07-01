import { Hono } from 'hono';
import type { CreateVariantInput, UpdateVariantInput } from '@virtualshop/shared';
import type { AppEnv } from '../env';
import type { VariantRow } from '../db/rows';
import { mapVariant } from '../db/rows';
import { requireAuth, requireRole } from '../middleware/auth';
import { badRequest, conflict, notFound } from '../lib/http-error';

// Montado dos veces en index.ts: bajo /products/:id/variants (list/create)
// y bajo /variants/:id (update/delete), según spec §8.

export const productVariantRoutes = new Hono<AppEnv>();

productVariantRoutes.get('/:id/variants', async (c) => {
  const productId = Number(c.req.param('id'));
  const { results } = await c.env.DB.prepare('SELECT * FROM product_variants WHERE product_id = ?')
    .bind(productId)
    .all<VariantRow>();
  return c.json(results.map(mapVariant));
});

productVariantRoutes.post(
  '/:id/variants',
  requireAuth,
  requireRole('owner', 'admin'),
  async (c) => {
    const productId = Number(c.req.param('id'));
    const body = await c.req.json<CreateVariantInput>();
    if (!body?.size || !body?.color) throw badRequest('size y color son requeridos');

    const product = await c.env.DB.prepare('SELECT id FROM products WHERE id = ?')
      .bind(productId)
      .first();
    if (!product) throw notFound('Producto no encontrado');

    const existing = await c.env.DB.prepare(
      'SELECT id FROM product_variants WHERE product_id = ? AND size = ? AND color = ?',
    )
      .bind(productId, body.size, body.color)
      .first();
    if (existing) throw conflict('Ya existe una variante con esa talla/color para este producto');

    const result = await c.env.DB.prepare(
      'INSERT INTO product_variants (product_id, size, color, stock) VALUES (?, ?, ?, ?) RETURNING *',
    )
      .bind(productId, body.size, body.color, body.stock ?? 0)
      .first<VariantRow>();
    return c.json(mapVariant(result!), 201);
  },
);

export const variantRoutes = new Hono<AppEnv>();

variantRoutes.patch('/:id', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json<UpdateVariantInput>();

  const current = await c.env.DB.prepare('SELECT * FROM product_variants WHERE id = ?')
    .bind(id)
    .first<VariantRow>();
  if (!current) throw notFound('Variante no encontrada');

  const updated = await c.env.DB.prepare(
    'UPDATE product_variants SET size = ?, color = ?, stock = ? WHERE id = ? RETURNING *',
  )
    .bind(body.size ?? current.size, body.color ?? current.color, body.stock ?? current.stock, id)
    .first<VariantRow>();
  return c.json(mapVariant(updated!));
});

variantRoutes.delete('/:id', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const id = Number(c.req.param('id'));
  const result = await c.env.DB.prepare('DELETE FROM product_variants WHERE id = ?').bind(id).run();
  if (result.meta.changes === 0) throw notFound('Variante no encontrada');
  return c.body(null, 204);
});
