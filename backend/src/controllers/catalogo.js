import {
  actualizar,
  crear,
  eliminar,
  listar,
} from '../services/crud.js';

export const productos = async (_req, res) => {
  res.json({
    data: await listar('products', { active: true }),
  });
};

export const categorias = async (_req, res) => {
  res.json({
    data: await listar('categories', { active: true }),
  });
};

export const crearProducto = async (req, res) => {
  res.status(201).json({
    data: await crear('products', req.body),
  });
};

export const crearCategoria = async (req, res) => {
  res.status(201).json({
    data: await crear('categories', req.body),
  });
};

export const actualizarProducto = async (req, res) => {
  res.json({
    data: await actualizar('products', req.params.id, req.body),
  });
};

export const eliminarProducto = async (req, res) => {
  await eliminar('products', req.params.id);
  res.status(204).end();
};

export const actualizarCategoria = async (req, res) => {
  res.json({
    data: await actualizar('categories', req.params.id, req.body),
  });
};

export const eliminarCategoria = async (req, res) => {
  await eliminar('categories', req.params.id);
  res.status(204).end();
};
