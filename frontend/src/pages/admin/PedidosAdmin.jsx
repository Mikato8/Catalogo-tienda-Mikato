import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Modal,
  Select,
  Table,
  message,
} from 'antd';
import { api } from '../../services/api';
import { pedidosDemo } from '../../data/demo';
import { useAuth } from '../../contexts/AuthContext';
import TimelinePedido from '../../components/TimelinePedido';

const estados = [
  'pendiente',
  'confirmado',
  'en_produccion',
  'enviado',
  'entregado',
  'cancelado',
];

export default function PedidosAdmin({ demo = false }) {
  const [orders, setOrders] = useState(demo ? pedidosDemo : []);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const headers = useMemo(() => (
    token ? { Authorization: `Bearer ${token}` } : {}
  ), [token]);

  const cargar = useCallback(() => {
    if (!demo) {
      api('/admin/orders', { headers })
        .then((response) => setOrders(response.data || response))
        .catch(() => setOrders([]));
    }
  }, [demo, headers]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function cambiarEstado(order, status) {
    const entrada = {
      status,
      notes: demo
        ? 'Actualización de demostración'
        : `Estado cambiado a ${status}`,
      created_at: new Date().toISOString(),
    };

    if (demo) {
      setOrders((current) => current.map((item) => (
        item.id === order.id
          ? {
            ...item,
            status,
            order_tracking: [...(item.order_tracking || []), entrada],
          }
          : item
      )));
      setSelected((current) => current && {
        ...current,
        status,
        order_tracking: [...(current.order_tracking || []), entrada],
      });
      return;
    }

    setLoading(true);

    try {
      await api(`/orders/${order.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status, notes: entrada.notes }),
      });
      message.success('Estado actualizado y tracking registrado');
      cargar();
      setSelected((current) => current && {
        ...current,
        status,
        order_tracking: [...(current.order_tracking || []), entrada],
      });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function detalle(order) {
    return (
      <div className="order-detail">
        <Descriptions size="small" column={1} bordered>
          <Descriptions.Item label="Dirección">
            {order.shipping_address || 'No indicada'}
          </Descriptions.Item>
          <Descriptions.Item label="Productos">
            {(order.order_items || []).map((item) => (
              <div key={item.id}>
                {item.products?.name || `Producto ${item.product_id}`}
                {' × '}
                {item.quantity}
                {' — $'}
                {Number(item.unit_price).toFixed(2)}
              </div>
            ))}
          </Descriptions.Item>
        </Descriptions>
        <h3>Historial de tracking</h3>
        <TimelinePedido history={order.order_tracking || []} />
      </div>
    );
  }

  return (
    <Card title="Pedidos">
      <Table
        rowKey="id"
        loading={loading}
        dataSource={orders}
        expandable={{ expandedRowRender: detalle }}
        columns={[
          {
            title: 'Pedido',
            dataIndex: 'id',
            render: (value) => value.slice(0, 8),
          },
          {
            title: 'Fecha',
            dataIndex: 'created_at',
            render: (value) => new Date(value).toLocaleString('es-ES'),
          },
          {
            title: 'Total',
            dataIndex: 'total',
            render: (value) => `$${Number(value).toFixed(2)}`,
          },
          {
            title: 'Estado',
            dataIndex: 'status',
            render: (value, order) => (
              <Select
                value={value}
                style={{ minWidth: 150 }}
                onChange={(status) => cambiarEstado(order, status)}
                options={estados.map((item) => ({
                  value: item,
                  label: item,
                }))}
              />
            ),
          },
          {
            title: 'Detalle',
            render: (_, order) => (
              <Button onClick={() => setSelected(order)}>
                Ver tracking
              </Button>
            ),
          },
        ]}
      />
      <Modal
        open={Boolean(selected)}
        title={`Tracking del pedido ${selected?.id?.slice(0, 8)}`}
        footer={null}
        onCancel={() => setSelected(null)}
      >
        {selected && (
          <TimelinePedido history={selected.order_tracking || []} />
        )}
      </Modal>
    </Card>
  );
}
