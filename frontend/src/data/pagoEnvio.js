export const METODOS_PAGO = [
  'Mercado Pago - Tarjeta de crédito',
  'Mercado Pago - Débito',
  'Transferencia bancaria',
  'Efectivo',
];

export const METODOS_ENVIO = [
  'Envío a domicilio - Estafeta Terrestre',
  'Envío a domicilio - DHL',
  'Recoger en tienda',
];

export const ESTADOS_PAGO = [
  { value: 'pendiente', label: 'Pendiente', color: 'orange' },
  { value: 'recibido', label: 'Recibido', color: 'green' },
  { value: 'rechazado', label: 'Rechazado', color: 'red' },
];

export function etiquetaEstadoPago(value) {
  return ESTADOS_PAGO.find((item) => item.value === value) || {
    value,
    label: value,
    color: 'default',
  };
}
