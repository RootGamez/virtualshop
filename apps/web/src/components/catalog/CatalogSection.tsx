import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { CategorySection } from '@jaw/shared';
import { CategoryBanner } from './CategoryBanner';
import { ProductCard } from './ProductCard';

interface CatalogSectionProps {
  section: CategorySection;
  /** Posición en la lista; rota el estilo del banner sin imagen. */
  index: number;
}

/**
 * Sección del catálogo: banner animado de la categoría + muestra de sus
 * productos en fila horizontal + enlace "Ver todo" que filtra por la
 * categoría (vía ?categoria={slug}).
 */
export function CatalogSection({ section, index }: CatalogSectionProps) {
  const { category, products } = section;
  const viewAllTo = `/catalogo?categoria=${category.slug}`;

  return (
    <section aria-label={category.name} className="flex flex-col gap-4">
      <Link to={viewAllTo} aria-label={`Ver todo en ${category.name}`}>
        <CategoryBanner category={category} index={index} />
      </Link>

      <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {products.map((product) => (
          <div key={product.id} className="w-40 shrink-0 sm:w-52">
            <ProductCard product={product} coverImageKey={product.coverImageKey ?? undefined} />
          </div>
        ))}
      </div>

      <div>
        <Link
          to={viewAllTo}
          className="inline-flex items-center gap-1 font-display text-sm font-bold uppercase tracking-wide text-forest underline-offset-4 hover:underline"
        >
          Ver todo en {category.name}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}
