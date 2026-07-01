import { NavLink } from 'react-router-dom';
import { BRAND } from '@virtualshop/shared';
import { useSessionStore } from '../../store/sessionStore';

const LINKS = [
  { to: '/', label: 'Productos', end: true },
  { to: '/categorias', label: 'Categorías', end: false },
  { to: '/landing', label: 'Landing', end: false },
  { to: '/whatsapp', label: 'WhatsApp', end: false },
  { to: '/reportes', label: 'Reportes', end: false },
];

export function Sidebar() {
  const user = useSessionStore((s) => s.user);
  const logout = useSessionStore((s) => s.logout);

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-surface-dark p-4 text-text-inverse">
      <p className="mb-6 text-lg font-bold">{BRAND.name} · Admin</p>
      <nav aria-label="Navegación de administración" className="flex flex-1 flex-col gap-1">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-text-inverse/80 hover:bg-white/10'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
        {user?.role === 'owner' && (
          <NavLink
            to="/usuarios"
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-text-inverse/80 hover:bg-white/10'
              }`
            }
          >
            Usuarios
          </NavLink>
        )}
      </nav>
      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="truncate text-xs text-text-inverse/60">{user?.email}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-2 text-sm font-medium text-text-inverse/80 hover:text-primary"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
