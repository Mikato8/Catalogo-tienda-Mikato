export const METODOS_PAGO = [
  'Mercado Pago - Tarjeta de crédito',
  'Mercado Pago - Débito',
  'Transferencia bancaria',
  'Efectivo',
];

export const METODOS_ENVIO = [
  { value: 'Recoger en tienda', label: 'Recoger en tienda' },
  { value: 'Envío local', label: 'Envío local' },
  { value: 'Envío por paquetería', label: 'Envío por paquetería' },
];

export const ESTADOS_PAGO = [
  { value: 'pendiente', label: 'Pendiente', color: 'orange' },
  { value: 'realizado', label: 'Realizado', color: 'green' },
];

export const ESTADOS_ENVIO = [
  { value: 'pendiente', label: 'Pendiente', color: 'orange' },
  { value: 'enviado', label: 'Enviado', color: 'green' },
];

export function etiquetaEstadoPago(value) {
  return ESTADOS_PAGO.find((item) => item.value === value) || {
    value,
    label: value,
    color: 'default',
  };
}

export function etiquetaEstadoEnvio(value) {
  return ESTADOS_ENVIO.find((item) => item.value === value) || {
    value,
    label: value,
    color: 'default',
  };
}

export function costoEnvioSegunSettings(metodo, settings = {}) {
  if (metodo === 'Envío local') return Number(settings.shipping_local_cost || 0);
  if (metodo === 'Envío por paquetería') return Number(settings.shipping_paqueteria_cost || 0);
  return 0;
}
