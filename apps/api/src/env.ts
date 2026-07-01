import type { Role } from '@virtualshop/shared';

/** Bindings de Cloudflare declarados en wrangler.toml */
export interface Bindings {
  DB: D1Database;
  MEDIA: R2Bucket;
  JWT_SECRET: string;
  ENVIRONMENT: string;
}

/** Datos del usuario autenticado, adjuntados al contexto por el middleware de auth */
export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

export interface Variables {
  user: AuthUser;
}

export type AppEnv = { Bindings: Bindings; Variables: Variables };
