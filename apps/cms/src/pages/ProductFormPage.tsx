import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { CreateProductInput, ProductDetail } from '@virtualshop/shared';
import { useCategories, useProductDetail } from '../hooks/useCmsData';
import { useMutation } from '../hooks/useMutation';
import { api } from '../lib/api';
import { slugify } from '../lib/slug';
import type { DiscountEntryMode } from '../lib/discountPreview';
import { toastSuccess } from '../store/toastStore';
import { TextField, TextAreaField, SelectField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { DiscountFields } from '../components/products/DiscountFields';
import { VariantManager } from '../components/products/VariantManager';
import { MediaManager } from '../components/products/MediaManager';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined && id !== 'nuevo';
  const navigate = useNavigate();

  const { data: categories } = useCategories();
  const { data: existing, loading: loadingExisting, error, refetch } = useProductDetail(
    isEditing ? id : undefined,
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [price, setPrice] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [discountMode, setDiscountMode] = useState<DiscountEntryMode>('none');
  const [discountValue, setDiscountValue] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setDescription(existing.description);
    setCategoryId(existing.categoryId);
    setPrice(existing.price);
    setIsActive(existing.isActive);
    if (existing.discountType === 'percent') {
      setDiscountMode('percent');
      setDiscountValue(existing.discountValue ?? undefined);
    } else if (existing.discountType === 'fixed') {
      setDiscountMode('finalPrice');
      setDiscountValue(existing.finalPrice);
    } else {
      setDiscountMode('none');
      setDiscountValue(undefined);
    }
  }, [existing]);

  const { mutate: save, loading: saving } = useMutation(
    async (input: CreateProductInput): Promise<ProductDetail | { id: number }> => {
      if (isEditing) {
        return api.patch(`/products/${id}`, input);
      }
      return api.post('/products', input);
    },
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId || !name.trim()) return;

    const input: CreateProductInput = {
      categoryId,
      name: name.trim(),
      description: description.trim(),
      slug: existing?.slug ?? slugify(name),
      price,
      isActive,
      discountType: discountMode === 'none' ? null : 'percent',
      discountValue:
        discountMode === 'none'
          ? null
          : discountMode === 'percent'
            ? discountValue
            : // finalPrice mode: convertir a % antes de mandar, la API espera percent/fixed normalizado.
              discountValue != null && price > 0
              ? Math.round(((price - discountValue) / price) * 10000) / 100
              : null,
    };

    const result = await save(input);
    if (result !== undefined) {
      toastSuccess(isEditing ? 'Producto actualizado' : 'Producto creado');
      if (!isEditing && 'id' in result) {
        navigate(`/productos/${result.id}`, { replace: true });
      } else {
        refetch();
      }
    }
  }

  if (isEditing && loadingExisting) {
    return <Skeleton className="h-64 w-full max-w-2xl" />;
  }
  if (isEditing && error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-text">
        {isEditing ? `Editar: ${existing?.name ?? ''}` : 'Nuevo producto'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <TextField label="Nombre" required value={name} onChange={(e) => setName(e.target.value)} />
        <TextAreaField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <SelectField
          label="Categoría"
          required
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(Number(e.target.value))}
        >
          <option value="" disabled>
            Seleccioná una categoría
          </option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Precio ($)"
          type="number"
          min={0}
          step="0.01"
          required
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />

        <DiscountFields
          price={price}
          mode={discountMode}
          value={discountValue}
          onModeChange={setDiscountMode}
          onValueChange={setDiscountValue}
        />

        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Producto activo (visible en el catálogo)
        </label>

        <Button type="submit" loading={saving} className="self-start">
          {isEditing ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </form>

      {isEditing && existing && (
        <div className="mt-10 flex flex-col gap-8 border-t border-border pt-8">
          <VariantManager productId={existing.id} />
          <MediaManager productId={existing.id} media={existing.media} onChange={refetch} />
        </div>
      )}
      {!isEditing && (
        <p className="mt-6 text-sm text-text-muted">
          Guardá el producto primero para poder agregar variantes e imágenes.
        </p>
      )}
    </div>
  );
}
