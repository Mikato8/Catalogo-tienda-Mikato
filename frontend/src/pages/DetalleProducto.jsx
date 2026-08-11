import { Button, Card, Empty } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { agregar } from '../store/carritoSlice';
import { useProductos } from './useProductos';

export default function DetalleProducto() {
  const { id } = useParams();
  const { items } = useProductos();
  const dispatch = useDispatch();
  const item = items.find((producto) => producto.id === id);

  if (!item) {
    return <Empty description="Producto no encontrado" />;
  }

  return (
    <Card
      className="detail"
      cover={<img alt={item.name} src={item.image_url} />}
    >
      <h1>{item.name}</h1>
      <p>{item.description}</p>
      <h2>${Number(item.price).toFixed(2)}</h2>
      <Button
        type="primary"
        onClick={() => dispatch(agregar({
          ...item,
          price: Number(item.price),
        }))}
      >
        Agregar al carrito
      </Button>
    </Card>
  );
}
