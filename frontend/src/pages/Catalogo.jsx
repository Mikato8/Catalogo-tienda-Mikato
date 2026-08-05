import { useEffect, useState } from 'react';
import { Input, Select } from 'antd';
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
        <div>
          <p className="eyebrow">PRODUCIDO Y COMERCIALIZADO CON PROPÓSITO</p>
          <h1>Objetos que hacen hogar.</h1>
          <p>
            Descubre piezas Mikato creadas para acompañar tus momentos
            cotidianos.
          </p>
        </div>
      </section>
      <div className="toolbar">
        <Input.Search
          placeholder="Buscar productos..."
          onChange={(event) => setTexto(event.target.value)}
        />
        <Select
          value={categoria}
          onChange={setCategoria}
          options={[
            { value: 'todas', label: 'Todas las categorías' },
            ...categorias.map((item) => ({ value: item, label: item })),
          ]}
        />
      </div>
      <div className="grid">
        {filtrados.map((item) => (
          <ProductoCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
