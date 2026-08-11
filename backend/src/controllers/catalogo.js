import { consultar } from '../config/db.js';
import {
  actualizar,
  crear,
  eliminar,
} from '../services/crud.js';

export async function productos(_req, res) {
  const data = await consultar(`
    select p.*, json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as categories
    from public.products p
    left join public.categories c on c.id = p.category_id
    where p.active = true
    order by p.created_at desc
  `);

  res.json({ data });
}

export async function categorias(_req, res) {
  res.json({
    data: await consultar(
      'select * from public.categories where active = true order by created_at desc',
    ),
  });
}

export async function crearProducto(req, res) {
  res.status(201).json({ data: await crear('products', req.body) });
}

export async function crearCategoria(req, res) {
  res.status(201).json({ data: await crear('categories', req.body) });
}

export async function actualizarProducto(req, res) {
  res.json({ data: await actualizar('products', req.params.id, req.body) });
}

export async function eliminarProducto(req, res) {
  await eliminar('products', req.params.id);
  res.status(204).end();
}

export async function actualizarCategoria(req, res) {
  res.json({ data: await actualizar('categories', req.params.id, req.body) });
}

export async function eliminarCategoria(req, res) {
  await eliminar('categories', req.params.id);
  res.status(204).end();
}
