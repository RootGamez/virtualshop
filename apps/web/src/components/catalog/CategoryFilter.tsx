import type { Category } from '@virtualshop/shared';

interface CategoryFilterProps {
  categories: Category[] | undefined;
  activeCategoryId: number | undefined;
  onChange: (categoryId: number | undefined) => void;
}

export function CategoryFilter({ categories, activeCategoryId, onChange }: CategoryFilterProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Filtrar por categoría"
      className="scrollbar-none flex gap-2 overflow-x-auto pb-2"
    >
      <FilterChip label="Todas" active={activeCategoryId === undefined} onClick={() => onChange(undefined)} />
      {categories.map((category) => (
        <FilterChip
          key={category.id}
          label={category.name}
          active={activeCategoryId === category.id}
          onClick={() => onChange(category.id)}
        />
      ))}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-text hover:border-primary hover:text-primary'
      }`}
    >
      {label}
    </button>
  );
}
