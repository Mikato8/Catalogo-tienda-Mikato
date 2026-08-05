import { Alert, Layout } from 'antd';
import { Route, Routes } from 'react-router-dom';
import Navegacion from './components/Navegacion';
import { RequireAdmin, RequireAuth } from './components/Proteccion';
import { configurado } from './lib/supabase';
import Acceso from './pages/Acceso';
import AdminLayout from './pages/admin/AdminLayout';
import Carrito from './pages/Carrito';
import Catalogo from './pages/Catalogo';
import Checkout from './pages/Checkout';
import DetalleProducto from './pages/DetalleProducto';
import MisPedidos from './pages/MisPedidos';
import Tracking from './pages/Tracking';

const { Content, Footer } = Layout;

export default function App() {
  const admin = configurado ? (
    <RequireAuth>
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    </RequireAuth>
  ) : (
    <AdminLayout demo />
  );

  return (
    <Layout>
      <Navegacion />
      {!configurado && (
        <Content className="content">
          <Alert
            className="config"
            type="warning"
            showIcon
            message="Modo demostración"
            description="Configura Supabase para activar autenticación, pedidos persistentes y almacenamiento de imágenes."
          />
        </Content>
      )}
      <Content className="content">
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route
            path="/checkout"
            element={(
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            )}
          />
          <Route path="/login" element={<Acceso />} />
          <Route path="/registro" element={<Acceso registro />} />
          <Route
            path="/pedidos"
            element={(
              <RequireAuth>
                <MisPedidos />
              </RequireAuth>
            )}
          />
          <Route
            path="/pedidos/:id"
            element={(
              <RequireAuth>
                <Tracking />
              </RequireAuth>
            )}
          />
          <Route path="/admin" element={admin} />
        </Routes>
      </Content>
      <Footer>
        Mikato © {new Date().getFullYear()} · Comercio con intención
      </Footer>
    </Layout>
  );
}
