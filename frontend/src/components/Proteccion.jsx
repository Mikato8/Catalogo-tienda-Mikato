import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RequireAuth({ children }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <p>Cargando sesión...</p>;
  }

  return usuario
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />;
}

export function RequireAdmin({ children }) {
  const { usuario } = useAuth();

  if (usuario?.role === undefined) {
    return <p>Validando permisos...</p>;
  }

  return usuario?.role === 'admin' ? children : <Navigate to="/" replace />;
}