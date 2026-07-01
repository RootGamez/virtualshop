import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-muted text-text-muted">
        <PackageOpen className="size-8" />
      </span>
      <p className="font-display text-xl font-bold text-text">{title}</p>
      {description && <p className="text-sm text-text-muted">{description}</p>}
    </div>
  );
}
