import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { productosDemo } from '../data/demo';
import ProductoCard from '../components/ProductoCard';

export default function Catalogo() {
  const [items, setItems] = useState([]);
  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState('todas');

  useEffect(() => {
    api('/products')
      .then((response) => setItems(response.data || response))
      .catch(() => setItems(productosDemo));
  }, []);

  const categorias = [
    ...new Set(items.map((item) => item.categories?.name).filter(Boolean)),
  ];

  const filtrados = items.filter((item) => (
    item.name.toLowerCase().includes(texto.toLowerCase())
    && (categoria === 'todas' || item.categories?.name === categoria)
  ));

  return (
    <>
      <section className="hero">
        <div className="hero-card">
          <div className="hero-bg" />
          <div className="hero-content">
            <span className="eyebrow">Productos de gran calidad</span>
            <h1>Mikato productos para mascotas</h1>
            <p className="hero-description">
              Mikato son productos elaborados en Guadalajara Jal.
              <br />
              Whatsapp 3324333262
            </p>
          </div>
        </div>
      </section>

      <section className="toolbar">
        <div className="search">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
          />
          <span className="material-symbols-outlined">search</span>
        </div>
        <div className="filter">
          <select
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <span className="material-symbols-outlined">expand_more</span>
        </div>
      </section>

      <section className="grid">
        {filtrados.map((item) => (
          <ProductoCard key={item.id} item={item} />
        ))}
      </section>
    </>
  );
}
