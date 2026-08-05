export const productosDemo = [
  {
    id: '1',
    name: 'Taza Mikato',
    sku: 'TAZA-001',
    description: 'Cerámica artesanal hecha a mano.',
    price: 18,
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=700',
    categories: { name: 'Hogar' },
  },
  {
    id: '2',
    name: 'Vela calma',
    sku: 'VELA-001',
    description: 'Aroma suave para tus espacios.',
    price: 12,
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=700',
    categories: { name: 'Bienestar' },
  },
];

export const categoriasDemo = [
  {
    id: 'hogar',
    name: 'Hogar',
    slug: 'hogar',
    description: 'Piezas para espacios con personalidad',
    active: true,
  },
  {
    id: 'bienestar',
    name: 'Bienestar',
    slug: 'bienestar',
    description: 'Rituales cotidianos',
    active: true,
  },
];

export const pedidosDemo = [
  {
    id: 'demo-pedido-1',
    created_at: new Date().toISOString(),
    total: 30,
    status: 'en_produccion',
    shipping_address: 'Modo demostración',
    order_items: [
      {
        id: 'demo-item-1',
        quantity: 1,
        unit_price: 18,
        products: { name: 'Taza Mikato', sku: 'TAZA-001' },
      },
      {
        id: 'demo-item-2',
        quantity: 1,
        unit_price: 12,
        products: { name: 'Vela calma', sku: 'VELA-001' },
      },
    ],
    order_tracking: [
      {
        status: 'pendiente',
        created_at: new Date().toISOString(),
        notes: 'Pedido recibido',
      },
      {
        status: 'en_produccion',
        created_at: new Date().toISOString(),
        notes: 'Preparando productos',
      },
    ],
  },
];
