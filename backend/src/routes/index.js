import { Router } from 'express';
import {
  actualizarCategoria,
  actualizarProducto,
  categorias,
  crearCategoria,
  crearProducto,
  eliminarCategoria,
  eliminarProducto,
  productos,
} from '../controllers/catalogo.js';
import {
  cambiarEstado,
  crearPedido,
  listarPedidos,
  listarPedidosAdmin,
  tracking,
} from '../controllers/pedidos.js';
import { exigirAdmin, verificarJWT } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.get('/products', asyncHandler(productos));
router.get('/categories', asyncHandler(categorias));

router.post(
  '/products',
  verificarJWT,
  exigirAdmin,
  asyncHandler(crearProducto),
);
router.post(
  '/categories',
  verificarJWT,
  exigirAdmin,
  asyncHandler(crearCategoria),
);
router.patch(
  '/products/:id',
  verificarJWT,
  exigirAdmin,
  asyncHandler(actualizarProducto),
);
router.delete(
  '/products/:id',
  verificarJWT,
  exigirAdmin,
  asyncHandler(eliminarProducto),
);
router.patch(
  '/categories/:id',
  verificarJWT,
  exigirAdmin,
  asyncHandler(actualizarCategoria),
);
router.delete(
  '/categories/:id',
  verificarJWT,
  exigirAdmin,
  asyncHandler(eliminarCategoria),
);

router.get('/orders', verificarJWT, asyncHandler(listarPedidos));
router.post('/orders', verificarJWT, asyncHandler(crearPedido));
router.get('/tracking/:id', verificarJWT, asyncHandler(tracking));
router.patch(
  '/orders/:id/status',
  verificarJWT,
  exigirAdmin,
  asyncHandler(cambiarEstado),
);
router.get(
  '/admin/orders',
  verificarJWT,
  exigirAdmin,
  asyncHandler(listarPedidosAdmin),
);

export default router;
