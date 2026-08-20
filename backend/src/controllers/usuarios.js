import bcrypt from 'bcryptjs';
import { consultar, pool } from '../config/db.js';

const ROLES = new Set(['admin', 'cliente']);

export async function listarUsuarios(_req, res) {
  const rows = await consultar(
    'select id, email, full_name, role, created_at from public.users order by created_at desc',
  );
  res.json({ data: rows });
}

export async function crearUsuario(req, res) {
  const { email, password, name, role } = req.body;

  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'El correo es obligatorio.' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  if (role !== undefined && !ROLES.has(role)) {
    return res.status(400).json({ error: 'Rol inválido.' });
  }

  const existe = await consultar(
    'select id from public.users where lower(email) = lower($1)',
    [email],
  );

  if (existe.length) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
  }

  const hash = await bcrypt.hash(password, 10);

  const [usuario] = await consultar(
    `insert into public.users (email, password_hash, full_name, role)
     values ($1, $2, $3, $4)
     returning id, email, full_name, role, created_at`,
    [email.trim(), hash, name?.trim() || null, role || 'cliente'],
  );

  res.status(201).json({ data: usuario });
}

export async function actualizarUsuario(req, res) {
  const { id } = req.params;
  const { name, role, password } = req.body;

  if (role !== undefined && !ROLES.has(role)) {
    return res.status(400).json({ error: 'Rol inválido.' });
  }

  const cambios = [];
  const valores = [];
  let contador = 1;

  if (name !== undefined) {
    cambios.push(`full_name = $${contador++}`);
    valores.push(name.trim() || null);
  }

  if (role !== undefined) {
    cambios.push(`role = $${contador++}`);
    valores.push(role);
  }

  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    cambios.push(`password_hash = $${contador++}`);
    valores.push(await bcrypt.hash(password, 10));
  }

  if (!cambios.length) {
    return res.status(400).json({ error: 'No hay cambios para aplicar.' });
  }

  valores.push(id);

  const { rows } = await pool.query(
    `update public.users set ${cambios.join(', ')} where id = $${contador}
     returning id, email, full_name, role, created_at`,
    valores,
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  res.json({ data: rows[0] });
}

export async function eliminarUsuario(req, res) {
  const { id } = req.params;

  if (id === req.user.id) {
    return res.status(400).json({ error: 'No podés eliminar tu propia cuenta.' });
  }

  const result = await pool.query('delete from public.users where id = $1', [id]);

  if (!result.rowCount) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  res.status(204).end();
}
