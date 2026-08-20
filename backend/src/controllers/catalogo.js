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

function generarSku() {
  return `PROD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function generarSlug(nombre) {
  const base = String(nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || `categoria-${Date.now().toString(36)}`;
}

export async function crearProducto(req, res) {
  const body = { ...req.body };
  if (!body.sku || String(body.sku).trim() === '') {
    body.sku = generarSku();
  }
  res.status(201).json({ data: await crear('products', body) });
}

export async function crearCategoria(req, res) {
  const body = { ...req.body };
  if (!body.slug || String(body.slug).trim() === '') {
    body.slug = generarSlug(body.name);
  }
  res.status(201).json({ data: await crear('categories', body) });
}

export async function actualizarProducto(req, res) {
  const body = { ...req.body };
  if (body.sku !== undefined && String(body.sku).trim() === '') {
    delete body.sku;
  }
  res.json({ data: await actualizar('products', req.params.id, body) });
}

export async function eliminarProducto(req, res) {
  await eliminar('products', req.params.id);
  res.status(204).end();
}

export async function actualizarCategoria(req, res) {
  const body = { ...req.body };
  if (body.slug !== undefined && String(body.slug).trim() === '') {
    delete body.slug;
  }
  res.json({ data: await actualizar('categories', req.params.id, body) });
}

export async function eliminarCategoria(req, res) {
  await eliminar('categories', req.params.id);
  res.status(204).end();
}
