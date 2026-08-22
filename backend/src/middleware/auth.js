import jwt from 'jsonwebtoken';
import { consultar } from '../config/db.js';
import { env } from '../config/env.js';

export function verificarJWT(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Se requiere una sesión válida.' });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

export async function exigirAdmin(req, res, next) {
  try {
    const rows = await consultar(
      'select id from public.users where id = $1 and role = $2',
      [req.user.id, 'admin'],
    );

    if (!rows.length) {
      return res.status(403).json({ error: 'Se requieren permisos de administrador.' });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}