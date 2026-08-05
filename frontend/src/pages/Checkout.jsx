import { Button, Card, Form, Input, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { vaciar } from '../store/carritoSlice';
import { useAuth } from '../contexts/AuthContext';

export default function Checkout() {
  const items = useSelector((state) => state.carrito);
  const dispatch = useDispatch();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  async function enviar(values) {
    try {
      await api('/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
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
      dispatch(vaciar());
      message.success('Pedido creado correctamente');
      navigate('/pedidos');
    } catch (error) {
      message.error(error.message);
    }
  }

  return (
    <Card title="Finalizar pedido">
      <Form form={form} layout="vertical" onFinish={enviar}>
        <Form.Item
          name="shipping_address"
          label="Dirección de entrega"
          rules={[{ required: true }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Button htmlType="submit" type="primary">
          Confirmar pedido
        </Button>
      </Form>
    </Card>
  );
}
