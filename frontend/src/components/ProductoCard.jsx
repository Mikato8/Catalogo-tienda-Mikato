import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { agregar } from '../store/carritoSlice';

export default function ProductoCard({ item }) {
  const dispatch = useDispatch();

  return (
    <article className="product-card">
      <Link className="product-card-media" to={`/producto/${item.id}`}>
        <img alt={item.name} src={item.image_url} loading="lazy" />
      </Link>

      <div className="product-card-body">
        <span className="product-card-cat">
          {item.categories?.name || 'General'}
        </span>
        <Link className="product-card-name" to={`/producto/${item.id}`}>
          {item.name}
        </Link>
        <span className="product-card-price">
          ${Number(item.price).toFixed(2)}
        </span>
      </div>

      <div className="product-card-actions">
        <Link className="btn btn-outline" to={`/producto/${item.id}`}>
          Ver detalle
        </Link>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch(agregar({ ...item, price: Number(item.price) }))}
        >
          Agregar
        </button>
      </div>
    </article>
  );
}
