import { Button, Card, Col, Form, Input, Row, Select, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { vaciar } from '../store/carritoSlice';
import { useAuth } from '../contexts/AuthContext';
import { METODOS_ENVIO, METODOS_PAGO, costoEnvio } from '../data/pagoEnvio';

export default function Checkout() {
  const items = useSelector((state) => state.carrito);
  const dispatch = useDispatch();
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const shippingMethod = Form.useWatch('shipping_method', form);
  const costoSeleccionado = costoEnvio(shippingMethod);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.cantidad,
    0,
  );
  const total = subtotal + costoSeleccionado;

  async function enviar(values) {
    try {
      await api('/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.cantidad,
            unit_price: item.price,
          })),
        }),
      });

      const costo = costoEnvio(values.shipping_method);
      const totalFinal = subtotal + costo;

      const lineas = [
        '*Nuevo pedido - Mikato*',
        `Cliente: ${values.customer_name}`,
        `Celular: ${values.phone}`,
        `Correo: ${values.email}`,
        `Dirección: ${values.street} ${values.street_number}, ${values.colonia}, ${values.city}, ${values.state} ${values.postal_code}`,
        '',
        '*Productos:*',
        ...items.map((item) => (
          `• ${item.name} x${item.cantidad} = $${(item.price * item.cantidad).toFixed(2)}`
        )),
        '',
        `Subtotal: $${subtotal.toFixed(2)}`,
        `Envío (${values.shipping_method}): $${costo.toFixed(2)}`,
        `Pago: ${values.payment_method || 'Sin método'}`,
        `*Total: $${totalFinal.toFixed(2)}*`,
      ];

      const url = `https://wa.me/523324333262?text=${encodeURIComponent(lineas.join('\n'))}`;
      window.open(url, '_blank', 'noopener,noreferrer');

      dispatch(vaciar());
      message.success('Pedido creado correctamente');
      navigate('/pedidos');
    } catch (error) {
      message.error(error.message);
    }
  }

  return (
    <Card title="Finalizar pedido">
      <Form
        form={form}
        layout="vertical"
        onFinish={enviar}
        initialValues={{ email: usuario?.email }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="customer_name"
              label="Nombre completo"
              rules={[{ required: true, message: 'Ingresá el nombre' }]}
            >
              <Input placeholder="Nombre y apellido" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Celular"
              rules={[{ required: true, message: 'Ingresá el celular' }]}
            >
              <Input placeholder="Ej. 33 1234 5678" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Correo electrónico"
              rules={[
                { required: true, message: 'Ingresá el correo' },
                { type: 'email', message: 'Correo inválido' },
              ]}
            >
              <Input placeholder="correo@ejemplo.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="colonia"
              label="Colonia"
              rules={[{ required: true, message: 'Ingresá la colonia' }]}
            >
              <Input placeholder="Colonia" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item
              name="street"
              label="Calle"
              rules={[{ required: true, message: 'Ingresá la calle' }]}
            >
              <Input placeholder="Calle" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="street_number"
              label="Número"
              rules={[{ required: true, message: 'Ingresá el número' }]}
            >
              <Input placeholder="Número" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="city"
              label="Ciudad"
              rules={[{ required: true, message: 'Ingresá la ciudad' }]}
            >
              <Input placeholder="Ciudad" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="state"
              label="Estado"
              rules={[{ required: true, message: 'Ingresá el estado' }]}
            >
              <Input placeholder="Estado" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="postal_code"
              label="Código postal"
              rules={[{ required: true, message: 'Ingresá el CP' }]}
            >
              <Input placeholder="C.P." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="payment_method"
              label="Método de pago"
              rules={[{ required: true, message: 'Seleccioná el método de pago' }]}
            >
              <Select
                placeholder="Método de pago"
                options={METODOS_PAGO.map((item) => ({ value: item, label: item }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="shipping_method"
              label="Método de envío"
              rules={[{ required: true, message: 'Seleccioná el método de envío' }]}
            >
              <Select
                placeholder="Método de envío"
                options={METODOS_ENVIO.map((item) => ({
                  value: item.value,
                  label: item.costo > 0 ? `${item.label} (+$${item.costo})` : item.label,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Envío: ${costoSeleccionado.toFixed(2)}</p>
          <h2>Total: ${total.toFixed(2)}</h2>
        </div>

        <Button htmlType="submit" type="primary" block>
          Confirmar pedido
        </Button>
      </Form>
    </Card>
  );
}
