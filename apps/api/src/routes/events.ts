import { Hono } from 'hono';
import { registerEventSchema } from '@jaw/shared';
import type { AppEnv } from '../env';
import { notFound } from '../lib/http-error';
import { parseBody } from '../lib/validate';
import { rateLimit } from '../middleware/rate-limit';

export const eventRoutes = new Hono<AppEnv>();

// Endpoint público: rate limit por IP para evitar flood de inserts (analíticas
// envenenadas + costo de escritura en D1).
eventRoutes.post('/', rateLimit((env) => env.EVENTS_LIMITER), async (c) => {
  const { productId, type } = await parseBody(c, registerEventSchema);

  // Verificar que el producto exista antes de insertar: evita basura en la tabla
  // events y filas que romperían los JOIN de los reportes.
  const product = await c.env.DB.prepare('SELECT id FROM products WHERE id = ?')
    .bind(productId)
    .first();
  if (!product) throw notFound('Producto no encontrado');

  await c.env.DB.prepare('INSERT INTO events (product_id, type) VALUES (?, ?)')
    .bind(productId, type)
    .run();
  return c.body(null, 201);
});
