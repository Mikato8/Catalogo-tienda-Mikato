import { Link, Route, Routes } from 'react-router-dom';
import Navegacion from './components/Navegacion';
import { RequireAdmin, RequireAuth } from './components/Proteccion';
import Acceso from './pages/Acceso';
import Arena from './pages/Arena';
import AdminLayout from './pages/admin/AdminLayout';
import Carrito from './pages/Carrito';
import Catalogo from './pages/Catalogo';
import Checkout from './pages/Checkout';
import DetalleProducto from './pages/DetalleProducto';
import MisPedidos from './pages/MisPedidos';
export default function App() {
  const admin = (
    <RequireAuth>
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    </RequireAuth>
  );

  return (
    <div className="app t-tienda">
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
          <Route path="/arena" element={<Arena />} />
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
          <Route path="/admin" element={admin} />
        </Routes>
      </main>
      <footer className="t-pie">
        <div className="t-contenedor">
          <div className="t-pie__grid">
            <div>
              <img alt="Mikato" src="/logo.png" height="26" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, lineHeight: '21px', color: 'var(--t-tinta-2)', maxWidth: '34ch', margin: 0 }}>
                Estética canina profesional, arena para gatos y NEART PETS. Fabricado en Guadalajara, Jalisco.
              </p>
              <a
                className="t-btn t-btn--wa t-btn--chico"
                style={{ marginTop: 16 }}
                href="https://wa.me/523324333262?text=Hola%20Mikato%2C%20quiero%20informaci%C3%B3n"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp 33 2433 3262
              </a>
            </div>
            <div>
              <h3>Tienda</h3>
              <ul>
                <li><Link to="/?cat=Shampoo">Shampoo</Link></li>
                <li><Link to="/?cat=Acondicionador">Acondicionador</Link></li>
                <li><Link to="/?cat=Desenredante">Desenredante</Link></li>
                <li><Link to="/?cat=Perfume">Perfume</Link></li>
              </ul>
            </div>
            <div>
              <h3>Ayuda</h3>
              <ul>
                <li><Link to="/pedidos">Mis pedidos</Link></li>
                <li><Link to="/carrito">Carrito</Link></li>
                <li>
                  <a href="https://mikatoestilistascaninos.com" target="_blank" rel="noreferrer">
                    CRM para estéticas caninas
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/523324333262?text=Hola%20Mikato" target="_blank" rel="noreferrer">
                    Atención por WhatsApp
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3>Contacto</h3>
              <ul>
                <li>Guadalajara, Jalisco</li>
                <li>
                  <a href="https://wa.me/523324333262?text=Hola%20Mikato" target="_blank" rel="noreferrer">
                    33 2433 3262
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="t-pie__legal">
            <span>Mikato © {new Date().getFullYear()} · Precios en pesos mexicanos</span>
            <span>Fabricado en Guadalajara, Jalisco</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
