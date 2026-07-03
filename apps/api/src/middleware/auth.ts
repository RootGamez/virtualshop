import type { Context, MiddlewareHandler } from 'hono';
import type { Role } from '@jaw/shared';
import type { AppEnv, AuthUser } from '../env';
import { verifyToken } from '../lib/jwt';
import { forbidden, unauthorized } from '../lib/http-error';

/**
 * Verifica el Bearer token y devuelve el usuario, o lanza 401.
 * Reutilizable fuera de la cadena de middleware (p. ej. rutas que son
 * públicas por slug pero autenticadas por id).
 */
export async function authenticate(c: Context<AppEnv>): Promise<AuthUser> {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) throw unauthorized();

  const token = header.slice('Bearer '.length);
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    return { id: payload.id, email: payload.email, role: payload.role };
  } catch {
    throw unauthorized('Token inválido o expirado');
  }
}

/** Exige un JWT válido y adjunta el usuario en c.var.user */
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  c.set('user', await authenticate(c));
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
