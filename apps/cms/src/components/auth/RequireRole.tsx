import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { Role } from '@jaw/shared';
import { useSessionStore } from '../../store/sessionStore';

/** Solo-owner (spec §6): usado para /usuarios. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const user = useSessionStore((s) => s.user);

  if (!user || user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
