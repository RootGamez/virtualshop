import { Hono } from 'hono';
import { createCategorySchema, updateCategorySchema } from '@jaw/shared';
import type { AppEnv } from '../env';
import type { CategoryRow } from '../db/rows';
import { mapCategory } from '../db/rows';
import { requireAuth, requireRole } from '../middleware/auth';
import { conflict, notFound } from '../lib/http-error';
import { parseBody } from '../lib/validate';

export const categoryRoutes = new Hono<AppEnv>();

categoryRoutes.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM categories ORDER BY display_order ASC, name ASC',
  ).all<CategoryRow>();
  return c.json(results.map(mapCategory));
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
  const result = await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  if (result.meta.changes === 0) throw notFound('Categoría no encontrada');
  return c.body(null, 204);
});
