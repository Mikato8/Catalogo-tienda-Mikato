import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { productosDemo } from '../data/demo';

export function useProductos() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api('/products')
      .then((response) => setItems(response.data || response))
      .catch(() => setItems(productosDemo));
  }, []);

  return { items };
}
