# VirtualShop

> Nombre temporal — ver `PLAN.md` y `packages/shared/src/brand.ts`.

Tienda de ropa online: landing + catálogo público (pedido vía WhatsApp) y CMS de administración. Stack 100% Cloudflare (Pages + Workers + D1 + R2).

Ver `PLAN.md` para el plan de implementación por fases.

## Estructura

```
apps/
  web/       → tienda pública (React + Vite → Cloudflare Pages)
  cms/       → panel admin (React + Vite → Cloudflare Pages)
  api/       → backend (Hono + TS → Cloudflare Workers, D1, R2)
packages/
  shared/    → tipos TS, DTOs y helpers compartidos
```

## Requisitos

- Node 20+ (ver `.nvmrc`)
- pnpm 9+

## Comandos

```bash
pnpm install       # instala todo el monorepo
pnpm lint          # eslint en todo el repo
pnpm format        # prettier --write
pnpm typecheck     # typecheck de cada paquete
pnpm dev:api       # levanta apps/api (Fase 2)
pnpm dev:web       # levanta apps/web (Fase 3)
pnpm dev:cms       # levanta apps/cms (Fase 4)
```

## Estado

Fase 0 (scaffold) y Fase 1 (`packages/shared`) completas. Ver `PLAN.md` para las fases siguientes.
