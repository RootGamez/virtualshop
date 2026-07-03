import { Hono } from 'hono';
import { createUserSchema, updateUserSchema } from '@jaw/shared';
import type { AppEnv } from '../env';
import type { UserRow } from '../db/rows';
import { mapUser } from '../db/rows';
import { requireAuth, requireRole } from '../middleware/auth';
import { hashPassword } from '../lib/password';
import { conflict, forbidden, notFound } from '../lib/http-error';
import { parseBody } from '../lib/validate';

// Toda esta sección es solo-owner (spec §6: "el owner administra a los otros usuarios").
export const userRoutes = new Hono<AppEnv>();
userRoutes.use('*', requireAuth, requireRole('owner'));

userRoutes.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM users ORDER BY created_at ASC').all<
    UserRow
  >();
  return c.json(results.map(mapUser));
});

userRoutes.post('/', async (c) => {
  const body = await parseBody(c, createUserSchema);

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(body.email.toLowerCase())
    .first();
  if (existing) throw conflict('Ya existe un usuario con ese email');

  const passwordHash = await hashPassword(body.password);
  const result = await c.env.DB.prepare(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?) RETURNING *',
  )
    .bind(body.email.toLowerCase(), passwordHash, body.name, body.role)
    .first<UserRow>();
  return c.json(mapUser(result!), 201);
});

userRoutes.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const body = await parseBody(c, updateUserSchema);

  const current = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first<UserRow>();
  if (!current) throw notFound('Usuario no encontrado');

  const passwordHash = body.password ? await hashPassword(body.password) : current.password_hash;
  const updated = await c.env.DB.prepare(
    'UPDATE users SET name = ?, role = ?, password_hash = ? WHERE id = ? RETURNING *',
  )
    .bind(body.name ?? current.name, body.role ?? current.role, passwordHash, id)
    .first<UserRow>();
  return c.json(mapUser(updated!));
});

userRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const actingUser = c.get('user');
  if (actingUser.id === id) throw forbidden('No podés eliminar tu propio usuario');

  const result = await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  if (result.meta.changes === 0) throw notFound('Usuario no encontrado');
  return c.body(null, 204);
});
