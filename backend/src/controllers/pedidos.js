import { supabase } from '../config/supabase.js';

export async function listarPedidos(req, res) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  res.json({ data });
}

export async function listarPedidosAdmin(_req, res) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, sku)), order_tracking(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  res.json({ data });
}

export async function crearPedido(req, res) {
  const { items, shipping_address: shippingAddress } = req.body;

  if (!items?.length) {
    return res.status(400).json({
      error: 'El pedido debe incluir productos.',
    });
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.unit_price) * Number(item.quantity),
    0,
  );
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: req.user.id,
      total,
      shipping_address: shippingAddress,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  const { error: itemError } = await supabase
    .from('order_items')
    .insert(items.map((item) => ({
      ...item,
      order_id: order.id,
    })));

  if (itemError) {
    throw itemError;
  }

  await supabase
    .from('order_tracking')
    .insert({
      order_id: order.id,
      status: 'pendiente',
    });

  return res.status(201).json({ data: order });
}

export async function tracking(req, res) {
  const { data, error } = await supabase
    .from('order_tracking')
    .select('*')
    .eq('order_id', req.params.id)
    .order('created_at');

  if (error) {
    throw error;
  }

  res.json({ data });
}

export async function cambiarEstado(req, res) {
  const { status, notes } = req.body;
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase
    .from('order_tracking')
    .insert({
      order_id: req.params.id,
      status,
      notes,
    });

  res.json({ data });
}
