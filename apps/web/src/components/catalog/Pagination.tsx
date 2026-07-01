interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginación de catálogo" className="mt-8 flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text disabled:opacity-40"
      >
        Anterior
      </button>
      <span className="text-sm text-text-muted">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text disabled:opacity-40"
      >
        Siguiente
      </button>
    </nav>
  );
}
