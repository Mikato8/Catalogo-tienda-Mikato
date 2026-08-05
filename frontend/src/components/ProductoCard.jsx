import { Button, Card, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { agregar } from '../store/carritoSlice';

export default function ProductoCard({ item }) {
  const dispatch = useDispatch();

  return (
    <Card
      hoverable
      cover={<img alt={item.name} src={item.image_url} />}
      actions={[
        <Link key="detalle" to={`/producto/${item.id}`}>
          Ver detalle
        </Link>,
        <Button
          key="agregar"
          type="link"
          onClick={() => dispatch(agregar({
            ...item,
            price: Number(item.price),
          }))}
        >
          Agregar
        </Button>,
      ]}
    >
      <Card.Meta
        title={item.name}
        description={(
          <>
            <Tag>{item.categories?.name || 'General'}</Tag>
            <strong>${Number(item.price).toFixed(2)}</strong>
          </>
        )}
      />
    </Card>
  );
}
