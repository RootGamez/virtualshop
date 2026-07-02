import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ImageIcon, Layers, PackagePlus } from 'lucide-react';
import type { CreateProductInput, ProductDetail } from '@jaw/shared';
import { useCategories, useProductDetail } from '../hooks/useCmsData';
import { useMutation } from '../hooks/useMutation';
import { api } from '../lib/api';
import { slugify } from '../lib/slug';
import { previewDiscount, type DiscountEntryMode } from '../lib/discountPreview';
import { toastSuccess } from '../store/toastStore';
import { TextField, TextAreaField, SelectField } from '../components/ui/FormField';
import { NumberField } from '../components/ui/NumberField';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DiscountFields } from '../components/products/DiscountFields';
import { VariantManager } from '../components/products/VariantManager';
import { MediaManager } from '../components/products/MediaManager';
import { StoreProductPreview } from '../components/products/StoreProductPreview';
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
  const [price, setPrice] = useState<number | null>(0);
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

  const effectivePrice = price ?? 0;
  const preview = useMemo(
    () => previewDiscount(effectivePrice, discountMode, discountValue),
    [effectivePrice, discountMode, discountValue],
  );
  const categoryName = categories?.find((c) => c.id === categoryId)?.name;
  const coverImageKey = existing?.coverImageKey ?? existing?.media?.[0]?.r2Key ?? null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId || !name.trim()) return;

    const input: CreateProductInput = {
      categoryId,
      name: name.trim(),
      description: description.trim(),
      slug: existing?.slug ?? slugify(name),
      price: effectivePrice,
      isActive,
      discountType: discountMode === 'none' ? null : 'percent',
      discountValue:
        discountMode === 'none'
          ? null
          : discountMode === 'percent'
            ? discountValue
            : // finalPrice mode: convertir a % antes de mandar, la API espera percent/fixed normalizado.
              discountValue != null && effectivePrice > 0
              ? Math.round(((effectivePrice - discountValue) / effectivePrice) * 10000) / 100
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
    return <Skeleton className="h-96 w-full max-w-5xl rounded-xl2" />;
  }
  if (isEditing && error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-1 text-sm text-text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Volver a productos
        </Link>
        <h1 className="font-display text-2xl font-bold text-text">
          {isEditing ? `Editar: ${existing?.name ?? ''}` : 'Nuevo producto'}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Columna izquierda: formulario */}
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Card>
              <CardHeader className="flex-row items-center gap-2">
                <PackagePlus className="size-5 text-primary" />
                <CardTitle>Información básica</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <TextField label="Nombre" required value={name} onChange={(e) => setName(e.target.value)} />
                <TextAreaField
                  label="Descripción"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
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
                  <NumberField
                    label="Precio"
                    required
                    min={0}
                    value={price}
                    onValueChange={setPrice}
                    prefix="$"
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            <DiscountFields
              price={effectivePrice}
              mode={discountMode}
              value={discountValue}
              onModeChange={setDiscountMode}
              onValueChange={setDiscountValue}
            />

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl2 border-2 border-border bg-surface p-4">
              <span className="flex flex-col">
                <span className="text-sm font-bold text-text">Producto activo</span>
                <span className="text-xs text-text-muted">Visible en el catálogo público.</span>
              </span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-5 accent-primary"
              />
            </label>

            <Button type="submit" loading={saving} className="self-start">
              {isEditing ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </form>

          {isEditing && existing && (
            <>
              <Card>
                <CardHeader className="flex-row items-center gap-2">
                  <Layers className="size-5 text-primary" />
                  <CardTitle>Variantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <VariantManager productId={existing.id} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center gap-2">
                  <ImageIcon className="size-5 text-primary" />
                  <CardTitle>Imágenes y video</CardTitle>
                </CardHeader>
                <CardContent>
                  <MediaManager productId={existing.id} media={existing.media} onChange={refetch} />
                </CardContent>
              </Card>
            </>
          )}
          {!isEditing && (
            <p className="text-sm text-text-muted">
              Guardá el producto primero para poder agregar variantes e imágenes.
            </p>
          )}
        </div>

        {/* Columna derecha: vista previa */}
        <aside className="h-fit lg:sticky lg:top-24">
          <StoreProductPreview
            name={name}
            description={description}
            price={effectivePrice}
            finalPrice={preview.finalPrice}
            discountValue={discountMode === 'none' ? null : preview.discountValue}
            categoryName={categoryName}
            coverImageKey={coverImageKey}
            isActive={isActive}
            variants={existing?.variants}
          />
        </aside>
      </div>
    </div>
  );
}
