import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
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
import { subirImagen, uploadsDir } from '../controllers/upload.js';
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
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Autenticación
router.post('/auth/registro', asyncHandler(registrar));
router.post('/auth/login', asyncHandler(iniciarSesion));
router.get('/auth/me', verificarJWT, asyncHandler(miPerfil));

// Catálogo público
router.get('/products', asyncHandler(productos));
router.get('/categories', asyncHandler(categorias));

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

// Pedidos
router.get('/orders', verificarJWT, asyncHandler(listarPedidos));
router.post('/orders', verificarJWT, asyncHandler(crearPedido));
router.get('/tracking/:id', verificarJWT, asyncHandler(tracking));
router.patch('/orders/:id/status', verificarJWT, exigirAdmin, asyncHandler(cambiarEstado));
router.get('/admin/orders', verificarJWT, exigirAdmin, asyncHandler(listarPedidosAdmin));

export default router;