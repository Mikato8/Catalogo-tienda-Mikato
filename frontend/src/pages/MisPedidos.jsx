import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  etiquetaEstadoEnvio,
  etiquetaEstadoPago,
  METODOS_ENVIO,
  METODOS_PAGO,
} from '../data/pagoEnvio';

export default function MisPedidos() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { token } = useAuth();
  const headers = useMemo(() => (
    token ? { Authorization: `Bearer ${token}` } : {}
  ), [token]);

  const cargar = useCallback(() => {
    api('/orders', { headers })
      .then((response) => setOrders(response.data || response))
      .catch(() => setOrders([]));
  }, [headers]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function editar(order) {
    setEditing(order);
    form.setFieldsValue({
      customer_name: order.customer_name,
      phone: order.phone,
      email: order.email,
      street: order.street,
      street_number: order.street_number,
      colonia: order.colonia,
      city: order.city,
      state: order.state,
      postal_code: order.postal_code,
      payment_method: order.payment_method,
      shipping_method: order.shipping_method,
    });
  }

  async function guardar(values) {
    setLoading(true);
    try {
      await api(`/orders/${editing.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(values),
      });
      message.success('Pedido actualizado');
      setEditing(null);
      cargar();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function eliminar(order) {
    Modal.confirm({
      title: '¿Eliminar este pedido?',
      content: 'Se eliminará el pedido y se repondrá el stock de sus productos.',
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api(`/orders/${order.id}`, { method: 'DELETE', headers });
          message.success('Pedido eliminado');
          cargar();
        } catch (error) {
          message.error(error.message);
        }
      },
    });
  }

  const columns = [
    {
      title: 'Pedido',
      dataIndex: 'id',
      render: (value) => `#${String(value).slice(0, 8)}`,
    },
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      render: (value) => new Date(value).toLocaleString('es-ES'),
    },
    { title: 'Cliente', dataIndex: 'customer_name' },
    {
      title: 'Total',
      dataIndex: 'total',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      title: 'Productos',
      dataIndex: 'order_items',
      render: (items) => {
        const unidades = (items || []).reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0,
        );
        return `${unidades} unid.`;
      },
    },
    {
      title: 'Pago',
      render: (_, order) => {
        const estado = etiquetaEstadoPago(order.payment_status);
        return (
          <Space direction="vertical" size={0}>
            <Tag color={estado.color}>{estado.label}</Tag>
            <span>{order.payment_method || '—'}</span>
          </Space>
        );
      },
    },
    {
      title: 'Envío',
      render: (_, order) => {
        const estado = etiquetaEstadoEnvio(order.shipping_status);
        const costo = Number(order.shipping_cost || 0);
        return (
          <Space direction="vertical" size={0}>
            <Tag color={estado.color}>{estado.label}</Tag>
            <span>
              {order.shipping_method || '—'}
              {costo > 0 ? ` (+$${costo.toFixed(2)})` : ''}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Acciones',
      render: (_, order) => (
        <Space>
          <Button onClick={() => editar(order)}>Editar</Button>
          <Button danger onClick={() => eliminar(order)}>Eliminar</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Mis pedidos">
      <Table
        rowKey="id"
        dataSource={orders}
        columns={columns}
        scroll={{ x: true }}
      />
      <Modal
        open={Boolean(editing)}
        title="Editar pedido"
        footer={null}
        onCancel={() => setEditing(null)}
      >
        <Form form={form} layout="vertical" onFinish={guardar}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="customer_name" label="Nombre completo" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Celular" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label="Correo electrónico" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="street" label="Calle" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="street_number" label="Número" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="colonia" label="Colonia" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="city" label="Ciudad" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="state" label="Estado" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="postal_code" label="Código postal" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="payment_method" label="Método de pago">
                <Select options={METODOS_PAGO.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="shipping_method" label="Método de envío">
                <Select options={METODOS_ENVIO.map((item) => ({
                  value: item.value,
                  label: item.costo > 0 ? `${item.label} (+$${item.costo})` : item.label,
                }))} />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Guardar cambios
          </Button>
        </Form>
      </Modal>
    </Card>
  );
}
