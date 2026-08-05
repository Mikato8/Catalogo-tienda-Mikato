import { supabase } from '../config/supabase.js';

export async function verificarJWT(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !supabase) {
      return res.status(401).json({
        error: 'Se requiere una sesión válida.',
      });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: 'Token inválido o expirado.',
      });
    }

    req.user = data.user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export async function exigirAdmin(req, res, next) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (data?.role !== 'admin') {
      return res.status(403).json({
        error: 'Se requieren permisos de administrador.',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
