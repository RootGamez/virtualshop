import type { Category } from '@jaw/shared';
import { Button } from '../ui/button';

interface CategoryFilterProps {
  categories: Category[] | undefined;
  activeCategoryId: number | undefined;
  onChange: (categoryId: number | undefined) => void;
}

export function CategoryFilter({ categories, activeCategoryId, onChange }: CategoryFilterProps) {
  if (!categories || categories.length === 0) return null;
  return (
    <div role="group" aria-label="Filtrar por categoría" className="scrollbar-none flex gap-2 overflow-x-auto pb-2">
      <FilterChip label="Todas" active={activeCategoryId === undefined} onClick={() => onChange(undefined)} />
      {categories.map((category) => (
        <FilterChip key={category.id} label={category.name} active={activeCategoryId === category.id} onClick={() => onChange(category.id)} />
      ))}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button type="button" size="sm" variant={active ? 'primary' : 'outline'} aria-pressed={active} onClick={onClick} className="shrink-0">
      {label}
    </Button>
  );
}
