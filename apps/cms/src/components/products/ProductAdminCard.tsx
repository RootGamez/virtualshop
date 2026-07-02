import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import type { Product } from '@jaw/shared';
import { formatPrice, mediaUrl } from '../../lib/format';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/Button';

interface ProductAdminCardProps {
  product: Product;
  onDelete: (product: Product) => void;
  deleting?: boolean;
}

/**
 * Card de producto para el listado del CMS. Reusa la estética del catálogo
 * (apps/web ProductCard) pero con acciones de administración (editar/eliminar)
 * en lugar de un enlace a la tienda.
 */
export function ProductAdminCard({ product, onDelete, deleting }: ProductAdminCardProps) {
  const hasDiscount = product.discountType != null && product.finalPrice < product.price;

  return (
    <Card className="group border-forest/15 transition-all hover:border-forest hover:shadow-sticker-lime">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {product.coverImageKey ? (
          <img
            src={mediaUrl(product.coverImageKey)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="texture-halftone flex h-full w-full items-center justify-center text-text-muted">
            <span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold">Sin imagen</span>
          </div>
        )}
        {hasDiscount && (
          <Badge variant="accent" className="absolute left-2 top-2 -rotate-3">
            -{product.discountValue}%
          </Badge>
        )}
        <Badge
          variant={product.isActive ? 'success' : 'muted'}
          className="absolute right-2 top-2"
        >
          {product.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-text">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-xs text-text-muted line-through">{formatPrice(product.price)}</span>
          )}
          <span className="font-display text-lg font-bold text-forest">
            {formatPrice(product.finalPrice)}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Button asChild variant="secondary" size="sm" className="flex-1">
            <Link to={`/productos/${product.id}`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={deleting}
            onClick={() => onDelete(product)}
            aria-label={`Eliminar ${product.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
