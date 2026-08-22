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

const VALORES_INICIALES = {
  primary_color: '#006877',
  font_family: 'Inter',
  shipping_local_cost: 0,
  shipping_paqueteria_cost: 0,
};

export async function obtenerConfiguracion(_req, res) {
  const rows = await consultar(
    `select primary_color, font_family, shipping_local_cost, shipping_paqueteria_cost
     from public.site_settings where id = 1`,
  );

  res.json({ data: rows[0] || VALORES_INICIALES });
}

function validarCosto(valor, campo) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) {
    return { error: `${campo} debe ser un número mayor o igual a 0.` };
  }
  return { numero };
}

export async function actualizarConfiguracion(req, res) {
  const {
    primary_color: primaryColor,
    font_family: fontFamily,
    shipping_local_cost: shippingLocal,
    shipping_paqueteria_cost: shippingPaqueteria,
  } = req.body || {};

  const cambios = [];
  const valores = [];
  let contador = 1;

  if (primaryColor !== undefined) {
    if (typeof primaryColor !== 'string' || !COLOR_RE.test(primaryColor)) {
      return res.status(400).json({ error: 'Color primario inválido (formato #RRGGBB).' });
    }
    cambios.push(`primary_color = $${contador++}`);
    valores.push(primaryColor);
  }

  if (fontFamily !== undefined) {
    if (typeof fontFamily !== 'string' || !FUENTES_PERMITIDAS.has(fontFamily)) {
      return res.status(400).json({ error: 'Tipografía no permitida.' });
    }
    cambios.push(`font_family = $${contador++}`);
    valores.push(fontFamily);
  }

  if (shippingLocal !== undefined) {
    const { error, numero } = validarCosto(shippingLocal, 'Costo de envío local');
    if (error) return res.status(400).json({ error });
    cambios.push(`shipping_local_cost = $${contador++}`);
    valores.push(numero);
  }

  if (shippingPaqueteria !== undefined) {
    const { error, numero } = validarCosto(shippingPaqueteria, 'Costo de envío por paquetería');
    if (error) return res.status(400).json({ error });
    cambios.push(`shipping_paqueteria_cost = $${contador++}`);
    valores.push(numero);
  }

  if (!cambios.length) {
    return res.status(400).json({ error: 'No hay cambios para aplicar.' });
  }

  const { rows } = await pool.query(
    `insert into public.site_settings (id, ${cambios.map((c) => c.split(' = ')[0]).join(', ')})
     values (1, ${valores.map((_, i) => `$${i + 1}`).join(', ')})
     on conflict (id) do update
       set ${cambios.join(', ')},
           updated_at = now()
     returning primary_color, font_family, shipping_local_cost, shipping_paqueteria_cost`,
    valores,
  );

  res.json({ data: rows[0] });
}
