import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AppEnv, Bindings } from './env';
import { HttpError } from './lib/http-error';

import { authRoutes } from './routes/auth';
import { categoryRoutes } from './routes/categories';
import { productRoutes } from './routes/products';
import { productVariantRoutes, variantRoutes } from './routes/variants';
import { productMediaRoutes, mediaRoutes } from './routes/media';
import { landingRoutes } from './routes/landing';
import { whatsappRoutes } from './routes/whatsapp';
import { userRoutes } from './routes/users';
import { eventRoutes } from './routes/events';
import { reportRoutes } from './routes/reports';

const app = new Hono<AppEnv>().basePath('/api');

/**
 * Orígenes permitidos por CORS. En producción se toman de WEB_ORIGIN/CMS_ORIGIN
 * (vars de wrangler). En desarrollo se agregan los puertos locales de web y cms.
 */
function allowedOrigins(env: Bindings): string[] {
  const list: string[] = [];
  if (env.WEB_ORIGIN) list.push(env.WEB_ORIGIN);
  if (env.CMS_ORIGIN) list.push(env.CMS_ORIGIN);
  if (env.ENVIRONMENT === 'development') {
    list.push('http://localhost:5173', 'http://localhost:5174');
  }
  return list;
}

app.use('*', (c, next) =>
  cors({
    origin: (origin) => {
      const allowed = allowedOrigins(c.env);
      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })(c, next),
);

app.route('/auth', authRoutes);
app.route('/categories', categoryRoutes);
app.route('/products', productRoutes);
app.route('/products', productVariantRoutes); // /products/:id/variants
app.route('/variants', variantRoutes);
app.route('/products', productMediaRoutes); // /products/:id/media
app.route('/media', mediaRoutes);
app.route('/landing', landingRoutes);
app.route('/whatsapp', whatsappRoutes);
app.route('/users', userRoutes);
app.route('/events', eventRoutes);
app.route('/reports', reportRoutes);

app.notFound((c) => c.json({ error: 'Ruta no encontrada' }, 404));

app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: 'Error interno del servidor' }, 500);
});

export default app;
