import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct, useWhatsappConfig } from '../hooks/useCatalogData';
import { MediaGallery } from '../components/product/MediaGallery';
import { VariantList } from '../components/product/VariantList';
import { PriceDisplay } from '../components/product/PriceDisplay';
import { OrderButton } from '../components/product/OrderButton';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { registerEvent } from '../lib/events';
import { usePageMeta } from '../lib/seo';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, loading, error } = useProduct(slug);
  const { data: whatsappConfig } = useWhatsappConfig();

  usePageMeta(product?.name ?? 'Producto', product?.description);

  useEffect(() => {
    if (product) registerEvent(product.id, 'view');
  }, [product]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Skeleton className="aspect-square w-full" />
      </div>
    );
  }

  if (error || !product) {
    return <ErrorState message={error ?? 'Producto no encontrado'} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/catalogo" className="text-sm text-text-muted hover:text-primary">
        ← Volver al catálogo
      </Link>

      <div className="mt-4 grid gap-8 sm:grid-cols-2">
        <MediaGallery media={product.media} productName={product.name} />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {product.category.name}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-text">{product.name}</h1>
          </div>

          <PriceDisplay product={product} />

          {product.description && <p className="text-sm text-text-muted">{product.description}</p>}

          <VariantList variants={product.variants} />

          <div className="mt-2">
            <OrderButton product={product} whatsappConfig={whatsappConfig} />
          </div>
        </div>
      </div>
    </div>
  );
}
