import { Button, Card, Empty, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  actualizar,
  quitar,
  vaciar,
} from '../store/carritoSlice';

export default function Carrito() {
  const items = useSelector((state) => state.carrito);
  const dispatch = useDispatch();
  const total = items.reduce(
    (sum, item) => sum + item.price * item.cantidad,
    0,
  );

  if (!items.length) {
    return (
      <Card title="Tu carrito">
        <Empty description="Tu carrito está vacío" />
      </Card>
    );
  }

  return (
    <Card title="Tu carrito">
      {items.map((item) => (
        <div className="cart-row" key={item.id}>
          <span>{item.name}</span>
          <Input
            type="number"
            min={1}
            value={item.cantidad}
            onChange={(event) => dispatch(actualizar({
              id: item.id,
              cantidad: Number(event.target.value),
            }))}
          />
          <span>${(item.price * item.cantidad).toFixed(2)}</span>
          <Button danger onClick={() => dispatch(quitar(item.id))}>
            Quitar
          </Button>
        </div>
      ))}
      <h2>Total: ${total.toFixed(2)}</h2>
      <Link to="/checkout">
        <Button type="primary">Continuar al checkout</Button>
      </Link>
      <Button onClick={() => dispatch(vaciar())}>Vaciar</Button>
    </Card>
  );
}
