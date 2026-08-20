import { Route, Routes } from 'react-router-dom';
import Navegacion from './components/Navegacion';
import { RequireAdmin, RequireAuth } from './components/Proteccion';
import Acceso from './pages/Acceso';
import AdminLayout from './pages/admin/AdminLayout';
import Carrito from './pages/Carrito';
import Catalogo from './pages/Catalogo';
import Checkout from './pages/Checkout';
import DetalleProducto from './pages/DetalleProducto';
import MisPedidos from './pages/MisPedidos';
import Tracking from './pages/Tracking';

export default function App() {
  const admin = (
    <RequireAuth>
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    </RequireAuth>
  );

  return (
    <div className="app">
      <Navegacion />
      <main className="main">
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
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <a className="footer-logo" href="/">
            <img alt="Mikato Logo" src="/logo.jpg" />
          </a>
          <p>
            Mikato © {new Date().getFullYear()} · Comercio con intención
          </p>
        </div>
      </footer>
    </div>
  );
}
