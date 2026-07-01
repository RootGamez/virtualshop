import { Hono } from 'hono';
import type { AppEnv } from '../env';
import type { LandingRow } from '../db/rows';
import { mapLanding } from '../db/rows';
import { requireAuth, requireRole } from '../middleware/auth';
import { badRequest, notFound } from '../lib/http-error';

export const landingRoutes = new Hono<AppEnv>();

landingRoutes.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM landing_config WHERE is_active = 1 ORDER BY display_order ASC',
  ).all<LandingRow>();
  return c.json(results.map(mapLanding));
});

landingRoutes.patch('/:sectionKey', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const sectionKey = c.req.param('sectionKey');
  const body = await c.req.json<{ content?: unknown; displayOrder?: number; isActive?: boolean }>();

  if (body.content !== undefined && !isPlainObject(body.content)) {
    throw badRequest('content debe ser un objeto JSON válido');
  }

  const current = await c.env.DB.prepare('SELECT * FROM landing_config WHERE section_key = ?')
    .bind(sectionKey)
    .first<LandingRow>();
  if (!current) throw notFound('Sección no encontrada');

  const updated = await c.env.DB.prepare(
    'UPDATE landing_config SET content = ?, display_order = ?, is_active = ? WHERE section_key = ? RETURNING *',
  )
    .bind(
      body.content !== undefined ? JSON.stringify(body.content) : current.content,
      body.displayOrder ?? current.display_order,
      body.isActive !== undefined ? (body.isActive ? 1 : 0) : current.is_active,
      sectionKey,
    )
    .first<LandingRow>();
  return c.json(mapLanding(updated!));
});

function isPlainObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
