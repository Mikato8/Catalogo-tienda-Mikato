import { useEffect, useState } from 'react';
import { Card } from 'antd';
import { useParams } from 'react-router-dom';
import TimelinePedido from '../components/TimelinePedido';
import { pedidosDemo } from '../data/demo';
import { configurado } from '../lib/supabase';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Tracking() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const { session } = useAuth();

  useEffect(() => {
    if (!configurado) {
      setHistory(pedidosDemo[0].order_tracking);
      return;
    }

    api(`/tracking/${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((response) => setHistory(response.data || response))
      .catch(() => {});
  }, [id, session]);

  return (
    <Card title="Seguimiento del pedido">
      <TimelinePedido history={history} />
    </Card>
  );
}
