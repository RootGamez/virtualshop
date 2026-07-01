import { useState, type FormEvent } from 'react';
import type { CreateVariantInput, ProductVariant } from '@jaw/shared';
import { useVariants } from '../../hooks/useCmsData';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import { toastSuccess } from '../../store/toastStore';
import { TextField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { TableSkeleton } from '../ui/Skeleton';

/** Stock por talla+color (spec §5, corazón del inventario). */
export function VariantManager({ productId }: { productId: number }) {
  const { data: variants, loading, refetch } = useVariants(productId);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState(0);

  const { mutate: create, loading: creating } = useMutation((input: CreateVariantInput) =>
    api.post(`/products/${productId}/variants`, input),
  );
  const { mutate: updateStock } = useMutation((id: number, newStock: number) =>
    api.patch(`/variants/${id}`, { stock: newStock }),
  );
  const { mutate: remove } = useMutation((id: number) => api.delete(`/variants/${id}`));

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!size.trim() || !color.trim()) return;
    const result = await create({ size: size.trim(), color: color.trim(), stock });
    if (result !== undefined) {
      toastSuccess('Variante agregada');
      setSize('');
      setColor('');
      setStock(0);
      refetch();
    }
  }

  async function handleStockChange(variant: ProductVariant, newStock: number) {
    const result = await updateStock(variant.id, newStock);
    if (result !== undefined) refetch();
  }

  async function handleRemove(id: number) {
    if (!window.confirm('¿Eliminar esta variante?')) return;
    const result = await remove(id);
    if (result !== undefined) {
      toastSuccess('Variante eliminada');
      refetch();
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-text">Tallas, colores y stock</h2>

      {loading ? (
        <div className="mt-3">
          <TableSkeleton rows={3} />
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {variants?.map((variant) => (
            <li
              key={variant.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
            >
              <span className="text-sm text-text">
                {variant.size} · {variant.color}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  aria-label={`Stock de ${variant.size} ${variant.color}`}
                  defaultValue={variant.stock}
                  onBlur={(e) => handleStockChange(variant, Number(e.target.value))}
                  className="w-20 rounded-lg border border-border px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(variant.id)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
          {variants?.length === 0 && <p className="text-sm text-text-muted">Sin variantes todavía.</p>}
        </ul>
      )}

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-end gap-3">
        <TextField label="Talla" value={size} onChange={(e) => setSize(e.target.value)} className="w-24" />
        <TextField label="Color" value={color} onChange={(e) => setColor(e.target.value)} className="w-32" />
        <TextField
          label="Stock"
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          className="w-20"
        />
        <Button type="submit" loading={creating}>
          Agregar
        </Button>
      </form>
    </div>
  );
}
