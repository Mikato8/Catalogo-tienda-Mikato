export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const esFormData = options.body instanceof FormData;

  if (options.body && !esFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'No fue posible completar la solicitud');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function subirImagen(archivo, token) {
  const form = new FormData();
  form.append('image', archivo);

  return api('/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
}
