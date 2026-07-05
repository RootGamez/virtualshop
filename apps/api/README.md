# @virtualshop/api

Worker Hono + TypeScript + D1 + R2. Ver `/PLAN.md` en la raíz para el plan completo por fases.

## Setup local

```bash
# 1. Crear el JWT secret local
cp .dev.vars.example .dev.vars
# editar .dev.vars con un secreto real

# 2. Aplicar migraciones a D1 local
pnpm db:migrations:apply:local

# 3. Cargar datos de ejemplo (categorías, whatsapp_config, landing_config)
pnpm db:seed:local

# 4. Crear el usuario owner inicial
pnpm create-owner owner@ejemplo.com "unaContraseñaSegura" "Nombre Owner"
# copiar el INSERT que imprime y correrlo:
pnpm wrangler d1 execute virtualshop-db --local --command "<pegar el INSERT acá>"

# 5. Levantar el worker
pnpm dev
```

## Despliegue

La configuración de producción vive en el bloque `[env.production]` de `wrangler.toml` (worker `jaw-project-api`, D1 y R2 `jaw-project`, orígenes CORS).

```bash
pnpm wrangler d1 create jaw-project           # una sola vez (si no existe); copiar database_id a [env.production]
pnpm wrangler r2 bucket create jaw-project     # una sola vez (si no existe)
pnpm wrangler secret put JWT_SECRET --env production
pnpm db:migrations:apply:prod
pnpm deploy
```

## Estructura

```
src/
  index.ts        → app Hono, monta rutas, CORS, manejo de errores
  env.ts          → tipos de bindings (D1, R2, JWT_SECRET)
  db/rows.ts       → filas D1 (snake_case) -> tipos de dominio (camelCase)
  lib/            → password (PBKDF2), jwt, slug, http-error
  middleware/auth.ts → requireAuth, requireRole
  routes/         → un archivo por recurso, según spec §8
migrations/       → esquema D1 versionado
seed.sql          → datos de ejemplo para desarrollo
scripts/create-owner.ts → genera el INSERT del primer usuario owner
```

Endpoints implementados: auth, categories, products (+ descuento doble-entrada), variants/stock, media (R2), landing, whatsapp, users (solo owner), events, reports.
