import { consultar, pool } from '../config/db.js';

const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const FUENTES_PERMITIDAS = new Set([
  'Inter',
  'Manrope',
  'Poppins',
  'Roboto',
  'Montserrat',
  'Lora',
  'Open Sans',
  'Playfair Display',
]);

const VALORES_INICIALES = { primary_color: '#006877', font_family: 'Inter' };

export async function obtenerConfiguracion(_req, res) {
  const rows = await consultar(
    'select primary_color, font_family from public.site_settings where id = 1',
  );

  res.json({ data: rows[0] || VALORES_INICIALES });
}

export async function actualizarConfiguracion(req, res) {
  const { primary_color: primaryColor, font_family: fontFamily } = req.body || {};

  if (typeof primaryColor !== 'string' || !COLOR_RE.test(primaryColor)) {
    return res.status(400).json({ error: 'Color primario inválido (formato #RRGGBB).' });
  }

  if (typeof fontFamily !== 'string' || !FUENTES_PERMITIDAS.has(fontFamily)) {
    return res.status(400).json({ error: 'Tipografía no permitida.' });
  }

  const { rows } = await pool.query(
    `insert into public.site_settings (id, primary_color, font_family)
     values (1, $1, $2)
     on conflict (id) do update
       set primary_color = excluded.primary_color,
           font_family = excluded.font_family,
           updated_at = now()
     returning primary_color, font_family`,
    [primaryColor, fontFamily],
  );

  res.json({ data: rows[0] });
}
