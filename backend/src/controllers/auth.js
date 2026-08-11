import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { consultar } from '../config/db.js';
import { env } from '../config/env.js';

function firmarToken(usuario) {
  return jwt.sign(
    {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

function publico(usuario) {
  return {
    id: usuario.id,
    email: usuario.email,
    full_name: usuario.full_name,
    role: usuario.role,
  };
}

export async function registrar(req, res) {
  const { email, password, name } = req.body;

  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'El correo es obligatorio.' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  const existe = await consultar(
    'select id from public.users where lower(email) = lower($1)',
    [email],
  );

  if (existe.length) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [usuario] = await consultar(
    'insert into public.users (email, password_hash, full_name) values ($1, $2, $3) returning id, email, full_name, role',
    [email, passwordHash, name || null],
  );

  const token = firmarToken(usuario);
  return res.status(201).json({ data: { token, usuario: publico(usuario) } });
}

export async function iniciarSesion(req, res) {
  const { email, password } = req.body;

  const [usuario] = await consultar(
    'select id, email, password_hash, full_name, role from public.users where lower(email) = lower($1)',
    [email || ''],
  );

  if (!usuario || !(await bcrypt.compare(password || '', usuario.password_hash))) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }

  const token = firmarToken(usuario);
  return res.json({ data: { token, usuario: publico(usuario) } });
}

export async function miPerfil(req, res) {
  const [usuario] = await consultar(
    'select id, email, full_name, role from public.users where id = $1',
    [req.user.id],
  );

  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  return res.json({ data: { usuario: publico(usuario) } });
}
