import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Category } from '@jaw/shared';
import { BRAND } from '@jaw/shared';
import { useCatalogSections, useCategories, useProducts } from '../hooks/useCatalogData';
import { CategoryFilter } from '../components/catalog/CategoryFilter';
import { CategoryBanner } from '../components/catalog/CategoryBanner';
import { CatalogSection } from '../components/catalog/CatalogSection';
import { MerchRails } from '../components/catalog/MerchRails';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { Pagination } from '../components/catalog/Pagination';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton, ProductCardSkeleton } from '../components/ui/Skeleton';
import { usePageMeta } from '../lib/seo';
import { PaintSplat } from '../components/ui/PaintDecor';

/**
 * Catálogo público. Dos modos según ?categoria={slug}:
 * - Sin filtro: secciones apiladas por categoría (banner animado + muestra).
 * - Con filtro: banner de la categoría + grid completo paginado.
 * La URL es la fuente de verdad del filtro (los links de la landing y los
 * "Ver todo" de cada sección entran por acá).
 */
export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const slug = searchParams.get('categoria');

  const { data: categories } = useCategories();
  const activeCategory = slug ? categories?.find((c) => c.slug === slug) : undefined;

  usePageMeta(
    activeCategory ? activeCategory.name : 'Catálogo',
    `Explora todas las piezas importadas de ${BRAND.name}.`,
  );

  function handleCategoryChange(categoryId: number | undefined) {
    const target = categoryId ? categories?.find((c) => c.id === categoryId) : undefined;
    setSearchParams(target ? { categoria: target.slug } : {});
  }

  return (
    <>
      {/* Cabecera oscura del catálogo — continúa el look del header */}
      <div className="texture-grain relative overflow-hidden bg-forest px-4 py-12 sm:px-6">
        <PaintSplat aria-hidden="true" className="absolute -right-14 -top-16 w-56 rotate-12 text-lime/25" />
        <div className="relative z-[2] mx-auto max-w-6xl">
          <h1 className="font-display text-4xl font-bold uppercase leading-none text-bone sm:text-6xl">
            Catá<span className="text-lime">logo</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-bone/70 sm:text-base">
            Todo importado, todo original. Pide cualquier pieza por WhatsApp.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <CategoryFilter
          categories={categories}
          activeCategoryId={activeCategory?.id}
          onChange={handleCategoryChange}
        />

        <div className="mt-6">
          {activeCategory ? (
            // key: al cambiar de categoría se remonta y la paginación vuelve a 1
            <FilteredCatalog key={activeCategory.id} category={activeCategory} />
          ) : (
            <div className="flex flex-col gap-12">
              {/* Rails de merchandising (drops / más comprados / stock bajo) */}
              <MerchRails />
              <SectionedCatalog />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/** Modo secciones: todas las categorías con banner + muestra de productos. */
function SectionedCatalog() {
  const { data: sections, loading, error } = useCatalogSections();

  if (error) return <ErrorState message={error} />;
  if (loading) {
    return (
      <div className="flex flex-col gap-12">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={`section-skeleton-${i}`} className="flex flex-col gap-4">
            <Skeleton className="aspect-[5/2] w-full rounded-xl2 sm:aspect-[3/1]" />
            <div className="scrollbar-none flex gap-4 overflow-x-hidden">
              {Array.from({ length: 4 }, (_, j) => (
                <div key={`card-skeleton-${j}`} className="w-40 shrink-0 sm:w-52">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!sections || sections.length === 0) {
    return (
      <EmptyState
        title="No encontramos productos"
        description="Proba con otra categoria o busqueda."
      />
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {sections.map((section, index) => (
        <CatalogSection key={section.category.id} section={section} index={index} />
      ))}
    </div>
  );
}

/** Modo filtrado: banner de la categoría activa + grid completo paginado. */
function FilteredCatalog({ category }: { category: Category }) {
  const [page, setPage] = useState(1);
  const { data: result, loading, error } = useProducts({ categoryId: category.id, page });

  return (
    <div className="flex flex-col gap-6">
      <CategoryBanner category={category} />
      {error ? (
        <ErrorState message={error} />
      ) : (
        <div>
          <ProductGrid products={result?.items} loading={loading} />
          {result && (
            <Pagination
              page={result.page}
              pageSize={result.pageSize}
              total={result.total}
              onChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
