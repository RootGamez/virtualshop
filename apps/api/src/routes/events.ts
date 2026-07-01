import { Hono } from 'hono';
import type { RegisterEventInput } from '@virtualshop/shared';
import type { AppEnv } from '../env';
import { badRequest } from '../lib/http-error';

export const eventRoutes = new Hono<AppEnv>();

eventRoutes.post('/', async (c) => {
  const body = await c.req.json<RegisterEventInput>();
  if (!body?.productId || !body?.type) throw badRequest('productId y type son requeridos');
  if (body.type !== 'view' && body.type !== 'order_click') {
    throw badRequest('type debe ser "view" u "order_click"');
  }

  await c.env.DB.prepare('INSERT INTO events (product_id, type) VALUES (?, ?)')
    .bind(body.productId, body.type)
    .run();
  return c.body(null, 201);
});
