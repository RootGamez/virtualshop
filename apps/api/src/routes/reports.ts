import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { requireAuth, requireRole } from '../middleware/auth';

export const reportRoutes = new Hono<AppEnv>();
reportRoutes.use('*', requireAuth, requireRole('owner', 'admin'));

/** Rango de fechas opcional, mismo formato en los 4 reportes (spec §8). */
function dateRange(c: { req: { query: (k: string) => string | undefined } }) {
  const from = c.req.query('from') ?? '0000-01-01'; // ISO date, inclusivo
  const to = c.req.query('to') ?? '9999-12-31';
  // Se compara por rango sobre la columna cruda ('YYYY-MM-DD HH:MM:SS') en vez de
  // envolverla con date(), para poder usar idx_events_created_at. El límite
  // superior incluye todo el día indicado.
  return { from, toEnd: `${to} 23:59:59` };
}

reportRoutes.get('/order-clicks', async (c) => {
  const { from, toEnd } = dateRange(c);
  const { results } = await c.env.DB.prepare(
    `SELECT p.id as productId, p.name, COUNT(e.id) as clicks
     FROM events e
     JOIN products p ON p.id = e.product_id
     WHERE e.type = 'order_click' AND e.created_at >= ? AND e.created_at <= ?
     GROUP BY p.id
     ORDER BY clicks DESC`,
  )
    .bind(from, toEnd)
    .all();
  return c.json(results);
});

reportRoutes.get('/most-viewed', async (c) => {
  const { from, toEnd } = dateRange(c);
  const { results } = await c.env.DB.prepare(
    `SELECT p.id as productId, p.name, COUNT(e.id) as views
     FROM events e
     JOIN products p ON p.id = e.product_id
     WHERE e.type = 'view' AND e.created_at >= ? AND e.created_at <= ?
     GROUP BY p.id
     ORDER BY views DESC`,
  )
    .bind(from, toEnd)
    .all();
  return c.json(results);
});

reportRoutes.get('/low-stock', async (c) => {
  const threshold = Number(c.req.query('threshold') ?? 5);
  const { results } = await c.env.DB.prepare(
    `SELECT p.id as productId, p.name, v.size, v.color, v.stock
     FROM product_variants v
     JOIN products p ON p.id = v.product_id
     WHERE v.stock <= ?
     ORDER BY v.stock ASC`,
  )
    .bind(threshold)
    .all();
  return c.json(results);
});

reportRoutes.get('/by-category', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.id as categoryId, c.name, COUNT(p.id) as total
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
     GROUP BY c.id
     ORDER BY c.display_order ASC`,
  ).all();
  return c.json(results);
});
