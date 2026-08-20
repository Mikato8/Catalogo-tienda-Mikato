import { consultar, pool } from '../config/db.js';

const ESTADOS_VALIDOS = new Set([
  'pendiente',
  'confirmado',
  'en_produccion',
  'enviado',
  'entregado',
  'cancelado',
]);

export async function listarPedidos(req, res) {
  const orders = await consultar(
    'select * from public.orders where user_id = $1 order by created_at desc',
    [req.user.id],
  );

  if (!orders.length) {
    return res.json({ data: [] });
  }

  const ids = orders.map((o) => o.id);
  const items = await consultar(
    `select * from public.order_items where order_id = any($1::uuid[])`,
    [ids],
  );

  const porPedido = new Map();
  items.forEach((item) => {
    if (!porPedido.has(item.order_id)) porPedido.set(item.order_id, []);
    porPedido.get(item.order_id).push(item);
  });

  const data = orders.map((order) => ({
    ...order,
    order_items: porPedido.get(order.id) || [],
  }));

  res.json({ data });
}

export async function listarPedidosAdmin(_req, res) {
  const orders = await consultar('select * from public.orders order by created_at desc');

  if (!orders.length) {
    return res.json({ data: [] });
  }

  const ids = orders.map((o) => o.id);

  const [items, tracking] = await Promise.all([
    consultar(
      `select oi.*, json_build_object('name', p.name, 'sku', p.sku) as products
       from public.order_items oi
       left join public.products p on p.id = oi.product_id
       where oi.order_id = any($1::uuid[])`,
      [ids],
    ),
    consultar(
      'select * from public.order_tracking where order_id = any($1::uuid[]) order by created_at',
      [ids],
    ),
  ]);

  function agrupar(rows, porPedidoFinal) {
    rows.forEach((row) => {
      if (!porPedidoFinal.has(row.order_id)) porPedidoFinal.set(row.order_id, []);
      porPedidoFinal.get(row.order_id).push(row);
    });
  }

  const itemsPor = new Map();
  const trackPor = new Map();
  agrupar(items, itemsPor);
  agrupar(tracking, trackPor);

  const data = orders.map((order) => ({
    ...order,
    order_items: itemsPor.get(order.id) || [],
    order_tracking: trackPor.get(order.id) || [],
  }));

  res.json({ data });
}

export async function crearPedido(req, res) {
  const {
    items,
    customer_name: customerName,
    street,
    street_number: streetNumber,
    colonia,
    city,
    state,
    postal_code: postalCode,
    email,
    phone,
  } = req.body;

  if (!items?.length) {
    return res.status(400).json({ error: 'El pedido debe incluir productos.' });
  }

  const camposEnvio = {
    nombre: customerName,
    calle: street,
    número: streetNumber,
    colonia,
    ciudad: city,
    estado: state,
    'código postal': postalCode,
    'correo electrónico': email,
    celular: phone,
  };

  const faltantes = Object.entries(camposEnvio)
    .filter(([, valor]) => typeof valor !== 'string' || !valor.trim())
    .map(([clave]) => clave);

  if (faltantes.length) {
    return res.status(400).json({
      error: `Faltan datos de envío: ${faltantes.join(', ')}.`,
    });
  }

  const shippingAddress = [
    customerName.trim(),
    `${street.trim()} ${streetNumber.trim()}`,
    colonia.trim(),
    `${city.trim()}, ${state.trim()} ${postalCode.trim()}`,
    `Correo: ${email.trim()}`,
    `Celular: ${phone.trim()}`,
  ].join('\n');

  const cantidades = new Map();
  items.forEach((item) => {
    const cantidad = Number(item.quantity);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error(`Cantidad inválida para el producto ${item.product_id}.`);
    }
    cantidades.set(item.product_id, (cantidades.get(item.product_id) || 0) + cantidad);
  });

  const ids = [...cantidades.keys()];
  const productos = await consultar(
    'select id, price, stock from public.products where id = any($1::uuid[])',
    [ids],
  );

  const dispo = new Map(productos.map((p) => [p.id, p]));
  let total = 0;

  for (const [productoId, cantidad] of cantidades) {
    const producto = dispo.get(productoId);

    if (!producto) {
      return res.status(400).json({ error: `El producto ${productoId} no existe.` });
    }

    if (cantidad > producto.stock) {
      return res.status(400).json({ error: `Stock insuficiente para el producto ${productoId}.` });
    }

    total += Number(producto.price) * cantidad;
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    const { rows: orderRows } = await client.query(
      `insert into public.orders
        (user_id, total, status, shipping_address, customer_name, street, street_number, colonia, city, state, postal_code, email, phone)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning *`,
      [
        req.user.id,
        total,
        'pendiente',
        shippingAddress,
        customerName.trim(),
        street.trim(),
        streetNumber.trim(),
        colonia.trim(),
        city.trim(),
        state.trim(),
        postalCode.trim(),
        email.trim(),
        phone.trim(),
      ],
    );
    const order = orderRows[0];

    for (const [productoId, cantidad] of cantidades) {
      await client.query(
        `insert into public.order_items (order_id, product_id, quantity, unit_price)
         values ($1, $2, $3, $4)`,
        [order.id, productoId, cantidad, dispo.get(productoId).price],
      );

      await client.query(
        'update public.products set stock = stock - $1 where id = $2',
        [cantidad, productoId],
      );
    }

    await client.query(
      'insert into public.order_tracking (order_id, status) values ($1, $2)',
      [order.id, 'pendiente'],
    );

    await client.query('commit');
    return res.status(201).json({ data: order });
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function tracking(req, res) {
  const data = await consultar(
    'select * from public.order_tracking where order_id = $1 order by created_at',
    [req.params.id],
  );
  res.json({ data });
}

export async function cambiarEstado(req, res) {
  const { status, notes } = req.body;

  if (!ESTADOS_VALIDOS.has(status)) {
    return res.status(400).json({ error: 'Estado de pedido inválido.' });
  }

  const { rows: data } = await pool.query(
    'update public.orders set status = $1, updated_at = now() where id = $2 returning *',
    [status, req.params.id],
  );

  await pool.query(
    'insert into public.order_tracking (order_id, status, notes) values ($1, $2, $3)',
    [req.params.id, status, notes || null],
  );

  res.json({ data: data[0] });
}