import { Hono } from 'hono';
import { loginSchema, type LoginResponse } from '@jaw/shared';
import type { AppEnv } from '../env';
import type { UserRow } from '../db/rows';
import { mapUser } from '../db/rows';
import { verifyPassword } from '../lib/password';
import { signToken } from '../lib/jwt';
import { unauthorized } from '../lib/http-error';
import { requireAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rate-limit';
import { parseBody } from '../lib/validate';

export const authRoutes = new Hono<AppEnv>();

// Rate limit por IP para frenar fuerza bruta / credential stuffing en el login.
authRoutes.post('/login', rateLimit((env) => env.LOGIN_LIMITER), async (c) => {
  const body = await parseBody(c, loginSchema);

  const row = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(body.email.toLowerCase())
    .first<UserRow>();
  if (!row) throw unauthorized('Credenciales inválidas');

  const valid = await verifyPassword(body.password, row.password_hash);
  if (!valid) throw unauthorized('Credenciales inválidas');

  const token = await signToken({ id: row.id, email: row.email, role: row.role }, c.env.JWT_SECRET);
  return c.json<LoginResponse>({ token });
});

authRoutes.get('/me', requireAuth, async (c) => {
  const authUser = c.get('user');
  const row = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(authUser.id)
    .first<UserRow>();
  if (!row) throw unauthorized();
  return c.json(mapUser(row));
});

