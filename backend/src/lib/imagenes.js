import { Jimp } from 'jimp';
import { pool } from '../config/db.js';

const ANCHO_MINIMO = 120;
const ANCHO_MAXIMO = 1600;
const CALIDAD_JPEG = 82;

let tablaLista = null;

// La tabla de variantes se crea sola en el primer uso: no hay migración que correr
// a mano y si el proceso se reinicia, la promesa se reintenta.
function asegurarTabla() {
  if (!tablaLista) {
    tablaLista = pool.query(`
      create table if not exists public.image_variants (
        image_id uuid not null references public.images(id) on delete cascade,
        width integer not null,
        mime_type text not null,
        data bytea not null,
        size integer not null,
        created_at timestamptz not null default now(),
        primary key (image_id, width)
      )
    `).catch((error) => {
      tablaLista = null;
      throw error;
    });
  }
  return tablaLista;
}

export function anchoSolicitado(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  const ancho = Number.parseInt(valor, 10);
  if (!Number.isFinite(ancho)) return null;
  if (ancho < ANCHO_MINIMO || ancho > ANCHO_MAXIMO) return null;
  return ancho;
}

// Devuelve la variante ya guardada o la genera una sola vez desde la imagen original.
// Si el original mide menos que el ancho pedido, no se escala hacia arriba.
export async function varianteDeImagen(imageId, ancho) {
  await asegurarTabla();

  const guardada = await pool.query(
    'select data, mime_type from public.image_variants where image_id = $1 and width = $2',
    [imageId, ancho],
  );
  if (guardada.rows.length) {
    return guardada.rows[0];
  }

  const original = await pool.query('select data from public.images where id = $1', [imageId]);
  if (!original.rows.length) return null;

  const imagen = await Jimp.read(Buffer.from(original.rows[0].data));
  if (imagen.bitmap.width > ancho) {
    const alto = Math.round((ancho * imagen.bitmap.height) / imagen.bitmap.width);
    imagen.scaleToFit({ w: ancho, h: alto });
  }
  const data = await imagen.getBuffer('image/jpeg', { quality: CALIDAD_JPEG });

  await pool.query(
    `insert into public.image_variants (image_id, width, mime_type, data, size)
     values ($1, $2, $3, $4, $5)
     on conflict (image_id, width) do nothing`,
    [imageId, ancho, 'image/jpeg', data, data.length],
  );

  return { data, mime_type: 'image/jpeg' };
}
