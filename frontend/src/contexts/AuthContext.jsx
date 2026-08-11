import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  borrarSesion,
  guardarSesion,
  leerToken,
  leerUsuario,
} from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => leerUsuario());
  const [token, setToken] = useState(() => leerToken());
  const [cargando, setCargando] = useState(Boolean(leerToken()));

  useEffect(() => {
    let activo = true;

    if (!token) {
      setCargando(false);
      return undefined;
    }

    api('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        const perfil = response.data?.usuario || response.usuario;
        if (activo) {
          setUsuario(perfil);
          guardarSesion(token, perfil);
        }
      })
      .catch(() => {
        if (activo) {
          borrarSesion();
          setUsuario(null);
          setToken(null);
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => { activo = false; };
  }, [token]);

  async function iniciarSesion(email, password) {
    const response = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { token: nuevoToken, usuario: nuevoUsuario } = response.data;
    guardarSesion(nuevoToken, nuevoUsuario);
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    return nuevoUsuario;
  }

  async function registrar({ email, password, name }) {
    const response = await api('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    const { token: nuevoToken, usuario: nuevoUsuario } = response.data;
    guardarSesion(nuevoToken, nuevoUsuario);
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    return nuevoUsuario;
  }

  function cerrarSesion() {
    borrarSesion();
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        cargando,
        iniciarSesion,
        registrar,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);