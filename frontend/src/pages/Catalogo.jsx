import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { productosDemo } from '../data/demo';
import ProductoCard from '../components/ProductoCard';

const WHATSAPP = 'https://wa.me/523324333262';
const CATEGORIAS_BASE = ['Shampoo', 'Acondicionador', 'Desenredante', 'Perfume'];

export default function Catalogo() {
  const [items, setItems] = useState([]);
  const [parametros] = useSearchParams();
  const texto = (parametros.get('q') || '').trim();
  const categoria = parametros.get('cat') || '';

  useEffect(() => {
    api('/products')
      .then((response) => setItems(response.data || response))
      .catch(() => setItems(productosDemo));
  }, []);

  const activos = useMemo(() => items.filter((item) => item.active !== false), [items]);

  const filtrados = useMemo(() => {
    const buscado = texto.toLowerCase();
    return activos.filter((item) => {
      const nombre = (item.name || '').toLowerCase();
      const descripcion = (item.description || '').toLowerCase();
      const coincideTexto = !buscado || nombre.includes(buscado) || descripcion.includes(buscado);
      const coincideCategoria = !categoria || (item.categories?.name || '').trim() === categoria;
      return coincideTexto && coincideCategoria;
    });
  }, [activos, texto, categoria]);

  const categorias = useMemo(() => {
    const vivas = [...new Set(activos.map((item) => item.categories?.name?.trim()).filter(Boolean))];
    return [...new Set([...CATEGORIAS_BASE.filter((nombre) => vivas.includes(nombre)), ...vivas])];
  }, [activos]);

  const portada = activos.find((item) => item.image_url);

  const titulo = texto
    ? `Resultados para «${texto}»`
    : categoria
      ? categoria
      : 'Los más vendidos en salón canino';

  return (
    <div className="t-home">
      <div className="t-contenedor t-hero">
        <section className="t-banner" aria-labelledby="hero-titulo">
          {portada?.image_url && (
            <img className="t-banner__foto" src={portada.image_url} alt={portada.name} />
          )}
          <div className="t-banner__texto">
            <p className="t-banner__etiqueta">Hecho en Guadalajara</p>
            <h1 id="hero-titulo">Estética canina profesional, directo de fábrica</h1>
            <p>Shampoos, acondicionadores, desenredantes y perfumes de 1 y 4 litros para salón canino. Sin intermediarios y con lote propio.</p>
            <a className="t-banner__cta" href="#catalogo">Ver catálogo</a>
          </div>
        </section>

        <div className="t-hero__lado">
          <a
            className="t-banner t-banner--chico"
            href={`${WHATSAPP}?text=${encodeURIComponent('Hola Mikato, quiero información de la arena para gatos.')}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="t-banner__texto">
              <p className="t-banner__etiqueta">Arena para gatos</p>
              <h2>Se vende en tu ciudad</h2>
              <p>Sin envío individual: con distribuidores el precio se mantiene justo.</p>
              <span className="t-banner__cta">Pedir informes</span>
            </div>
          </a>

          <a
            className="t-banner t-banner--chico t-banner--crema"
            href={`${WHATSAPP}?text=${encodeURIComponent('Hola Mikato, quiero información de NEART PETS.')}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="t-banner__texto">
              <p className="t-banner__etiqueta">NEART PETS</p>
              <h2>Proteína de salmón y omegas</h2>
              <p>Suplementos para perro, con la misma fábrica detrás.</p>
              <span className="t-banner__cta">Conocer NEART</span>
            </div>
          </a>
        </div>
      </div>

      <section className="t-seccion" aria-labelledby="categorias-titulo">
        <div className="t-contenedor">
          <div className="t-seccion__cabeza">
            <h2 id="categorias-titulo">Compra por categoría</h2>
            <Link to="/">Ver todo</Link>
          </div>
          <div className="t-categorias">
            {categorias.map((nombre) => {
              const conFoto = activos.find(
                (item) => (item.categories?.name || '').trim() === nombre && item.image_url,
              );
              return (
                <Link key={nombre} className="t-categoria" to={`/?cat=${encodeURIComponent(nombre)}`}>
                  {conFoto
                    ? <img src={conFoto.image_url} alt={`Productos de ${nombre}`} loading="lazy" />
                    : <span className="t-categoria__vacia">Ver</span>}
                  <span>{nombre}</span>
                </Link>
              );
            })}
            <a
              className="t-categoria"
              href={`${WHATSAPP}?text=${encodeURIComponent('Hola Mikato, quiero información de la arena para gatos.')}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="t-categoria__vacia">Arena</span>
              <span>Arena</span>
            </a>
            <a
              className="t-categoria"
              href={`${WHATSAPP}?text=${encodeURIComponent('Hola Mikato, quiero información de NEART PETS.')}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="t-categoria__vacia">NEART</span>
              <span>NEART</span>
            </a>
          </div>
        </div>
      </section>

      <section className="t-seccion t-seccion--fondo" id="catalogo" aria-labelledby="productos-titulo">
        <div className="t-contenedor">
          <div className="t-seccion__cabeza">
            <h2 id="productos-titulo">{titulo}</h2>
            <span className="t-producto__meta">{filtrados.length} productos</span>
          </div>

          {filtrados.length === 0 ? (
            <div className="t-vacio">
              <p><strong>No encontramos ese producto.</strong></p>
              <p>Prueba con otro nombre o aroma, o pregúntanos por WhatsApp.</p>
              <a
                className="t-btn t-btn--wa"
                href={`${WHATSAPP}?text=${encodeURIComponent(`Hola Mikato, busco ${texto || 'un producto'}.`)}`}
                target="_blank"
                rel="noreferrer"
              >
                Preguntar por WhatsApp
              </a>
            </div>
          ) : (
            <div className="t-productos">
              {filtrados.map((item) => (
                <ProductoCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="t-seccion" aria-labelledby="confianza-titulo">
        <div className="t-contenedor">
          <h2 id="confianza-titulo" className="visually-hidden">Por qué comprar en Mikato</h2>
          <div className="t-confianza">
            <div>
              <span className="material-symbols-outlined" aria-hidden="true">local_shipping</span>
              <div>
                <strong>Envío a todo México</strong>
                <span>Coordinamos la paquetería por WhatsApp según tu ciudad.</span>
              </div>
            </div>
            <div>
              <span className="material-symbols-outlined" aria-hidden="true">factory</span>
              <div>
                <strong>Fabricación propia</strong>
                <span>Lote propio en Guadalajara, Jalisco. Sin revendedores.</span>
              </div>
            </div>
            <div>
              <span className="material-symbols-outlined" aria-hidden="true">storefront</span>
              <div>
                <strong>Mayoreo para salón canino</strong>
                <span>Precio por volumen para estilistas caninos.</span>
              </div>
            </div>
            <div>
              <span className="material-symbols-outlined" aria-hidden="true">verified</span>
              <div>
                <strong>Atención directa</strong>
                <span>Dudas de uso y rendimiento por WhatsApp.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="t-seccion" aria-labelledby="banda-titulo">
        <div className="t-contenedor">
          <div className="t-banda">
            <div>
              <h2 id="banda-titulo">¿Compras para tu salón canino?</h2>
              <p>Te pasamos precios de mayoreo y calculamos cuánto rinde cada bidón. Contestamos por WhatsApp.</p>
            </div>
            <a
              className="t-btn t-btn--wa"
              href={`${WHATSAPP}?text=${encodeURIComponent('Hola Mikato, quiero precios de mayoreo para mi salón canino.')}`}
              target="_blank"
              rel="noreferrer"
            >
              Pedir precios de mayoreo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
