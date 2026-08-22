import { Button, Card, Col, Form, Input, Row, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { vaciar } from '../store/carritoSlice';
import { useAuth } from '../contexts/AuthContext';

export default function Checkout() {
  const items = useSelector((state) => state.carrito);
  const dispatch = useDispatch();
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

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

      const total = items.reduce(
        (sum, item) => sum + item.price * item.cantidad,
        0,
      );

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
        `*Total: $${total.toFixed(2)}*`,
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

        <Button htmlType="submit" type="primary" block>
          Confirmar pedido
        </Button>
      </Form>
    </Card>
  );
}
