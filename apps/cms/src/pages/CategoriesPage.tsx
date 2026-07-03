import { useState, type FormEvent } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import type { Category, CreateCategoryInput } from '@jaw/shared';
import { useCategories } from '../hooks/useCmsData';
import { useMutation } from '../hooks/useMutation';
import { api } from '../lib/api';
import { slugify } from '../lib/slug';
import { toastSuccess } from '../store/toastStore';
import { CategoryBannerControl } from '../components/categories/CategoryBannerControl';
import { TextField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
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
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Categorías</h1>
        <p className="text-sm text-text-muted">Organizá tu catálogo por secciones.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
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
              <X className="size-4" />
              Cancelar
            </Button>
          )}
        </form>
      </Card>

      <div>
        {loading && <TableSkeleton />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && categories && categories.length === 0 && (
          <EmptyState title="Todavía no hay categorías" description="Agregá la primera arriba." />
        )}
        {!loading && !error && categories && categories.length > 0 && (
          <ul className="flex flex-col gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Card className="flex-row items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-semibold text-text">{category.name}</p>
                    <p className="text-xs text-text-muted">/{category.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CategoryBannerControl category={category} onChange={refetch} />
                    <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(category);
                        setName(category.name);
                      }}
                      aria-label={`Editar ${category.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDelete(category.id)}
                      aria-label={`Eliminar ${category.name}`}
                      className="rounded-lg p-2 text-text-muted transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
