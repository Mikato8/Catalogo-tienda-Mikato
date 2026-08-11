import { useEffect, useState } from 'react';
import { Card, Empty } from 'antd';
import { useParams } from 'react-router-dom';
import TimelinePedido from '../components/TimelinePedido';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Tracking() {
  const { id } = useParams();
  const [history, setHistory] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    api(`/tracking/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => setHistory(response.data || response))
      .catch(() => setHistory([]));
  }, [id, token]);

  return (
    <Card title="Seguimiento del pedido">
      {Array.isArray(history)
        ? <TimelinePedido history={history} />
        : <Empty description="Cargando seguimiento..." />}
    </Card>
  );
}
