import { useCatalogStore } from '../store/catalogStore';
import { useCategories, useProducts } from '../hooks/useCatalogData';
import { CategoryFilter } from '../components/catalog/CategoryFilter';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { Pagination } from '../components/catalog/Pagination';
import { ErrorState } from '../components/ui/ErrorState';
import { usePageMeta } from '../lib/seo';

export function CatalogPage() {
  usePageMeta('Catálogo', 'Explorá todos nuestros productos.');

  const { categoryId, page, setCategory, setPage } = useCatalogStore();
  const { data: categories } = useCategories();
  const {
    data: result,
    loading,
    error,
  } = useProducts({ categoryId, page });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-text">Catálogo</h1>

      <div className="mt-4">
        <CategoryFilter categories={categories} activeCategoryId={categoryId} onChange={setCategory} />
      </div>

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
  );
}
