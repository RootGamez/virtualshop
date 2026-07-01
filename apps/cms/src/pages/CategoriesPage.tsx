import { useState, type FormEvent } from 'react';
import type { Category, CreateCategoryInput } from '@jaw/shared';
import { useCategories } from '../hooks/useCmsData';
import { useMutation } from '../hooks/useMutation';
import { api } from '../lib/api';
import { slugify } from '../lib/slug';
import { toastSuccess } from '../store/toastStore';
import { TextField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

export function CategoriesPage() {
  const { data: categories, loading, error, refetch } = useCategories();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);

  const { mutate: save, loading: saving } = useMutation(async (input: CreateCategoryInput, id?: number) => {
    if (id) await api.patch(`/categories/${id}`, input);
    else await api.post('/categories', input);
  });
  const { mutate: remove } = useMutation((id: number) => api.delete(`/categories/${id}`));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const input: CreateCategoryInput = { name: trimmed, slug: slugify(trimmed) };
    const result = await save(input, editing?.id);
    if (result !== undefined) {
      toastSuccess(editing ? 'Categoría actualizada' : 'Categoría creada');
      setName('');
      setEditing(null);
      refetch();
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar esta categoría? Esta acción no se puede deshacer.')) return;
    const result = await remove(id);
    if (result !== undefined) {
      toastSuccess('Categoría eliminada');
      refetch();
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-text">Categorías</h1>

      <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-3">
        <div className="flex-1">
          <TextField
            label={editing ? `Editando "${editing.name}"` : 'Nueva categoría'}
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button type="submit" loading={saving}>
          {editing ? 'Guardar' : 'Agregar'}
        </Button>
        {editing && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEditing(null);
              setName('');
            }}
          >
            Cancelar
          </Button>
        )}
      </form>

      <div className="mt-6">
        {loading && <TableSkeleton />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && categories && categories.length === 0 && (
          <EmptyState title="Todavía no hay categorías" description="Agregá la primera arriba." />
        )}
        {!loading && !error && categories && categories.length > 0 && (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-text">{category.name}</p>
                  <p className="text-xs text-text-muted">/{category.slug}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(category);
                      setName(category.name);
                    }}
                    className="text-sm font-medium text-text hover:text-primary"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
