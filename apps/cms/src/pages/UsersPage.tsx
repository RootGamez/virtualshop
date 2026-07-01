import { useState, type FormEvent } from 'react';
import type { Role } from '@jaw/shared';
import { useUsers } from '../hooks/useCmsData';
import { useMutation } from '../hooks/useMutation';
import { useSessionStore } from '../store/sessionStore';
import { api } from '../lib/api';
import { toastSuccess } from '../store/toastStore';
import { TextField, SelectField } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

/** Solo owner (spec §6): gestión de admins. */
export function UsersPage() {
  const { data: users, loading, error, refetch } = useUsers();
  const currentUser = useSessionStore((s) => s.user);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('admin');

  const { mutate: create, loading: creating } = useMutation(() =>
    api.post('/users', { email, name, password, role }),
  );
  const { mutate: remove } = useMutation((id: number) => api.delete(`/users/${id}`));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await create();
    if (result !== undefined) {
      toastSuccess('Usuario creado');
      setEmail('');
      setName('');
      setPassword('');
      setRole('admin');
      refetch();
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    const result = await remove(id);
    if (result !== undefined) {
      toastSuccess('Usuario eliminado');
      refetch();
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-text">Usuarios</h1>

      <div className="mt-6">
        {loading && <TableSkeleton />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && users && (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-text">
                    {user.name} · <span className="text-text-muted">{user.email}</span>
                  </p>
                  <p className="text-xs uppercase text-text-muted">{user.role}</p>
                </div>
                {user.id !== currentUser?.id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Eliminar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-text">Nuevo admin</h2>
        <TextField label="Nombre" required value={name} onChange={(e) => setName(e.target.value)} />
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Contraseña"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <SelectField label="Rol" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </SelectField>
        <Button type="submit" loading={creating} className="self-start">
          Crear usuario
        </Button>
      </form>
    </div>
  );
}
