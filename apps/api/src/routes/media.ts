import { Hono } from 'hono';
import {
  ALLOWED_MEDIA_MIME,
  MEDIA_KEY_PREFIX,
  MEDIA_MAX_UPLOAD_BYTES,
  MEDIA_MAX_UPLOAD_MB,
  mediaOrderSchema,
} from '@jaw/shared';
import type { AppEnv } from '../env';
import type { MediaRow } from '../db/rows';
import { mapMedia } from '../db/rows';
import { requireAuth, requireRole } from '../middleware/auth';
import { badRequest, notFound } from '../lib/http-error';
import { parseBody } from '../lib/validate';

/**
 * Convención de claves R2 (spec §11): products/{product_id}/{uuid}.{ext}.
 * La extensión viene de la tabla de MIME permitidos, nunca del nombre del
 * archivo del cliente.
 */
function buildR2Key(productId: number, ext: string): string {
  return `${MEDIA_KEY_PREFIX}${productId}/${crypto.randomUUID()}.${ext}`;
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

  const rule = ALLOWED_MEDIA_MIME[file.type];
  if (!rule) throw badRequest('Tipo de archivo no permitido (usar JPG, PNG, WebP, GIF, MP4 o WebM)');
  if (file.size > MEDIA_MAX_UPLOAD_BYTES) {
    throw badRequest(`El archivo supera el máximo de ${MEDIA_MAX_UPLOAD_MB} MB`);
  }

  const key = buildR2Key(productId, rule.ext);
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
    .bind(productId, rule.type, key, maxOrder?.next ?? 0)
    .first<MediaRow>();
  return c.json(mapMedia(result!), 201);
});

export const mediaRoutes = new Hono<AppEnv>();

/**
 * Entrega pública de archivos guardados en R2 (spec §11). La clave puede tener
 * barras (products/{id}/{uuid}.ext), por eso se captura con un comodín.
 * Sin auth: las imágenes del catálogo son públicas.
 */
mediaRoutes.get('/:key{.+}', async (c) => {
  const key = c.req.param('key');
  // Solo se sirven objetos bajo el prefijo de productos; nunca otras claves del
  // bucket (evita exponer todo R2 como público a través de este endpoint).
  if (!key.startsWith(MEDIA_KEY_PREFIX)) throw notFound('Archivo no encontrado');

  const object = await c.env.MEDIA.get(key);
  if (!object) throw notFound('Archivo no encontrado');

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  // Impide que el navegador reinterprete (sniff) el contenido con otro MIME.
  headers.set('x-content-type-options', 'nosniff');
  return new Response(object.body, { headers });
});

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
  const { displayOrder } = await parseBody(c, mediaOrderSchema);

  const result = await c.env.DB.prepare(
    'UPDATE product_media SET display_order = ? WHERE id = ? RETURNING *',
  )
    .bind(displayOrder, id)
    .first<MediaRow>();
  if (!result) throw notFound('Media no encontrada');
  return c.json(mapMedia(result));
});
