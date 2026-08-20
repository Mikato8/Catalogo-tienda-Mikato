import { Alert, Tabs } from 'antd';
import ProductosAdmin from './ProductosAdmin';
import CategoriasAdmin from './CategoriasAdmin';
import PedidosAdmin from './PedidosAdmin';
import ConfiguracionAdmin from './ConfiguracionAdmin';

export default function AdminLayout({ demo = false }) {
  return (
    <>
      <Alert
        className="config"
        type={demo ? 'warning' : 'info'}
        showIcon
        message={demo ? 'Panel en modo demostración' : 'Panel de administración'}
        description={
          demo
            ? 'Los cambios se mantienen únicamente en esta sesión porque la base de datos no está configurada.'
            : 'Gestiona productos, categorías, pedidos y la apariencia del sitio.'
        }
      />
      <Tabs
        items={[
          {
            key: 'productos',
            label: 'Productos',
            children: <ProductosAdmin demo={demo} />,
          },
          {
            key: 'categorias',
            label: 'Categorías',
            children: <CategoriasAdmin demo={demo} />,
          },
          {
            key: 'pedidos',
            label: 'Pedidos y tracking',
            children: <PedidosAdmin demo={demo} />,
          },
          {
            key: 'configuracion',
            label: 'Configuración',
            children: <ConfiguracionAdmin />,
          },
        ]}
      />
    </>
  );
}
