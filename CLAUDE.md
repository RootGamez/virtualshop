# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Imported-clothing store for Venezuela (Spanish-language product/UI). Two public-facing surfaces plus a backend, all on Cloudflare:

- `apps/web` — public storefront (landing + catalog). Orders are placed via WhatsApp deep link, not a checkout. No auth.
- `apps/cms` — admin panel (products, categories, media, landing editor, reports). JWT auth.
- `apps/api` — Hono Worker backing both frontends. D1 (SQLite) + R2 (media).
- `packages/shared` — types, DTOs, brand config, design tokens, and domain logic shared by all three apps.
- `packages/ui` — currently empty/unused. shadcn/ui components live **inside each app** at `src/components/ui/`, duplicated per app (web and cms each have their own copy). Do not assume a shared component library.

Package scope is `@jaw/*` (e.g. `@jaw/shared`, `@jaw/api`). Some READMEs say `@virtualshop/*` — that is stale; the real names are `@jaw/*`.

## Commands

Everything is driven through the root `Makefile` (`make help` lists all targets). It wraps pnpm + wrangler and, on Windows, forces Git bash regardless of the calling shell.

```bash
make install            # pnpm install across the monorepo
make env                # create local .dev.vars / .env from .example files
make db-migrate-local   # apply D1 migrations locally (idempotent)
make db-seed-local      # seed categories / whatsapp / landing
make create-owner EMAIL=you@x.com PASSWORD="pw" NAME="You"   # first CMS user (local D1)

make api                # migrates + runs Worker on :8787
make web                # storefront on :5173
make cms                # admin panel on :5174
make dev                # all three at once (Ctrl+C stops all)

make typecheck          # tsc --noEmit across all packages
make lint               # eslint .
make format             # prettier --write .
make build              # build every app that defines a build script
```

Direct pnpm equivalents also work: `pnpm dev:api|dev:web|dev:cms`, `pnpm typecheck`, `pnpm lint`, `pnpm build`. Frontend `build` = `tsc --noEmit && vite build`, so a type error fails the build.

Each app also has its own `Makefile` with unprefixed targets, for when only that app's folder is open.

### Tests

There is **no test runner configured** (no `test` script, no vitest/jest/playwright deps anywhere). If asked to add tests, you are setting up the framework from scratch — confirm the choice first rather than assuming one exists.

## Cloudflare / deployment model

- **api** deploys as a Worker via `make deploy-api` (`wrangler deploy --env production`, worker name `jaw-project-api`). Production config lives in the `[env.production]` block of `apps/api/wrangler.toml` (D1 `jaw-project`, R2 `jaw-project`, CORS origins); wrangler envs do NOT inherit top-level vars/bindings, so any new binding must be declared in both places. Secret `JWT_SECRET` is set with `make secrets` (`wrangler secret put JWT_SECRET --env production`), never in the toml.
- **web** and **cms** deploy to Cloudflare Pages, connected to Git — a `git push` redeploys them automatically. They need `VITE_API_BASE_URL` pointing at the deployed Worker. Security headers/CSP for both live in `public/_headers`.
- In local dev the R2 binding uses `remote = true` — uploads hit the **real** Cloudflare bucket (requires `wrangler login`), while D1 stays local.
- CORS is an allowlist read from `WEB_ORIGIN`/`CMS_ORIGIN` vars (comma-separated origins supported) in `apps/api/src/index.ts`; dev adds localhost:5173/5174 automatically.

Full step-by-step deploy guide is in `README.md` §5.

## Architecture

### Shared package is the contract

`packages/shared` is source-only (`main`/`types` point at `src/index.ts`, no build step) and imported directly by every app. It is the single source of truth for:

- **Domain types** (`types.ts`) — mirror the D1 schema in camelCase.
- **DTOs** (`dto.ts`) — request/response shapes and `PaginatedResult<T>`.
- **Discount logic** (`discount.ts`) — see below.
- **Brand config** (`brand.ts`) and **design tokens** (`tokens.css`) — change the brand name/tagline/colors here, in one place.

When you change a domain shape, change it here first; the API and both frontends consume it.

### API request flow

`apps/api/src/index.ts` mounts one route module per resource under `/api` (Hono `basePath('/api')`). Convention per route file:

1. `requireAuth` then `requireRole('owner', 'admin')` middleware guards mutations (public GETs are unguarded).
2. Raw SQL against D1 via `c.env.DB.prepare(...).bind(...)` — **there is no ORM**.
3. Rows come back snake_case and are mapped to camelCase domain types by the `map*` functions in `src/db/rows.ts`. Every table has a `*Row` interface + `map*` mapper; keep them in sync when the schema changes.
4. Errors are thrown as `HttpError` (`badRequest`/`notFound`/`conflict`/`unauthorized`/`forbidden` from `lib/http-error.ts`) and rendered to JSON by the central `app.onError` handler as `{ error: string }`.

Auth is a custom JWT (`lib/jwt.ts`) with PBKDF2 password hashing (`lib/password.ts`); roles are `owner | admin`. The authenticated user is attached to `c.var.user`.

Note `GET /products/:slug` also accepts a numeric id (the CMS reuses it to load a product for editing); the public site always uses slugs.

### Discount: double-entry, recomputed server-side

The admin can enter either a discount **percent** or a fixed **final price**; the other is derived. The CMS resolves this client-side with the `@jaw/shared` helpers (`fromPercent`, `fromFinalPrice`, `noDiscount`, `fromFixedAmount`) for live preview, and always sends normalized `discountType` + `discountValue`. The API **recomputes `finalPrice` server-side** (`computeDiscount` in `routes/products.ts`) and never trusts a client-sent `finalPrice`. Keep both sides using the shared helpers so preview and persistence agree.

### Frontend conventions

Both frontends are React 19 + Vite + Tailwind v4, using the same thin API client pattern (`src/lib/api.ts`): `request()` prefixes `${API_BASE_URL}/api`, throws `ApiError(status, message)` on non-2xx, and exposes `api.get/post/patch/delete`.

- **cms** client injects `Authorization: Bearer <token>` from the Zustand session store (`store/sessionStore.ts`, persisted to `localStorage`) and auto-logs-out on 401. `web` client is unauthenticated.
- State is Zustand; data fetching goes through custom hooks (`useCmsData`, `useCatalogData`, `useAsync`, `useMutation`).
- `web` additionally uses Three.js / react-three-fiber (3D hero), Motion (animation), Lenis (smooth scroll), and Embla (carousels), all gated by `usePrefersReducedMotion` where relevant.

## Conventions

- TypeScript strict mode with `noUncheckedIndexedAccess` (base config in `tsconfig.base.json`). ESLint 9 flat config in `eslint.config.js`; React-hooks rules apply only to `apps/web` and `apps/cms`.
- Code comments and user-facing strings are in Spanish — match the surrounding language.
- Spec section references (`§5`, `§10`, etc.) in comments point at the project's implementation plan, not files in this repo.
