import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function RequireAuth({ children }) {
  const { session, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <p>Cargando sesión...</p>;
  }

  return session
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />;
}

export function RequireAdmin({ children }) {
  const { usuario } = useAuth();
  const [rol, setRol] = useState(null);

  useEffect(() => {
    if (usuario && supabase) {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', usuario.id)
        .single()
        .then(({ data }) => setRol(data?.role));
    }
  }, [usuario]);

  if (rol === null) {
    return <p>Validando permisos...</p>;
  }

  return rol === 'admin' ? children : <Navigate to="/" replace />;
}
