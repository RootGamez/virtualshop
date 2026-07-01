import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories, useProducts } from '../hooks/useCmsData';
import { useMutation } from '../hooks/useMutation';
import { api } from '../lib/api';
import { toastSuccess } from '../store/toastStore';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

export function ProductsPage() {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { data: categories } = useCategories();
  const { data: result, loading, error, refetch } = useProducts({ categoryId, page });
  const { mutate: remove } = useMutation((id: number) => api.delete(`/products/${id}`));

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    const res = await remove(id);
    if (res !== undefined) {
      toastSuccess('Producto eliminado');
      refetch();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-text">Productos</h1>
        <Link to="/productos/nuevo">
          <Button type="button">+ Nuevo producto</Button>
        </Link>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto">
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

      <div className="mt-6">
        {loading && <TableSkeleton rows={6} />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && result && result.items.length === 0 && (
          <EmptyState title="No hay productos" description="Creá el primero con el botón de arriba." />
        )}
        {!loading && !error && result && result.items.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.items.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-medium text-text">{product.name}</td>
                    <td className="px-4 py-3 text-text">
                      {product.discountType ? (
                        <>
                          <span className="text-text-muted line-through">${product.price}</span>{' '}
                          <span className="font-semibold">${product.finalPrice}</span>
                        </>
                      ) : (
                        <span>${product.price}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          product.isActive
                            ? 'bg-success/20 text-success-foreground'
                            : 'bg-border text-text-muted'
                        }`}
                      >
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/productos/${product.id}`}
                        className="mr-3 text-sm font-medium text-text hover:text-primary"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result && result.total > result.pageSize && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-text-muted">
              Página {result.page} de {Math.ceil(result.total / result.pageSize)}
            </span>
            <Button
              variant="secondary"
              disabled={page >= Math.ceil(result.total / result.pageSize)}
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
      className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-text hover:border-primary'
      }`}
    >
      {label}
    </button>
  );
}
