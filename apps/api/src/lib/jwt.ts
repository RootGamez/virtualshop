import { sign, verify } from 'hono/jwt';
import type { AuthUser } from '../env';

const EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 dias
const ALG = 'HS256';

export interface JwtPayload extends AuthUser {
  exp: number;
  [key: string]: unknown;
}

export async function signToken(user: AuthUser, secret: string): Promise<string> {
  const payload: JwtPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + EXPIRY_SECONDS,
  };
  return sign(payload, secret, ALG);
}

export async function verifyToken(token: string, secret: string): Promise<JwtPayload> {
  return (await verify(token, secret, ALG)) as unknown as JwtPayload;
}
