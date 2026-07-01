import type { MiddlewareHandler } from 'hono';
import type { Role } from '@virtualshop/shared';
import type { AppEnv } from '../env';
import { verifyToken } from '../lib/jwt';
import { forbidden, unauthorized } from '../lib/http-error';

/** Exige un JWT válido y adjunta el usuario en c.var.user */
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) throw unauthorized();

  const token = header.slice('Bearer '.length);
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    c.set('user', { id: payload.id, email: payload.email, role: payload.role });
  } catch {
    throw unauthorized('Token inválido o expirado');
  }
  await next();
};

/** Exige que el usuario autenticado tenga uno de los roles permitidos. Usar después de requireAuth. */
export function requireRole(...roles: Role[]): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user');
    if (!roles.includes(user.role)) throw forbidden();
    await next();
  };
}
