import multer from 'multer';
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
import { miPerfil, iniciarSesion, registrar } from '../controllers/auth.js';
import { subirImagen, obtenerImagen } from '../controllers/upload.js';
import { obtenerConfiguracion, actualizarConfiguracion } from '../controllers/settings.js';
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
} from '../controllers/usuarios.js';
import {
  actualizarPago,
  actualizarPedido,
  cambiarEstado,
  crearPedido,
  eliminarPedido,
  listarPedidos,
  listarPedidosAdmin,
  tracking,
} from '../controllers/pedidos.js';
import { exigirAdmin, verificarJWT } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Autenticación
router.post('/auth/registro', asyncHandler(registrar));
router.post('/auth/login', asyncHandler(iniciarSesion));
router.get('/auth/me', verificarJWT, asyncHandler(miPerfil));

// Catálogo público
router.get('/products', asyncHandler(productos));
router.get('/categories', asyncHandler(categorias));
router.get('/images/:id', asyncHandler(obtenerImagen));
router.get('/settings', asyncHandler(obtenerConfiguracion));

// Subida de imágenes (solo administradores)
router.post(
  '/upload',
  verificarJWT,
  exigirAdmin,
  upload.single('image'),
  asyncHandler(subirImagen),
);

// Gestión de productos y categorías (solo administradores)
router.post('/products', verificarJWT, exigirAdmin, asyncHandler(crearProducto));
router.post('/categories', verificarJWT, exigirAdmin, asyncHandler(crearCategoria));
router.patch('/products/:id', verificarJWT, exigirAdmin, asyncHandler(actualizarProducto));
router.delete('/products/:id', verificarJWT, exigirAdmin, asyncHandler(eliminarProducto));
router.patch('/categories/:id', verificarJWT, exigirAdmin, asyncHandler(actualizarCategoria));
router.delete('/categories/:id', verificarJWT, exigirAdmin, asyncHandler(eliminarCategoria));

// Configuración visual del sitio (solo administradores)
router.put('/settings', verificarJWT, exigirAdmin, asyncHandler(actualizarConfiguracion));

// Gestión de usuarios (solo administradores)
router.get('/admin/users', verificarJWT, exigirAdmin, asyncHandler(listarUsuarios));
router.post('/admin/users', verificarJWT, exigirAdmin, asyncHandler(crearUsuario));
router.patch('/admin/users/:id', verificarJWT, exigirAdmin, asyncHandler(actualizarUsuario));
router.delete('/admin/users/:id', verificarJWT, exigirAdmin, asyncHandler(eliminarUsuario));

// Pedidos
router.get('/orders', verificarJWT, asyncHandler(listarPedidos));
router.post('/orders', verificarJWT, asyncHandler(crearPedido));
router.patch('/orders/:id', verificarJWT, asyncHandler(actualizarPedido));
router.delete('/orders/:id', verificarJWT, asyncHandler(eliminarPedido));
router.get('/tracking/:id', verificarJWT, asyncHandler(tracking));
router.patch('/orders/:id/status', verificarJWT, exigirAdmin, asyncHandler(cambiarEstado));
router.patch('/orders/:id/payment', verificarJWT, exigirAdmin, asyncHandler(actualizarPago));
router.get('/admin/orders', verificarJWT, exigirAdmin, asyncHandler(listarPedidosAdmin));

export default router;