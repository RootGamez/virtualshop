import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Product } from '@jaw/shared';
import { useCategories, useProducts } from '../hooks/useCmsData';
import { useMutation } from '../hooks/useMutation';
import { api } from '../lib/api';
import { toastSuccess } from '../store/toastStore';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductAdminCard } from '../components/products/ProductAdminCard';

export function ProductsPage() {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { data: categories } = useCategories();
  const { data: result, loading, error, refetch } = useProducts({ categoryId, page });
  const { mutate: remove } = useMutation((id: number) => api.delete(`/products/${id}`));

  async function handleDelete(product: Product) {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(product.id);
    const res = await remove(product.id);
    setDeletingId(null);
    if (res !== undefined) {
      toastSuccess('Producto eliminado');
      refetch();
    }
  }

  const totalPages = result ? Math.ceil(result.total / result.pageSize) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Productos</h1>
          <p className="text-sm text-text-muted">Gestioná tu catálogo y su stock.</p>
        </div>
        <Button asChild variant="accent">
          <Link to="/productos/nuevo">
            <Plus className="size-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip label="Todas" active={categoryId === undefined} onClick={() => setCategoryId(undefined)} />
        {categories?.map((c) => (
          <FilterChip
            key={c.id}
            label={c.name}
            active={categoryId === c.id}
            onClick={() => setCategoryId(c.id)}
          />
        ))}
      </div>

      <div>
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={`skeleton-${i}`} className="aspect-[3/4] w-full rounded-xl2" />
            ))}
          </div>
        )}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && result && result.items.length === 0 && (
          <EmptyState title="No hay productos" description="Creá el primero con el botón de arriba." />
        )}
        {!loading && !error && result && result.items.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {result.items.map((product) => (
              <ProductAdminCard
                key={product.id}
                product={product}
                onDelete={handleDelete}
                deleting={deletingId === product.id}
              />
            ))}
          </div>
        )}

        {result && result.total > result.pageSize && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-text-muted">
              Página {result.page} de {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-bold font-display uppercase tracking-wide transition-all active:scale-95',
        active
          ? 'border-forest bg-primary text-primary-foreground shadow-sticker-lime'
          : 'border-border bg-surface text-text hover:border-forest'
      )}
    >
      {label}
    </button>
  );
}
