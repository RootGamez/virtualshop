import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/seo';

export function NotFoundPage() {
  usePageMeta('Página no encontrada');

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-text">404</h1>
      <p className="text-text-muted">No encontramos esta página.</p>
      <Link to="/" className="text-sm font-medium text-primary hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
