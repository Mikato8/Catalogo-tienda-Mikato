const TOKEN_KEY = 'mikato-token';
const USUARIO_KEY = 'mikato-usuario';

// La app siempre está "configurada": la base de datos y la auth ahora viven en
// el backend. El modo demostración se activa solo si el backend/la BD fallan.
export const configurado = true;

export function guardarSesion(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function leerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function leerUsuario() {
  const raw = localStorage.getItem(USUARIO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function borrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}