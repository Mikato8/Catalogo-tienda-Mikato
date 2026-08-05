import { Timeline } from 'antd';

export default function TimelinePedido({ history = [] }) {
  return (
    <Timeline
      items={history.map((item) => ({
        color: 'green',
        children: (
          <>
            <strong>{item.status}</strong>
            <div>{item.notes}</div>
            <small>
              {new Date(item.created_at).toLocaleString('es-ES')}
            </small>
          </>
        ),
      }))}
    />
  );
}
