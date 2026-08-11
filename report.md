# Reporte de cambios · ERP Mikato

Fecha: 2026-08-10

## Migración: de Supabase a Neon (PostgreSQL)

Se reemplazó toda la infraestructura de Supabase (base de datos + auth + storage) por
una solución basada en PostgreSQL/Neon con backend propio.

### Base de datos
- **Nuevo cliente** `backend/src/config/db.js` con `pg` (`Pool`) leyendo `DATABASE_URL`.
- **Esquema propio para Neon** en `backend/sql/schema.sql` (usuarios, categorías, productos, pedidos, items, tracking) y datos de ejemplo en `backend/sql/seed.sql` (10 productos, 3 categorías).
  - Se eliminó el esquema de Supabase (`supabase/schema.sql`, RLS, triggers sobre `auth.users`, buckets de storage).
- **Aplicado y verificado** contra la Neon del proyecto (SQL original). La Neon quedó con el esquema nuevo y semilla cargada.

### Autenticación (JWT propio, sin Google OAuth)
- `backend/src/controllers/auth.js`: `registro`, `iniciarSesion`, `miPerfil` con `bcryptjs` para hash de contraseñas y `jsonwebtoken` para emitir/validar tokens.
- `backend/src/middleware/auth.js`: `verificarJWT` (valida JWT firmado con `JWT_SECRET`) y `exigirAdmin` (revisa `role` desde la tabla `users`).
- Tabla `users` reemplaza a `profiles`/`auth.users` de Supabase (campos: `email`, `password_hash`, `full_name`, `role`).

### Storage de imágenes
- Endpoint `POST /api/v1/upload` (solo admin, `multer 2.x`) que guarda en `backend/uploads/`; `GET /uploads/*` sirve las imágenes por HTTP.

### Frontend
- `src/lib/auth.js` reemplaza a `lib/supabase.js`: guarda token/usuario en `localStorage`.
- `contexts/AuthContext.jsx`: login/registro/`me` contra la API; expone `token` y `usuario`.
- `Acceso.jsx`: registro/login vía backend (se eliminó "Continuar con Google").
- `Proteccion.jsx` y `Navegacion.jsx`: el rol (admin) se lee del `usuario` devuelto por la API.
- `ProductosAdmin.jsx`: sube imágenes con `subirImagen()` a `POST /upload`; ya no usa Supabase Storage.
- `App.jsx`: la app siempre está configurada; `/admin` exige login + rol admin.

### Configuración
- `backend/.env` (ignorado por git) con `DATABASE_URL` de Neon y `JWT_SECRET`.
- `backend/.env.example` y `frontend/.env.example` actualizados (sin Supabase).
- Dependencias: se quitó `@supabase/supabase-js` (frontend y backend); se agregaron `pg`, `bcryptjs`, `jsonwebtoken`, `multer`.

### Verificación realizada
- `node --check` en todos los archivos del backend: OK.
- `npm run lint --workspace frontend`: sin errores.
- `npm run build --workspace frontend`: compila correctamente.
- Smoke test contra la Neon real:
  - `GET /api/health`, `GET /api/v1/products`, `GET /api/v1/categories`: 200.
  - `POST /auth/registro` y `/auth/login`: 201/200 con token.
  - CRUD admin de productos (POST 201 / PATCH 200 / DELETE 204) y subida de imagen (201).
  - Datos de prueba eliminados tras las pruebas.

### Cómo levantar
1. Configurar `backend/.env` con `DATABASE_URL` y `JWT_SECRET`.
2. Aplicar `backend/sql/schema.sql` y luego `backend/sql/seed.sql` (si la BD está vacía).
3. `npm run dev` en la raíz (levanta frontend + backend) o `npm run dev --workspace backend` y `--workspace frontend`.
4. Para dar rol admin a un usuario: `update public.users set role='admin' where email='...';`

---

## Nota: correcciones de errores previas (consolidación)

Se corrigieron también (válidas en el código, sin relación con la migración):
- `frontend/src/services/api.js`: respuestas `204` sin body (DELETE ya no lanza error).
- `pedidos.js`: `crearPedido` valida dirección, stock y precio real desde la BD y decrementa stock; `cambiarEstado` valida contra el enum.
- `Navegacion.jsx` / `Proteccion.jsx`: el rol admin proviene de la fuente real (ahora del `usuario`/`users.role`).
- `DetalleProducto.jsx`: `Number(item.price)` al agregar al carrito.
- `Tracking.jsx`: se eliminó la lógica demo muerta; añade estado de carga.
- `ProductosAdmin.jsx` / `CategoriasAdmin.jsx` / `PedidosAdmin.jsx`: usan el token de la API en los headers.