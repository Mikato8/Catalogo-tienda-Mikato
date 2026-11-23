import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';
import { anchoSolicitado, varianteDeImagen } from '../lib/imagenes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function subirImagen(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  const { rows } = await pool.query(
    `insert into public.images (data, mime_type, filename, size)
     values ($1, $2, $3, $4) returning id`,
    [req.file.buffer, req.file.mimetype, req.file.originalname, req.file.size],
  );

  const url = `/api/v1/images/${rows[0].id}`;
  res.status(201).json({ data: { url } });
}

export async function obtenerImagen(req, res) {
  // ?w=800 devuelve una variante redimensionada en JPEG (mucho más liviana que el
  // original en PNG). Sin ?w se conserva el comportamiento anterior.
  const ancho = anchoSolicitado(req.query.w);

  if (ancho) {
    try {
      const variante = await varianteDeImagen(req.params.id, ancho);
      if (variante) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        return res.type(variante.mime_type).send(variante.data);
      }
    } catch (error) {
      // Si la conversión falla se sirve el original: mejor pesado que roto.
      console.error('No se pudo generar la variante de imagen:', error.message);
    }
  }

  const { rows } = await pool.query(
    'select data, mime_type from public.images where id = $1',
    [req.params.id],
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Imagen no encontrada.' });
  }

  const { data, mime_type: mimeType } = rows[0];
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.type(mimeType).send(data);
}
