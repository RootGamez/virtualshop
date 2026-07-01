interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div role="status" className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="text-lg font-medium text-text">{title}</p>
      {description && <p className="text-sm text-text-muted">{description}</p>}
    </div>
  );
}
