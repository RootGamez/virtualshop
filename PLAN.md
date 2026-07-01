# Plan de implementación — VirtualShop

Estado actual del repo: vacío (solo README). Este plan define el orden de construcción de cero, respetando la especificación técnica del proyecto (100% Cloudflare, pnpm, monorepo, desarrollo desde móvil).

## Principios que guían el orden

- Cada fase debe dejar algo desplegable o verificable, no solo código muerto.
- `packages/shared` va primero porque web, cms y api dependen de sus tipos.
- El backend (api + D1) va antes que los frontends porque ambos frontends consumen la misma API.
- El nombre de marca "VirtualShop" se trata como variable de configuración desde el día 1 (una sola constante de branding), no se hardcodea en ningún componente.
- Nada de hex hardcodeado: los design tokens se configuran antes de escribir el primer componente visual.
- Cada fase se puede completar con comandos simples desde un editor móvil (Spck Editor / Acode), sin herramientas de escritorio.

---

## Fase 0 — Scaffold del monorepo

- Crear estructura `apps/{web,cms,api}` + `packages/shared`.
- `package.json` raíz con workspaces de pnpm (`pnpm-workspace.yaml`).
- `tsconfig.base.json` compartido, extendido por cada app.
- ESLint + Prettier a nivel raíz (config única, no duplicada por app).
- `.gitignore`, `.nvmrc`/engines, README real (reemplazar el placeholder actual).
- Archivo de configuración de marca: `packages/shared/src/brand.ts` con el nombre "VirtualShop" como único punto de verdad (nombre, tagline, dominio).

**Entregable:** `pnpm install` corre limpio en la raíz sin apps funcionales aún.

## Fase 1 — packages/shared

- Tipos TS: `Product`, `ProductVariant`, `Category`, `ProductMedia`, `LandingConfig`, `WhatsappConfig`, `User`, `Event`, más los enums (`DiscountType`, `MediaType`, `EventType`, `Role`).
- Tipos de request/response de la API (DTOs) para que web/cms/api compartan contratos.
- Helper de cálculo de descuento (precio final ↔ porcentaje, bidireccional) — vive aquí porque lo usan tanto la API (al persistir) como el CMS (al previsualizar).
- Constante de marca (de la Fase 0) exportada desde aquí.

**Entregable:** paquete compilable e importable por las otras 3 apps.

## Fase 2 — apps/api (backend, Hono + D1 + R2)

1. Setup de Wrangler (`wrangler.toml`), binding de D1 y R2 en local (`wrangler dev`).
2. Migraciones SQL de D1: `users`, `categories`, `products`, `product_variants`, `product_media`, `landing_config`, `whatsapp_config`, `events` + índices listados en la spec (§5).
3. Auth: hash de contraseñas, login JWT, middleware de verificación, middleware de roles (`owner` vs `admin`).
4. Endpoints en este orden (cada grupo depende del anterior):
   - `/auth/login`, `/auth/me`
   - `/categories` (CRUD)
   - `/products` (CRUD + cálculo de descuento en create/patch)
   - `/products/:id/variants`, `/variants/:id` (stock)
   - `/products/:id/media`, `/media/:id` (subida/borrado en R2)
   - `/landing` (GET público + PATCH por sección, con validación de JSON)
   - `/whatsapp` (GET público + PATCH)
   - `/users` (solo owner)
   - `/events` (POST público, base de los reportes)
   - `/reports/*` (order-clicks, most-viewed, low-stock, by-category)
5. Seed script: usuario `owner` inicial + categorías/productos de prueba.

**Entregable:** API completa y probada con `curl`/Thunder Client contra D1 local, desplegable a Workers.

## Fase 3 — apps/web (tienda pública)

1. Setup Vite + React + TS + Tailwind, variables CSS de design tokens (§7) y extensión del theme de Tailwind — antes de cualquier componente visual.
2. Zustand para filtros de catálogo. React Router para navegación. Lenis para smooth scroll. Embla para carruseles. Motion para animaciones (`whileInView`, hover), respetando `prefers-reduced-motion`.
3. Landing: hero, secciones editables desde `landing_config`, animaciones de entrada.
4. Catálogo: grid mobile-first, filtro por categoría, paginación/lazy-load, tarjetas con etiqueta de oferta (token accent).
5. Detalle de producto: galería de media, variantes (talla/color/stock) solo informativas, precio tachado + final si hay descuento.
6. Flujo de pedido WhatsApp: botón "Pedir" → POST `/events` (`order_click`) → abrir `wa.me` con plantilla confirmada (§9). Tracking de `view` al entrar al detalle.
7. SEO básico: meta tags, títulos semánticos, URLs con slug.

**Entregable:** sitio público desplegado en Cloudflare Pages, funcional en móvil.

## Fase 4 — apps/cms (panel admin)

1. Mismo setup base (Vite + React + TS + Tailwind + tokens) reutilizando la config de la Fase 3 donde aplique.
2. Login JWT, guard de rutas, sesión en Zustand.
3. CRUD de categorías y productos (con doble entrada de descuento: % ↔ precio final, ver §10).
4. Gestión de variantes/stock por producto.
5. Subida de imágenes/video a R2 con reordenamiento (`display_order`).
6. Editor de secciones de landing (formularios generados desde el JSON de cada `section_key`, con validación).
7. Configuración de WhatsApp (número + plantilla).
8. Gestión de usuarios — solo visible/accesible para `owner` (§6).
9. Dashboard de reportes: clics en pedir, más vistos, stock bajo, por categoría — con filtro de fecha.
10. Estados de UI consistentes: loading, vacío, error, agotado en cada vista.

**Entregable:** CMS desplegado en subdominio admin de Cloudflare Pages.

## Fase 5 — Despliegue y conexión final

- Cloudflare Pages para `apps/web` y `apps/cms` (proyectos separados).
- Cloudflare Workers para `apps/api` vía Wrangler, con D1 y R2 bindings en producción.
- Variables de entorno/secrets (JWT secret, etc.) en Cloudflare, no en el repo.
- Verificar capa gratuita real de D1/R2/Workers/Pages al momento del despliegue (pendiente abierto en §13).
- Dominios: público para `web`, subdominio para `cms`.

**Entregable:** las 3 apps en producción, comunicándose entre sí.

## Fase 6 — Pulido y QA

- Auditoría de accesibilidad (contraste, teclado, `alt`, ARIA).
- Auditoría de performance móvil (Lighthouse: lazy-loading, bundle size, animaciones GPU-friendly).
- Prueba responsive real: móvil, tablet, desktop.
- Revisión de que ningún componente tenga hex hardcodeado (todo vía token).
- Revisión de que "VirtualShop" solo aparezca vía la constante de marca, no hardcodeado en textos/componentes.

---

## Pendientes que no bloquean el arranque (retomar cuando haya respuesta)

- Nombre definitivo de marca → hoy es solo config, se cambia en un lugar.
- Logo/tipografía definitivos → no bloquea Fase 0-2, sí afecta detalle visual de Fase 3-4.
- Categorías iniciales concretas → necesarias como seed real antes de cargar los ~100 productos, no bloquea desarrollo.
- Confirmar límites exactos de capa gratuita de Cloudflare → revisar antes de Fase 5 si el tráfico esperado crece.

## Orden recomendado de trabajo

Fase 0 → Fase 1 → Fase 2 → (Fase 3 y Fase 4 pueden ir en paralelo una vez la API esté estable) → Fase 5 → Fase 6.
