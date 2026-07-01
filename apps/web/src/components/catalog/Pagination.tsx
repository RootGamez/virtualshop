import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

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
      <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        <ChevronLeft />
        Anterior
      </Button>
      <span className="font-display text-sm font-bold text-text-muted">{page} / {totalPages}</span>
      <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        Siguiente
        <ChevronRight />
      </Button>
    </nav>
  );
}
