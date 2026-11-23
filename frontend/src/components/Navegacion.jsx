import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';

const WHATSAPP = 'https://wa.me/523324333262?text=Hola%20Mikato%2C%20quiero%20informaci%C3%B3n%20de%20sus%20productos';
const CATEGORIAS = ['Shampoo', 'Acondicionador', 'Desenredante', 'Perfume'];

export default function Navegacion() {
  const { usuario, cerrarSesion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [texto, setTexto] = useState('');
  const cantidad = useSelector((state) => (
    state.carrito.reduce((total, item) => total + item.cantidad, 0)
  ));

  const parametros = new URLSearchParams(location.search);
  const categoriaActual = parametros.get('cat');

  function buscar(evento) {
    evento.preventDefault();
    const limpio = texto.trim();
    navigate(limpio ? `/?q=${encodeURIComponent(limpio)}` : '/');
  }

  return (
    <>
      <div className="t-utilidad">
        <div className="t-contenedor">
          <span>Fabricación propia en Guadalajara, Jalisco</span>
          <span>Mayoreo para estilistas caninos</span>
          <span>
            <a href={WHATSAPP} target="_blank" rel="noreferrer">WhatsApp 33 2433 3262</a>
          </span>
        </div>
      </div>

      <header className="t-cabecera">
        <div className="t-contenedor t-cabecera__fila">
          <Link className="t-marca" to="/" aria-label="Mikato, inicio">
            <img alt="Mikato" src="/logo.png" />
          </Link>

          <form className="t-buscador" role="search" onSubmit={buscar}>
            <label className="visually-hidden" htmlFor="buscador-tienda">Buscar producto</label>
            <input
              id="buscador-tienda"
              type="search"
              placeholder="Busca shampoo, perfume, desenredante…"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              autoComplete="off"
            />
            <button type="submit" aria-label="Buscar">
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 20 }}>search</span>
            </button>
          </form>

          <div className="t-cabecera__acciones">
            <a className="t-accion" href={WHATSAPP} target="_blank" rel="noreferrer">
              <span className="material-symbols-outlined" aria-hidden="true">chat</span>
              <span className="t-accion__texto">WhatsApp</span>
            </a>
            <Link className="t-accion" to="/carrito">
              <span className="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
              <span className="t-accion__texto">Carrito</span>
              <span className="t-accion__num">{cantidad}</span>
            </Link>
            {usuario ? (
              <button className="t-accion__boton" type="button" onClick={cerrarSesion}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 18 }}>logout</span>
                Salir
              </button>
            ) : (
              <Link className="t-accion__boton" to="/login">
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 18 }}>person</span>
                Mi cuenta
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav className="t-navcat" aria-label="Categorías de la tienda">
        <div className="t-contenedor">
          <ul>
            <li>
              <Link to="/" {...(location.pathname === '/' && !location.search ? { 'aria-current': 'page' } : {})}>
                Todo
              </Link>
            </li>
            {CATEGORIAS.map((nombre) => (
              <li key={nombre}>
                <Link
                  to={`/?cat=${encodeURIComponent(nombre)}`}
                  {...(categoriaActual === nombre ? { 'aria-current': 'page' } : {})}
                >
                  {nombre}
                </Link>
              </li>
            ))}
            <li><Link to="/arena" {...(location.pathname === '/arena' ? { 'aria-current': 'page' } : {})}>Arena para gatos</Link></li>
            <li><a href={WHATSAPP} target="_blank" rel="noreferrer">NEART PETS</a></li>
            <li><a href="https://mikatoestilistascaninos.com" target="_blank" rel="noreferrer">CRM para estéticas caninas</a></li>
            <li>
              <Link to="/pedidos" {...(location.pathname === '/pedidos' ? { 'aria-current': 'page' } : {})}>
                Mis pedidos
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
