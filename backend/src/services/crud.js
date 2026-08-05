import { supabase } from '../config/supabase.js';

export async function listar(tabla, query = {}) {
  if (!supabase) {
    const error = new Error('Supabase no configurado: no hay datos disponibles.');
    error.status = 503;
    throw error;
  }

  let request = supabase.from(tabla).select('*');

  Object.entries(query).forEach(([key, value]) => {
    request = request.eq(key, value);
  });

  const { data, error } = await request.order(
    'created_at',
    { ascending: false },
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function crear(tabla, payload) {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { data, error } = await supabase
    .from(tabla)
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function actualizar(tabla, id, payload) {
  const { data, error } = await supabase
    .from(tabla)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function eliminar(tabla, id) {
  const { error } = await supabase
    .from(tabla)
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}
