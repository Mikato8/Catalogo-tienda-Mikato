import { useEffect, useState } from 'react';
import { Card, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function MisPedidos() {
  const [orders, setOrders] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    api('/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => setOrders(response.data || response))
      .catch(() => {});
  }, [token]);

  return (
    <Card title="Mis pedidos">
      <Table
        rowKey="id"
        dataSource={orders}
        columns={[
          {
            title: 'Fecha',
            dataIndex: 'created_at',
            render: (value) => new Date(value).toLocaleDateString('es-ES'),
          },
          {
            title: 'Total',
            dataIndex: 'total',
            render: (value) => `$${Number(value).toFixed(2)}`,
          },
          {
            title: 'Estado',
            dataIndex: 'status',
            render: (value) => <Tag color="blue">{value}</Tag>,
          },
          {
            title: '',
            render: (_, order) => (
              <Link to={`/pedidos/${order.id}`}>Ver tracking</Link>
            ),
          },
        ]}
      />
    </Card>
  );
}
