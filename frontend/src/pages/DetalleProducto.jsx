import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { agregar } from '../store/carritoSlice';
import { useProductos } from './useProductos';
import { conAncho } from '../lib/imagenes';
import ProductoCard from '../components/ProductoCard';

const WHATSAPP = 'https://wa.me/523324333262';

export default function DetalleProducto() {
  const { id } = useParams();
  const { items } = useProductos();
  const dispatch = useDispatch();
  const item = items.find((producto) => producto.id === id);

  if (!item) {
    return (
      <div className="t-contenedor t-seccion">
        <div className="t-vacio">
          <p><strong>No encontramos ese producto.</strong></p>
          <p>Puede que ya no esté disponible. Escríbenos y te decimos qué hay en existencia.</p>
          <a
            className="t-btn t-btn--wa"
            href={`${WHATSAPP}?text=${encodeURIComponent('Hola Mikato, quiero saber qué productos tienen disponibles.')}`}
            target="_blank"
            rel="noreferrer"
          >
            Preguntar por WhatsApp
          </a>
          <Link className="t-btn t-btn--linea" to="/">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  const precio = Number(item.price);
  const categoria = item.categories?.name?.trim() || 'Estética canina';
  const mensaje = encodeURIComponent(
    `Hola Mikato, quiero pedir ${item.name} (${precio.toFixed(0)} MXN).`,
  );
  const relacionados = items
    .filter((producto) => producto.id !== item.id && producto.image_url)
    .slice(0, 4);

  return (
    <div className="t-contenedor">
      <nav className="t-migas" aria-label="Ruta">
        <Link to="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/?cat=${encodeURIComponent(categoria)}`}>{categoria}</Link>
        <span aria-hidden="true">/</span>
        <span>{item.name}</span>
      </nav>

      <div className="t-ficha">
        <div className="t-ficha__media">
          {item.image_url
            ? (
              <img
                src={conAncho(item.image_url, 900)}
                alt={item.name}
                width="900"
                height="900"
              />
            )
            : <span className="t-producto__sinfoto">Sin foto</span>}
        </div>

        <div className="t-ficha__datos">
          <p className="t-producto__marca">Mikato</p>
          <h1 className="t-ficha__titulo">{item.name}</h1>
          <p className="t-producto__meta">{categoria}</p>

          <div className="t-ficha__precio">
            <strong>${precio.toFixed(0)}</strong>
            <span>MXN · IVA incluido</span>
          </div>

          <div className="t-ficha__acciones">
            <a
              className="t-btn t-btn--wa"
              href={`${WHATSAPP}?text=${mensaje}`}
              target="_blank"
              rel="noreferrer"
            >
              Pedir por WhatsApp
            </a>
            <button
              type="button"
              className="t-btn t-btn--linea"
              onClick={() => dispatch(agregar({ ...item, price: precio }))}
            >
              Agregar al carrito
            </button>
          </div>

          <ul className="t-ficha__puntos">
            <li>Fabricación propia en Guadalajara, Jalisco.</li>
            <li>Precio de mayoreo para estilistas caninos, por WhatsApp.</li>
            <li>Envío por paquetería: se cotiza según tu ciudad.</li>
          </ul>

          <dl className="t-ficha__specs">
            <div><dt>Categoría</dt><dd>{categoria}</dd></div>
            <div><dt>SKU</dt><dd>{item.sku || '—'}</dd></div>
            <div><dt>Existencia</dt><dd>{Number(item.stock) > 0 ? 'Disponible' : 'Por reponer'}</dd></div>
            <div><dt>Fabricación</dt><dd>Guadalajara, Jalisco</dd></div>
          </dl>
        </div>
      </div>

      {item.description && item.description.trim() !== item.name.trim() && (
        <section className="t-seccion" aria-labelledby="descripcion-titulo">
          <h2 id="descripcion-titulo" className="t-seccion__cabeza" style={{ marginBottom: 8 }}>Descripción</h2>
          <p style={{ maxWidth: '70ch', color: 'var(--t-tinta-2)' }}>{item.description}</p>
        </section>
      )}

      {relacionados.length > 0 && (
        <section className="t-seccion" aria-labelledby="relacionados-titulo">
          <div className="t-seccion__cabeza">
            <h2 id="relacionados-titulo">También se piden en el salón canino</h2>
            <Link to="/">Ver todo</Link>
          </div>
          <div className="t-productos">
            {relacionados.map((producto) => (
              <ProductoCard key={producto.id} item={producto} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
