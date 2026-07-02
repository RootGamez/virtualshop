import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { CreateVariantInput, ProductVariant } from '@jaw/shared';
import { useVariants } from '../../hooks/useCmsData';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import { toastSuccess } from '../../store/toastStore';
import { TextField } from '../ui/FormField';
import { NumberField } from '../ui/NumberField';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { TableSkeleton } from '../ui/Skeleton';
import { SizePicker } from './SizePicker';

/** Stock por talla+color (spec §5, corazón del inventario). */
export function VariantManager({ productId }: { productId: number }) {
  const { data: variants, loading, refetch } = useVariants(productId);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState<number | null>(null);

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
    const result = await create({ size: size.trim(), color: color.trim(), stock: stock ?? 0 });
    if (result !== undefined) {
      toastSuccess('Variante agregada');
      setSize('');
      setColor('');
      setStock(null);
      refetch();
    }
  }

  async function handleStockChange(variant: ProductVariant, newStock: number | null) {
    const next = newStock ?? 0;
    if (next === variant.stock) return;
    const result = await updateStock(variant.id, next);
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
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-lg font-bold text-text">Tallas, colores y stock</h2>

      {loading ? (
        <TableSkeleton rows={3} />
      ) : (
        <ul className="flex flex-col gap-2">
          {variants?.map((variant) => (
            <li
              key={variant.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-border bg-surface px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline">{variant.size}</Badge>
                <span className="text-sm font-medium text-text">{variant.color}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24">
                  <NumberField
                    label="Stock"
                    className="py-1.5"
                    min={0}
                    value={variant.stock}
                    onValueChange={() => {}}
                    onCommit={(v) => handleStockChange(variant, v)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(variant.id)}
                  aria-label={`Eliminar ${variant.size} ${variant.color}`}
                  className="mt-4 text-text-muted transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
          {variants?.length === 0 && (
            <p className="text-sm text-text-muted">Sin variantes todavía.</p>
          )}
        </ul>
      )}

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-4 rounded-xl2 border-2 border-dashed border-border bg-surface/50 p-4"
      >
        <p className="text-xs font-bold font-display uppercase tracking-wide text-text-muted">
          Agregar variante
        </p>
        <SizePicker value={size} onChange={setSize} />
        <div className="flex flex-wrap items-end gap-3">
          <TextField
            label="Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-40"
          />
          <div className="w-28">
            <NumberField
              label="Stock"
              min={0}
              value={stock}
              onValueChange={setStock}
              placeholder="0"
            />
          </div>
          <Button type="submit" loading={creating} disabled={!size.trim() || !color.trim()}>
            Agregar
          </Button>
        </div>
      </form>
    </div>
  );
}
