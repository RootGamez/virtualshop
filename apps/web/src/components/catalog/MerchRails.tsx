import {
  CATALOG_SECTION_KEYS,
  type CatalogBestSellersConfig,
  type CatalogDropsConfig,
  type CatalogLowStockConfig,
} from '@jaw/shared';
import { useBestSellers, useLanding, useLowStock, useProducts } from '../../hooks/useCatalogData';
import { ProductRail } from './ProductRail';
import { Badge } from '../ui/badge';

const RAIL_LIMIT_DEFAULT = 8;
const NEW_WINDOW_DAYS_DEFAULT = 14;

/**
 * Rails de merchandising del catálogo (Últimos drops, Más comprados, Se están
 * acabando). Qué rails se muestran, su orden y sus parámetros los decide el
 * admin desde el CMS (filas catalog_* de landing_config). Si un rail no tiene
 * productos o su fetch falla, se omite en silencio: es contenido secundario.
 */
export function MerchRails() {
  const { data: landing } = useLanding();

  const railKeys = Object.values(CATALOG_SECTION_KEYS) as string[];
  const sections = (landing ?? [])
    .filter((s) => railKeys.includes(s.sectionKey))
    .sort((a, b) => a.displayOrder - b.displayOrder);
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => {
        switch (section.sectionKey) {
          case CATALOG_SECTION_KEYS.drops:
            return (
              <LatestDropsRail key={section.sectionKey} config={section.content as CatalogDropsConfig} />
            );
          case CATALOG_SECTION_KEYS.bestSellers:
            return (
              <BestSellersRail
                key={section.sectionKey}
                config={section.content as CatalogBestSellersConfig}
              />
            );
          case CATALOG_SECTION_KEYS.lowStock:
            return (
              <LowStockRail key={section.sectionKey} config={section.content as CatalogLowStockConfig} />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

/** true si la fecha D1 ('YYYY-MM-DD HH:MM:SS', UTC) cae dentro de la ventana. */
function isWithinDays(createdAt: string, days: number): boolean {
  const created = new Date(`${createdAt.replace(' ', 'T')}Z`).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= days * 24 * 60 * 60 * 1000;
}

function LatestDropsRail({ config }: { config: CatalogDropsConfig }) {
  const { data, error } = useProducts({ page: 1 });
  const windowDays = config.windowDays ?? NEW_WINDOW_DAYS_DEFAULT;
  const products = error ? [] : data?.items.slice(0, config.limit ?? RAIL_LIMIT_DEFAULT);

  return (
    <ProductRail
      eyebrow="Recién llegado"
      title={config.title ?? 'Últimos drops'}
      products={products}
      renderBadge={(product) =>
        isWithinDays(product.createdAt, windowDays) ? <Badge variant="sky">Nuevo</Badge> : null
      }
    />
  );
}

function BestSellersRail({ config }: { config: CatalogBestSellersConfig }) {
  const { data, error } = useBestSellers({ days: config.days, limit: config.limit });
  return (
    <ProductRail
      eyebrow="Los favoritos"
      title={config.title ?? 'Más comprados'}
      products={error ? [] : data}
    />
  );
}

function LowStockRail({ config }: { config: CatalogLowStockConfig }) {
  const { data, error } = useLowStock({ threshold: config.threshold, limit: config.limit });
  return (
    <ProductRail
      eyebrow="Corre que vuelan"
      title={config.title ?? 'Se están acabando'}
      products={error ? [] : data}
      renderBadge={() => <Badge variant="destructive">¡Últimas unidades!</Badge>}
    />
  );
}
