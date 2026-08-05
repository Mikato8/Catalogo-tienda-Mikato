export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'No fue posible completar la solicitud');
  }

  return response.json();
}
