import { Link } from 'react-router-dom';

const WHATSAPP = 'https://wa.me/523324333262';
const MENSAJE_COMPRA = encodeURIComponent('Hola Mikato, quiero saber dónde comprar arena para gatos.');
const MENSAJE_DISTRIBUIDOR = encodeURIComponent('Hola Mikato, quiero distribuir arena en mi ciudad.');
const MENSAJE_MAYOREO = encodeURIComponent('Hola Mikato, quiero precios de mayoreo de arena.');

export default function Arena() {
  return (
    <div className="t-contenedor">
      <nav className="t-migas" aria-label="Ruta">
        <Link to="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <span>Arena para gatos</span>
      </nav>

      <section className="t-arena">
        <div>
          <p className="t-banner__etiqueta" style={{ color: 'var(--t-oro)' }}>Arena Mikato</p>
          <h1 className="t-ficha__titulo" style={{ marginBottom: 10 }}>La arena se vende cerca de casa, no por paquetería</h1>
          <p style={{ fontSize: 17, lineHeight: '26px', color: 'var(--t-tinta-2)', maxWidth: '58ch' }}>
            Fabricamos la arena en Guadalajara y trabajamos con distribuidores y puntos de venta.
            Enviar una bolsa por paquetería encarece el precio final, así que preferimos que la
            compres en tu ciudad al precio justo.
          </p>

          <ul className="t-arena__lista">
            <li>
              <span className="material-symbols-outlined" aria-hidden="true">storefront</span>
              <span>Te decimos el punto de venta más cercano por WhatsApp.</span>
            </li>
            <li>
              <span className="material-symbols-outlined" aria-hidden="true">local_shipping</span>
              <span>Si estás fuera de nuestra cobertura, te avisamos cuando llegue un distribuidor.</span>
            </li>
            <li>
              <span className="material-symbols-outlined" aria-hidden="true">handshake</span>
              <span>Si tienes tienda o estética canina, puedes distribuirla en tu zona.</span>
            </li>
          </ul>

          <div className="t-ficha__acciones" style={{ marginTop: 20 }}>
            <a className="t-btn t-btn--wa" href={`${WHATSAPP}?text=${MENSAJE_COMPRA}`} target="_blank" rel="noreferrer">
              Dónde comprar cerca de mí
            </a>
            <a className="t-btn t-btn--linea" href={`${WHATSAPP}?text=${MENSAJE_DISTRIBUIDOR}`} target="_blank" rel="noreferrer">
              Quiero distribuir
            </a>
          </div>
        </div>

        <div className="t-banner t-banner--crema" style={{ minHeight: 280 }}>
          <div className="t-banner__texto" style={{ maxWidth: '100%', padding: 28 }}>
            <p className="t-banner__etiqueta">Distribuidores</p>
            <h2 style={{ fontSize: 24 }}>Arena a granel para tu tienda</h2>
            <p style={{ color: '#5a4a2a' }}>
              Entrega local por tarima y precio por volumen. Nosotros fabricamos, tú atiendes a tus clientes.
            </p>
            <a className="t-banner__cta" href={`${WHATSAPP}?text=${MENSAJE_MAYOREO}`} target="_blank" rel="noreferrer">
              Pedir precios de mayoreo
            </a>
          </div>
        </div>
      </section>

      <section className="t-seccion" aria-labelledby="arena-confianza">
        <h2 id="arena-confianza" className="visually-hidden">Por qué la arena no se envía</h2>
        <div className="t-confianza">
          <div>
            <span className="material-symbols-outlined" aria-hidden="true">scale</span>
            <div>
              <strong>El peso manda</strong>
              <span>Una bolsa mediana por paquetería cuesta más que la arena misma.</span>
            </div>
          </div>
          <div>
            <span className="material-symbols-outlined" aria-hidden="true">factory</span>
            <div>
              <strong>Fabricación propia</strong>
              <span>Lote propio en Guadalajara, Jalisco.</span>
            </div>
          </div>
          <div>
            <span className="material-symbols-outlined" aria-hidden="true">storefront</span>
            <div>
              <strong>Precio justo en tu ciudad</strong>
              <span>Sin flete individual: el precio se mantiene bajo.</span>
            </div>
          </div>
          <div>
            <span className="material-symbols-outlined" aria-hidden="true">chat</span>
            <div>
              <strong>Atención directa</strong>
              <span>Te contestamos por WhatsApp con el punto más cercano.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="t-seccion" aria-labelledby="arena-cierre">
        <div className="t-banda">
          <div>
            <h2 id="arena-cierre">¿Tienes tienda o estética canina?</h2>
            <p>Cuéntanos en qué zona estás y cuánto vendes al mes. Revisamos si tu ciudad está libre y te pasamos condiciones.</p>
          </div>
          <a className="t-btn t-btn--wa" href={`${WHATSAPP}?text=${MENSAJE_DISTRIBUIDOR}`} target="_blank" rel="noreferrer">
            Hablar con Mikato
          </a>
        </div>
      </section>
    </div>
  );
}
