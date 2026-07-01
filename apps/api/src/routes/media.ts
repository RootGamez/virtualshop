import { Hono } from 'hono';
import type { MediaType } from '@jaw/shared';
import type { AppEnv } from '../env';
import type { MediaRow } from '../db/rows';
import { mapMedia } from '../db/rows';
import { requireAuth, requireRole } from '../middleware/auth';
import { badRequest, notFound } from '../lib/http-error';

/** Convención de claves R2 (spec §11): products/{product_id}/{uuid}.{ext} */
function buildR2Key(productId: number, filename: string): string {
  const ext = filename.includes('.') ? filename.split('.').pop() : 'bin';
  return `products/${productId}/${crypto.randomUUID()}.${ext}`;
}

function mediaTypeFromMime(mime: string): MediaType {
  return mime.startsWith('video/') ? 'video' : 'image';
}

// Montado bajo /products/:id/media (POST) y /media/:id (DELETE, PATCH order).

export const productMediaRoutes = new Hono<AppEnv>();

productMediaRoutes.post('/:id/media', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const productId = Number(c.req.param('id'));
  const product = await c.env.DB.prepare('SELECT id FROM products WHERE id = ?')
    .bind(productId)
    .first();
  if (!product) throw notFound('Producto no encontrado');

  const formData = await c.req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) throw badRequest('Se requiere un archivo en el campo "file"');

  const type = mediaTypeFromMime(file.type);
  const key = buildR2Key(productId, file.name);
  await c.env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const maxOrder = await c.env.DB.prepare(
    'SELECT COALESCE(MAX(display_order), -1) + 1 as next FROM product_media WHERE product_id = ?',
  )
    .bind(productId)
    .first<{ next: number }>();

  const result = await c.env.DB.prepare(
    'INSERT INTO product_media (product_id, type, r2_key, display_order) VALUES (?, ?, ?, ?) RETURNING *',
  )
    .bind(productId, type, key, maxOrder?.next ?? 0)
    .first<MediaRow>();
  return c.json(mapMedia(result!), 201);
});

export const mediaRoutes = new Hono<AppEnv>();

mediaRoutes.delete('/:id', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const id = Number(c.req.param('id'));
  const media = await c.env.DB.prepare('SELECT * FROM product_media WHERE id = ?')
    .bind(id)
    .first<MediaRow>();
  if (!media) throw notFound('Media no encontrada');

  await c.env.MEDIA.delete(media.r2_key);
  await c.env.DB.prepare('DELETE FROM product_media WHERE id = ?').bind(id).run();
  return c.body(null, 204);
});

mediaRoutes.patch('/:id/order', requireAuth, requireRole('owner', 'admin'), async (c) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{ displayOrder: number }>();
  if (body?.displayOrder == null) throw badRequest('displayOrder es requerido');

  const result = await c.env.DB.prepare(
    'UPDATE product_media SET display_order = ? WHERE id = ? RETURNING *',
  )
    .bind(body.displayOrder, id)
    .first<MediaRow>();
  if (!result) throw notFound('Media no encontrada');
  return c.json(mapMedia(result));
});
