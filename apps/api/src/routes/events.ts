import { Hono } from 'hono';
import type { RegisterEventInput } from '@jaw/shared';
import type { AppEnv } from '../env';
import { badRequest, notFound } from '../lib/http-error';
import { rateLimit } from '../middleware/rate-limit';

export const eventRoutes = new Hono<AppEnv>();

// Endpoint público: rate limit por IP para evitar flood de inserts (analíticas
// envenenadas + costo de escritura en D1).
eventRoutes.post('/', rateLimit((env) => env.EVENTS_LIMITER), async (c) => {
  const body = await c.req.json<RegisterEventInput>();
  if (!body?.productId || !body?.type) throw badRequest('productId y type son requeridos');
  if (body.type !== 'view' && body.type !== 'order_click') {
    throw badRequest('type debe ser "view" u "order_click"');
  }

  const productId = Number(body.productId);
  if (!Number.isInteger(productId) || productId <= 0) throw badRequest('productId inválido');

  // Verificar que el producto exista antes de insertar: evita basura en la tabla
  // events y filas que romperían los JOIN de los reportes.
  const product = await c.env.DB.prepare('SELECT id FROM products WHERE id = ?')
    .bind(productId)
    .first();
  if (!product) throw notFound('Producto no encontrado');

  await c.env.DB.prepare('INSERT INTO events (product_id, type) VALUES (?, ?)')
    .bind(productId, body.type)
    .run();
  return c.body(null, 201);
});
