import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';

export default function Navegacion() {
  const { usuario, cerrarSesion } = useAuth();
  const location = useLocation();
  const cantidad = useSelector((state) => (
    state.carrito.reduce((total, item) => total + item.cantidad, 0)
  ));

  const enlaceActivo = (ruta) => (
    location.pathname === ruta ? 'nav-link nav-link--active' : 'nav-link'
  );

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="nav-logo" to="/">
          <img alt="Mikato Logo" src="/logo.jpg" />
        </Link>

        <div className="nav-links">
          <Link className={enlaceActivo('/')} to="/">Catálogo</Link>
          <Link className={enlaceActivo('/pedidos')} to="/pedidos">Mis pedidos</Link>
        </div>

        <div className="nav-actions">
          <Link className="nav-cart" to="/carrito">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="nav-cart-label">Carrito</span>
            <span className="nav-cart-badge">{cantidad}</span>
          </Link>

          {usuario ? (
            <button type="button" className="btn btn-primary" onClick={cerrarSesion}>
              <span className="material-symbols-outlined">logout</span>
              Salir
            </button>
          ) : (
            <Link className="btn btn-primary" to="/login">
              <span className="material-symbols-outlined">person</span>
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
