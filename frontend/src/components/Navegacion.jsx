import { Badge, Button, Layout, Menu, Space } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';

const { Header } = Layout;

export default function Navegacion() {
  const { usuario, cerrarSesion } = useAuth();
  const cantidad = useSelector((state) => (
    state.carrito.reduce((total, item) => total + item.cantidad, 0)
  ));
  const mostrarAdmin = usuario?.role === 'admin';

  const items = [
    {
      key: 'catalogo',
      label: <Link to="/">Catálogo</Link>,
    },
    {
      key: 'pedidos',
      label: <Link to="/pedidos">Mis pedidos</Link>,
    },
  ];

  if (mostrarAdmin) {
    items.push({
      key: 'admin',
      label: <Link to="/admin">Administración</Link>,
    });
  }

  return (
    <Header className="header">
      <Link className="logo" to="/">MIKATO</Link>
      <Menu mode="horizontal" theme="dark" items={items} />
      <Space>
        <Link to="/carrito">
          <Badge count={cantidad} showZero>
            <Button>Carrito</Button>
          </Badge>
        </Link>
        {usuario ? (
          <Button onClick={cerrarSesion}>Salir</Button>
        ) : (
          <Link to="/login">
            <Button type="primary">Ingresar</Button>
          </Link>
        )}
      </Space>
    </Header>
  );
}