import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { agregar } from '../store/carritoSlice';
import { conAncho, srcSetImagen } from '../lib/imagenes';

const WHATSAPP = 'https://wa.me/523324333262';

export default function ProductoCard({ item }) {
  const dispatch = useDispatch();
  const categoria = item.categories?.name?.trim() || 'Estética canina';
  const precio = Number(item.price);
  const mensaje = encodeURIComponent(
    `Hola Mikato, quiero pedir ${item.name} (${precio.toFixed(0)} MXN).`,
  );

  return (
    <article className="t-producto">
      <Link className="t-producto__media" to={`/producto/${item.id}`}>
        {item.image_url
          ? (
            <img
              alt={item.name}
              src={conAncho(item.image_url, 500)}
              srcSet={srcSetImagen(item.image_url, [400, 800])}
              sizes="(max-width: 560px) 45vw, (max-width: 1080px) 30vw, 300px"
              loading="lazy"
              decoding="async"
            />
          )
          : <span className="t-producto__sinfoto">Sin foto</span>}
      </Link>

      <div className="t-producto__cuerpo">
        <p className="t-producto__marca">Mikato</p>
        <h3 className="t-producto__nombre">
          <Link to={`/producto/${item.id}`}>{item.name}</Link>
        </h3>
        <p className="t-producto__meta">{categoria}</p>
        <p className="t-producto__precio">
          <strong>${precio.toFixed(0)}</strong>
          <span>Precio en pesos mexicanos</span>
        </p>
      </div>

      <div className="t-producto__acciones">
        <a
          className="t-btn t-btn--wa t-btn--chico t-btn--bloque"
          href={`${WHATSAPP}?text=${mensaje}`}
          target="_blank"
          rel="noreferrer"
        >
          Pedir por WhatsApp
        </a>
        <button
          type="button"
          className="t-btn t-btn--linea t-btn--chico t-btn--bloque"
          onClick={() => dispatch(agregar({ ...item, price: precio }))}
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
