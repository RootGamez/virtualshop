import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { ReportTable } from '../components/reports/ReportTable';
import { TextField } from '../components/ui/FormField';

interface OrderClickRow {
  productId: number;
  name: string;
  clicks: number;
  [key: string]: unknown;
}
interface MostViewedRow {
  productId: number;
  name: string;
  views: number;
  [key: string]: unknown;
}
interface LowStockRow {
  productId: number;
  name: string;
  size: string;
  color: string;
  stock: number;
  [key: string]: unknown;
}
interface ByCategoryRow {
  categoryId: number;
  [key: string]: unknown;
  name: string;
  total: number;
}

/** Los 4 reportes de spec §8, filtrables por rango de fecha donde aplica. */
export function ReportsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const dateQuery = `${from ? `from=${from}&` : ''}${to ? `to=${to}` : ''}`;

  const orderClicks = useAsync<OrderClickRow[]>(
    () => api.get(`/reports/order-clicks?${dateQuery}`),
    [dateQuery],
  );
  const mostViewed = useAsync<MostViewedRow[]>(
    () => api.get(`/reports/most-viewed?${dateQuery}`),
    [dateQuery],
  );
  const lowStock = useAsync<LowStockRow[]>(() => api.get('/reports/low-stock'), []);
  const byCategory = useAsync<ByCategoryRow[]>(() => api.get('/reports/by-category'), []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-text">Reportes</h1>
        <div className="mt-3 flex flex-wrap gap-3">
          <TextField label="Desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <TextField label="Hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <p className="self-end text-xs text-text-muted">Aplica a clics y vistas.</p>
        </div>
      </div>

      <ReportTable
        title="Clics en 'Pedir'"
        rows={orderClicks.data}
        loading={orderClicks.loading}
        columns={[
          { key: 'name', label: 'Producto' },
          { key: 'clicks', label: 'Clics' },
        ]}
      />

      <ReportTable
        title="Mas vistos"
        rows={mostViewed.data}
        loading={mostViewed.loading}
        columns={[
          { key: 'name', label: 'Producto' },
          { key: 'views', label: 'Vistas' },
        ]}
      />

      <ReportTable
        title="Stock bajo / agotado"
        rows={lowStock.data}
        loading={lowStock.loading}
        columns={[
          { key: 'name', label: 'Producto' },
          { key: 'size', label: 'Talla' },
          { key: 'color', label: 'Color' },
          { key: 'stock', label: 'Stock' },
        ]}
      />

      <ReportTable
        title="Productos por categoria"
        rows={byCategory.data}
        loading={byCategory.loading}
        columns={[
          { key: 'name', label: 'Categoria' },
          { key: 'total', label: 'Total' },
        ]}
      />
    </div>
  );
}
