import { consultar, pool } from '../config/db.js';

const ESTADOS_VALIDOS = new Set([
  'pendiente',
  'confirmado',
  'en_produccion',
  'enviado',
  'entregado',
  'cancelado',
]);

async function costoEnvio(metodo) {
  const rows = await consultar(
    `select shipping_local_cost, shipping_paqueteria_cost
     from public.site_settings where id = 1`,
  );
  const s = rows[0] || { shipping_local_cost: 0, shipping_paqueteria_cost: 0 };

  if (metodo === 'Envío local') return Number(s.shipping_local_cost || 0);
  if (metodo === 'Envío por paquetería') return Number(s.shipping_paqueteria_cost || 0);
  return 0;
}

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
    payment_method: paymentMethod = null,
    payment_status: paymentStatus = 'pendiente',
    shipping_method: shippingMethod = null,
  } = req.body;

  const ESTADOS_PAGO = new Set(['pendiente', 'realizado']);
  const estadoPago = ESTADOS_PAGO.has(paymentStatus) ? paymentStatus : 'pendiente';
  const shippingCost = await costoEnvio(shippingMethod);

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

  const totalConEnvio = total + shippingCost;

  const client = await pool.connect();

  try {
    await client.query('begin');

    const { rows: orderRows } = await client.query(
      `insert into public.orders
        (user_id, total, status, shipping_address, customer_name, street, street_number, colonia, city, state, postal_code, email, phone, payment_method, payment_status, shipping_method, shipping_status, shipping_cost)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) returning *`,
      [
        req.user.id,
        totalConEnvio,
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
        paymentMethod,
        estadoPago,
        shippingMethod,
        'pendiente',
        shippingCost,
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

const CAMPOS_EDITABLES = [
  'customer_name',
  'street',
  'street_number',
  'colonia',
  'city',
  'state',
  'postal_code',
  'email',
  'phone',
  'payment_method',
  'shipping_method',
];

export async function actualizarPedido(req, res) {
  const [order] = await consultar(
    'select * from public.orders where id = $1 and user_id = $2',
    [req.params.id, req.user.id],
  );

  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  if (!['pendiente', 'confirmado'].includes(order.status)) {
    return res.status(400).json({ error: 'Solo se pueden editar pedidos pendientes o confirmados.' });
  }

  const nuevo = { ...order };
  CAMPOS_EDITABLES.forEach((campo) => {
    if (req.body[campo] !== undefined) {
      nuevo[campo] = req.body[campo];
    }
  });

  nuevo.shipping_address = [
    nuevo.customer_name,
    [nuevo.street, nuevo.street_number].filter(Boolean).join(' '),
    nuevo.colonia,
    [nuevo.city, nuevo.state, nuevo.postal_code].filter(Boolean).join(', '),
    nuevo.email ? `Correo: ${nuevo.email}` : null,
    nuevo.phone ? `Celular: ${nuevo.phone}` : null,
  ].filter((parte) => parte && String(parte).trim())
    .join('\n');

  nuevo.shipping_cost = await costoEnvio(nuevo.shipping_method);

  const [subtotalRow] = await consultar(
    'select coalesce(sum(quantity * unit_price), 0)::numeric as subtotal from public.order_items where order_id = $1',
    [req.params.id],
  );
  nuevo.total = Number(subtotalRow.subtotal) + nuevo.shipping_cost;

  const cambios = [];
  const valores = [];
  let contador = 1;

  [...CAMPOS_EDITABLES, 'shipping_address', 'shipping_cost', 'total'].forEach((campo) => {
    cambios.push(`${campo} = $${contador++}`);
    valores.push(nuevo[campo]);
  });

  const { rows } = await pool.query(
    `update public.orders set ${cambios.join(', ')}, updated_at = now() where id = $${contador} returning *`,
    [...valores, req.params.id],
  );

  res.json({ data: rows[0] });
}

export async function eliminarPedido(req, res) {
  const [order] = await consultar(
    'select id, status from public.orders where id = $1 and user_id = $2',
    [req.params.id, req.user.id],
  );

  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  if (!['pendiente', 'confirmado'].includes(order.status)) {
    return res.status(400).json({ error: 'Solo se pueden eliminar pedidos pendientes o confirmados.' });
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    const { rows: items } = await client.query(
      'select product_id, quantity from public.order_items where order_id = $1',
      [req.params.id],
    );

    for (const item of items) {
      if (item.product_id) {
        await client.query(
          'update public.products set stock = stock + $1 where id = $2',
          [item.quantity, item.product_id],
        );
      }
    }

    await client.query('delete from public.orders where id = $1', [req.params.id]);
    await client.query('commit');
    return res.status(204).end();
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

const ESTADOS_PAGO_VALIDOS = new Set(['pendiente', 'realizado']);
const ESTADOS_ENVIO_VALIDOS = new Set(['pendiente', 'enviado']);

export async function actualizarPago(req, res) {
  const { payment_status: paymentStatus, payment_method: paymentMethod } = req.body;

  if (paymentStatus === undefined && paymentMethod === undefined) {
    return res.status(400).json({ error: 'No hay cambios para aplicar.' });
  }

  if (paymentStatus !== undefined && !ESTADOS_PAGO_VALIDOS.has(paymentStatus)) {
    return res.status(400).json({ error: 'Estado de pago inválido.' });
  }

  const cambios = [];
  const valores = [];
  let contador = 1;

  if (paymentStatus !== undefined) {
    cambios.push(`payment_status = $${contador++}`);
    valores.push(paymentStatus);
  }

  if (paymentMethod !== undefined) {
    cambios.push(`payment_method = $${contador++}`);
    valores.push(paymentMethod || null);
  }

  const { rows } = await pool.query(
    `update public.orders set ${cambios.join(', ')}, updated_at = now() where id = $${contador} returning *`,
    [...valores, req.params.id],
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  res.json({ data: rows[0] });
}

export async function actualizarEnvio(req, res) {
  const {
    shipping_status: shippingStatus,
    shipping_method: shippingMethod,
    shipping_cost: shippingCost,
  } = req.body;

  if (shippingStatus === undefined && shippingMethod === undefined && shippingCost === undefined) {
    return res.status(400).json({ error: 'No hay cambios para aplicar.' });
  }

  if (shippingStatus !== undefined && !ESTADOS_ENVIO_VALIDOS.has(shippingStatus)) {
    return res.status(400).json({ error: 'Estado de envío inválido.' });
  }

  const cambios = [];
  const valores = [];
  let contador = 1;

  if (shippingStatus !== undefined) {
    cambios.push(`shipping_status = $${contador++}`);
    valores.push(shippingStatus);
  }

  if (shippingMethod !== undefined) {
    cambios.push(`shipping_method = $${contador++}`);
    valores.push(shippingMethod || null);
  }

  if (shippingCost !== undefined || shippingMethod !== undefined) {
    let costo;
    if (shippingCost !== undefined) {
      costo = Number(shippingCost);
      if (!Number.isFinite(costo) || costo < 0) {
        return res.status(400).json({ error: 'Costo de envío inválido.' });
      }
    } else {
      costo = await costoEnvio(shippingMethod);
    }

    const [subtotalRow] = await consultar(
      'select coalesce(sum(quantity * unit_price), 0)::numeric as subtotal from public.order_items where order_id = $1',
      [req.params.id],
    );

    cambios.push(`shipping_cost = $${contador++}`);
    valores.push(costo);
    cambios.push(`total = $${contador++}`);
    valores.push(Number(subtotalRow.subtotal) + costo);
  }

  const { rows } = await pool.query(
    `update public.orders set ${cambios.join(', ')}, updated_at = now() where id = $${contador} returning *`,
    [...valores, req.params.id],
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  res.json({ data: rows[0] });
}