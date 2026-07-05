# JAW Project

> Marca configurable en un solo lugar: `packages/shared/src/brand.ts`. Paquetes bajo el scope `@jaw/*`.

Tienda de ropa importada (Venezuela): landing + catálogo público (pedido vía WhatsApp) y CMS de administración. UI con shadcn/ui, Tailwind v4, Motion y un hero 3D (Three.js). Stack 100% Cloudflare (Pages + Workers + D1 + R2), monorepo con pnpm.

```
apps/
  web/       → tienda pública (React + Vite → Cloudflare Pages)
  cms/       → panel admin (React + Vite → Cloudflare Pages)
  api/       → backend (Hono + TS → Cloudflare Workers, D1, R2)
packages/
  shared/    → tipos TS, DTOs, design tokens y helpers compartidos
```

Ver `PLAN.md` para el plan de implementación por fases y su estado actual.

---

## 1. Requisitos previos

- **Node 20+** y **pnpm 9+** (ver `.nvmrc`). En Termux/Android: `pkg install nodejs`, después `npm i -g pnpm` o usar `corepack enable`.
- **Cuenta de Cloudflare** (el plan gratuito alcanza para el arranque — ver §5 sobre límites).
- **Cuenta de GitHub** con acceso al repo `RootGamez/virtualshop`.
- **`make`**: viene preinstalado en Linux/macOS/Termux. En Windows, usar WSL o Git Bash con `make` instalado.

No hace falta instalar Wrangler por separado: es una devDependency de `apps/api` y el Makefile siempre lo invoca vía `pnpm wrangler ...`.

---

## 2. Setup local (primera vez)

```bash
git clone <url-del-repo>
cd virtualshop
make install      # pnpm install en todo el monorepo
make env          # crea apps/api/.dev.vars, apps/web/.env, apps/cms/.env desde los .example
```

Después de `make env`, abrí `apps/api/.dev.vars` y cambiá `JWT_SECRET` por un valor random largo (no dejes el de ejemplo, ni en local). Cualquier string largo sirve para desarrollo:

```bash
# generar uno rápido:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Cargá la base de datos local y creá tu primer usuario:

```bash
make db-migrate-local
make db-seed-local
make create-owner EMAIL=vos@ejemplo.com PASSWORD="unaContraseñaSegura" NAME="Tu Nombre"
```

`make create-owner` genera el hash de la contraseña y lo inserta directo en D1 local — no hace falta copiar/pegar nada a mano.

### Levantar todo

```bash
make api    # Worker + D1 local, en http://localhost:8787
make web    # tienda pública, en http://localhost:5173
make cms    # panel admin, en http://localhost:5174
```

Cada uno de estos comandos ya hace todo lo necesario (crea `.env` si falta, aplica migraciones pendientes en el caso de `api`, y arranca el server). Se corren en terminales separadas.

Si tenés una sola terminal que soporte procesos en paralelo (Termux con `tmux`, o cualquier terminal de escritorio), podés levantar las 3 apps con un solo comando:

```bash
make dev    # api + web + cms juntos, Ctrl+C corta todo
```

Iniciá sesión en `apps/cms` (http://localhost:5174/login) con el usuario que creaste con `make create-owner`.

---

## 3. Comandos disponibles (`make help`)

Corré `make help` en la raíz para ver esta misma lista siempre actualizada.

| Comando | Qué hace |
|---|---|
| `make install` | `pnpm install` en todo el monorepo |
| `make env` | Crea los `.env`/`.dev.vars` locales desde los `.example` |
| `make api` | Migra D1 local + levanta el Worker (`:8787`) |
| `make web` | Levanta la tienda pública (`:5173`) |
| `make cms` | Levanta el panel admin (`:5174`) |
| `make dev` | Levanta api + web + cms juntos |
| `make db-migrate-local` | Aplica migraciones de D1 en local |
| `make db-seed-local` | Carga categorías/whatsapp/landing de ejemplo |
| `make create-owner EMAIL=… PASSWORD=… NAME=…` | Crea el usuario owner en D1 local |
| `make typecheck` | `tsc --noEmit` en todos los paquetes |
| `make lint` | ESLint en todo el repo |
| `make format` | Prettier `--write` en todo el repo |
| `make build` | Compila todas las apps |
| `make clean` | Borra `node_modules`, `dist`, `.wrangler` de todo el repo |
| `make cf-login` | `wrangler login` (abre el navegador) |
| `make db-create` | Crea la D1 de **producción** y actualiza `wrangler.toml` solo |
| `make r2-create` | Crea el bucket R2 de producción |
| `make secrets` | Configura `JWT_SECRET` de producción (prompt interactivo) |
| `make db-migrate-remote` | Aplica migraciones en la D1 de producción |
| `make create-owner-remote EMAIL=… PASSWORD=… NAME=…` | Crea el owner en producción |
| `make deploy-api` | Despliega el Worker a Cloudflare |
| `make build-web` / `make build-cms` | Compila cada frontend para producción |
| `make deploy` | `deploy-api` + compila web y cms (Pages se despliega por Git, ver §5.3) |

**Si tu editor móvil solo tiene abierta una carpeta de app** (por ejemplo, entraste directo a `apps/api`), cada app también tiene su propio `Makefile` con los comandos equivalentes sin el prefijo (`make dev`, `make migrate-local`, `make deploy`, etc. — corré `make help` ahí también).

---

## 4. Estructura del proyecto

Ver también los README de cada app para más detalle:
- [`apps/api/README.md`](./apps/api/README.md)
- [`apps/web/README.md`](./apps/web/README.md)
- [`apps/cms/README.md`](./apps/cms/README.md)

---

## 5. Despliegue a Cloudflare (producción)

Todo el flujo de abajo se puede hacer una sola vez (setup inicial) y después el día a día es solo `git push` + `make deploy-api` cuando cambia el backend.

### 5.1. Login y recursos de Cloudflare

```bash
make cf-login          # abre el navegador, iniciá sesión con tu cuenta de Cloudflare
make db-create          # crea la D1 de producción "jaw-project" (solo si no existe todavía)
make r2-create           # crea el bucket R2 "jaw-project" (solo si no existe todavía)
make secrets              # te pide el valor de JWT_SECRET de producción (usá uno distinto al de local)
```

La configuración de producción vive en el bloque `[env.production]` de `apps/api/wrangler.toml`: ahí están el `database_id` de la D1 `jaw-project`, el bucket R2 y los orígenes CORS (`WEB_ORIGIN`/`CMS_ORIGIN`). Si creás una base nueva, copiá el `database_id` que devuelve Wrangler en ese bloque (el id no es secreto, solo identifica el recurso).

### 5.2. Migrar y crear el owner en producción

```bash
make db-migrate-remote
make create-owner-remote EMAIL=vos@ejemplo.com PASSWORD="otraContraseñaDistintaALocal" NAME="Tu Nombre"
```

### 5.3. Desplegar el Worker (API)

```bash
make deploy-api
```

Esto despliega el worker `jaw-project-api` (entorno `production` de wrangler) y te da una URL tipo `https://jaw-project-api.<tu-subdominio>.workers.dev`. Guardala: la vas a necesitar en el paso siguiente para `apps/web` y `apps/cms`.

### 5.4. Desplegar `apps/web` y `apps/cms` (Cloudflare Pages)

La forma recomendada para este proyecto (sin CLI, todo desde el dashboard, ideal si trabajás desde el celular) es conectar Pages directo al repo de GitHub:

1. En el dashboard de Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Elegí el repo `RootGamez/virtualshop`.
3. Creá **dos proyectos de Pages separados**, uno para cada app, con esta configuración:

   **Proyecto `jaw-web` (tienda pública):**
   - Root directory: `apps/web`
   - Build command: `pnpm install && pnpm build`
   - Build output directory: `dist`
   - Variables de entorno:
     - `VITE_API_BASE_URL` = la URL del Worker desplegado en 5.3
     - `VITE_MEDIA_BASE_URL` = la URL pública del bucket R2 (`https://pub-XXXX.r2.dev` o tu dominio propio sobre R2)

   **Proyecto `jaw-cms` (panel admin):**
   - Root directory: `apps/cms`
   - Build command: `pnpm install && pnpm build`
   - Build output directory: `dist`
   - Variables de entorno: `VITE_API_BASE_URL` y `VITE_MEDIA_BASE_URL` = las mismas de arriba

4. Guardar. Cloudflare va a buildear y desplegar automáticamente en cada `git push` a la rama principal — no hace falta volver a tocar esto.

> Alternativa CLI (si preferís no usar el dashboard): `pnpm wrangler pages deploy dist --project-name=virtualshop-web` parado en `apps/web` después de `make build-web` (y lo mismo para `cms`). Requiere crear el proyecto de Pages una vez con `pnpm wrangler pages project create`.

### 5.5. Actualizar CORS en la API

El CORS es una allowlist que se lee de las vars `WEB_ORIGIN` y `CMS_ORIGIN` en el bloque `[env.production]` de `apps/api/wrangler.toml`. Cada una acepta **varios orígenes separados por coma**, útil mientras conviven los dominios `*.pages.dev` de prueba y el definitivo, por ejemplo:

```toml
WEB_ORIGIN = "https://jaw-web.pages.dev,https://jawproject.online"
CMS_ORIGIN = "https://jaw-cms.pages.dev,https://cms.jawproject.online"
```

Cuando tengas las URLs reales de Pages (o el dominio propio), ponelas ahí y volvé a correr `make deploy-api`. Si el origen del navegador no está en la lista, el frontend ve errores de CORS en la consola.

### 5.6. Dominio propio (opcional)

Configurable desde **Workers & Pages → tu proyecto → Custom domains** tanto para el Worker como para cada proyecto de Pages. Recordá actualizar `VITE_API_BASE_URL` en Pages y el CORS del Worker si cambiás el dominio de la API.

---

## 6. Actualizar producción después del setup inicial

- **Cambios en `apps/web` o `apps/cms`:** `git push` — Pages los despliega solo.
- **Cambios en `apps/api`:** `make deploy-api`.
- **Nueva migración de base de datos:** agregar el archivo en `apps/api/migrations/`, correr `make db-migrate-local` para probarla, y `make db-migrate-remote` para aplicarla en producción.

---

## 7. Troubleshooting

- **`pnpm: command not found`**: instalá pnpm (`npm i -g pnpm` o `corepack enable`).
- **`wrangler dev` no levanta / error de D1 local**: borrá `apps/api/.wrangler` y volvé a correr `make db-migrate-local`.
- **Login del CMS da 401 siempre**: revisá que `apps/api/.dev.vars` tenga un `JWT_SECRET` (no vacío) y que `apps/cms/.env` apunte al mismo `apps/api` que tenés corriendo.
- **Las imágenes no cargan en `apps/web`/`apps/cms`**: falta configurar `VITE_MEDIA_BASE_URL` apuntando al dominio público del bucket R2 (o a un dominio custom sobre R2). Ver `apps/web/README.md`.
- **El deploy de la API falla por la D1**: verificá que el `database_id` del bloque `[env.production]` de `apps/api/wrangler.toml` coincida con el de `pnpm wrangler d1 list`.
- **La web/cms desplegadas ven errores de CORS**: el origen del navegador tiene que estar en `WEB_ORIGIN`/`CMS_ORIGIN` del bloque `[env.production]` (acepta varios separados por coma) — editá y volvé a correr `make deploy-api`.
- **Verificar la capa gratuita de Cloudflare**: revisar límites actuales de D1/R2/Workers/Pages en el dashboard antes de que el tráfico crezca (pendiente abierto en `PLAN.md`).
