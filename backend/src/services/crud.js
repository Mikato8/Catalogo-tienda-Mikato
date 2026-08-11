import { consultar } from '../config/db.js';

const CAMPOS_BASE = new Set([
  'id',
  'name',
  'sku',
  'description',
  'stock',
  'production_status',
  'production_cost',
  'price',
  'image_url',
  'category_id',
  'active',
  'slug',
]);

function asociar(payload) {
  const keys = Object.keys(payload).filter((key) => (
    payload[key] !== undefined && CAMPOS_BASE.has(key)
  ));

  const values = keys.map((key, index) => (
    payload[key] === null || payload[key] === ''
      ? null
      : payload[key]
  ));

  return {
    keys,
    values,
    placeholders: keys.map((_, index) => `$${index + 1}`),
  };
}

export async function listar(tabla, query = {}) {
  const clave = Object.keys(query)[0];
  const activos = Object.entries(query).filter(([key]) => key === 'active');

  let sql = `select * from public.${tabla}`;
  const params = [];

  if (clave && activos.length) {
    sql += ' where active = $1';
    params.push(Boolean(query.active));
  }

  sql += ' order by created_at desc';

  return consultar(sql, params);
}

export async function crear(tabla, payload) {
  const { keys, values, placeholders } = asociar(payload);
  const sql = `insert into public.${tabla} (${keys.join(', ')}) values (${placeholders.join(', ')}) returning *`;
  const rows = await consultar(sql, values);
  return rows[0];
}

export async function actualizar(tabla, id, payload) {
  const { keys, values } = asociar(payload);
  const asignaciones = keys.map((key, index) => `${key} = $${index + 1}`);

  if (!asignaciones.length) {
    const rows = await consultar(`select * from public.${tabla} where id = $1`, [id]);
    return rows[0];
  }

  const sql = `update public.${tabla} set ${asignaciones.join(', ')}, updated_at = now() where id = $${values.length + 1} returning *`;
  const rows = await consultar(sql, [...values, id]);
  return rows[0];
}

export async function eliminar(tabla, id) {
  await consultar(`delete from public.${tabla} where id = $1`, [id]);
}