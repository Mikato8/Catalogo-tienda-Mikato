// Las imágenes viven en /api/v1/images/:id y el backend genera variantes con ?w=.
// El original puede pesar 1.8 MB; la variante de 400 px ronda los 25 KB.

export function conAncho(url, ancho) {
  if (!url || typeof url !== 'string') return url;
  if (!url.startsWith('/api/v1/images/')) return url;
  return `${url}?w=${ancho}`;
}

export function srcSetImagen(url, anchos = [400, 800]) {
  if (!url || typeof url !== 'string') return undefined;
  if (!url.startsWith('/api/v1/images/')) return undefined;
  return anchos.map((ancho) => `${url}?w=${ancho} ${ancho}w`).join(', ');
}
