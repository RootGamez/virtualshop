import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

/**
 * Mobile-first (spec §12): en pantallas chicas el sidebar se apila arriba en
 * vez de ocultarse detrás de un drawer, para evitar depender de gestos táctiles
 * complejos de probar en el flujo de trabajo desde celular (spec §14).
 * ToastContainer se monta una sola vez en App.tsx (fuera de AppShell, para
 * que también funcione en /login).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-8">{children}</main>
    </div>
  );
}
