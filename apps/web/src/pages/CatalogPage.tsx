import { useCatalogStore } from '../store/catalogStore';
import { useCategories, useProducts } from '../hooks/useCatalogData';
import { CategoryFilter } from '../components/catalog/CategoryFilter';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { Pagination } from '../components/catalog/Pagination';
import { ErrorState } from '../components/ui/ErrorState';
import { usePageMeta } from '../lib/seo';
import { PaintSplat } from '../components/ui/PaintDecor';
import { BRAND } from '@jaw/shared';

export function CatalogPage() {
  usePageMeta('Catálogo', `Explora todas las piezas importadas de ${BRAND.name}.`);

  const { categoryId, page, setCategory, setPage } = useCatalogStore();
  const { data: categories } = useCategories();
  const {
    data: result,
    loading,
    error,
  } = useProducts({ categoryId, page });

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
        <CategoryFilter categories={categories} activeCategoryId={categoryId} onChange={setCategory} />

        <div className="mt-6">
          {error ? (
            <ErrorState message={error} />
          ) : (
            <>
              <ProductGrid products={result?.items} loading={loading} />
              {result && (
                <Pagination
                  page={result.page}
                  pageSize={result.pageSize}
                  total={result.total}
                  onChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
