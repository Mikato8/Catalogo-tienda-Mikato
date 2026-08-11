# ERP Mikato

ERP Mikato es una plataforma de comercio electrónico y gestión operativa para
productos producidos y comercializados por Mikato. Combina un catálogo público,
carrito, checkout, seguimiento de pedidos y un panel de administración para
productos, categorías y estados de pedidos.

El proyecto se despliega como una sola aplicación Node.js: Express sirve la API
REST y, después del build, también entrega el frontend compilado de Vite.

## Funcionalidades

- Catálogo responsive con búsqueda y filtro por categoría.
- Detalle de producto y carrito persistido en el navegador.
- Checkout autenticado con creación de pedidos.
- Mis pedidos y timeline de seguimiento.
- Autenticación propia por correo/contraseña con JWT.
- Panel de administración con CRUD de productos y categorías.
- Carga de imágenes de productos al servidor (servidas por HTTP).
- Gestión administrativa de pedidos y cambios de estado.
- Registro automático de cada cambio en `order_tracking`.
- Modo demostración cuando el backend no está conectado a la base de datos.
- API REST versionada bajo `/api/v1` y endpoint de salud `/api/health`.

## Arquitectura

```text
┌─────────────────────────────────────────────────────────────┐
│ Navegador                                                   │
│ React 18 + Vite + Ant Design + React Router                 │
│ Redux Toolkit (carrito) + Context API (sesión)              │
└───────────────────────────────┬─────────────────────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 ▼                             ▼
        Express REST API     (JWT en AuthContext / localStorage)
        auth + lógica de negocio + uploads
                 │
                 ▼
        PostgreSQL (Neon)
        tablas de ERP Mikato
```

El frontend se comunica con el backend mediante una API REST. La autenticación
se resuelve con JWT propios del backend (el token se guarda en
`localStorage`), y las imágenes subidas se sirven desde `/uploads`. La
configuración de la base de datos (`DATABASE_URL`) vive únicamente en el
backend.

## Stack tecnológico

### Frontend

- React 18.
- Vite.
- React Router DOM 6.
- Ant Design 5.
- Redux Toolkit y React Redux.
- ESLint.

### Backend

- Node.js con módulos ES.
- Express.
- `pg` (PostgreSQL) para Neon.
- `bcryptjs` (hash de contraseñas) y `jsonwebtoken` (sesiones).
- `multer` (subida de imágenes).
- Helmet, CORS, Morgan y dotenv.

### Datos y despliegue

- PostgreSQL gestionado por Neon.
- Esquema SQL versionado en `backend/sql`.
- Hostinger Node.js App (ver `docs/DEPLOY_HOSTINGER.md`).

## Estructura de carpetas

```text
ERP-Mikato/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── sql/
│   │   ├── schema.sql           Tablas del esquema Mikato
│   │   └── seed.sql             Categorías y productos de ejemplo
│   └── src/
│       ├── config/              Configuración, cliente de base de datos
│       ├── controllers/         Controladores HTTP (auth, catálogo, pedidos, upload)
│       ├── middleware/          JWT, permisos y errores
│       ├── routes/              Rutas versionadas de la API
│       ├── services/            Acceso reutilizable a datos
│       └── server.js            Arranque Express y hosting del frontend
├── docs/
│   └── DEPLOY_HOSTINGER.md
├── frontend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── components/          Navegación, cards, protección y timeline
│       ├── contexts/            Contexto de sesión (token + usuario)
│       ├── data/                Datos de demostración
│       ├── lib/                 Utilidades de sesión (localStorage)
│       ├── pages/               Vistas públicas y de cuenta
│       │   └── admin/            Vistas de administración
│       ├── services/            Cliente HTTP de la API
│       └── store/               Slices y configuración Redux
├── .gitignore
├── package.json                 Workspaces y scripts raíz
└── README.md
```

## Requisitos

- Node.js 18 o superior.
- npm 9 o superior.
- Un proyecto de Neon (PostgreSQL) con su `DATABASE_URL`.
- Git para versionar y publicar el proyecto.

## Configuración de la base de datos (Neon)

1. Crea un proyecto en [neon.tech](https://neon.tech) y copia la cadena de
   conexión (Connection string) de tu base.
2. Ejecuta `backend/sql/schema.sql` en el editor/SQL de Neon.
3. Ejecuta `backend/sql/seed.sql` para cargar categorías y productos de ejemplo.
4. Copia esa cadena a `DATABASE_URL` en `backend/.env`.

## Variables de entorno

### Frontend

Copia `frontend/.env.example` como `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

Esta variable solo es necesaria si el backend vive en otro host; en desarrollo
Vite ya hace proxy de `/api` hacia `http://localhost:4000`.

### Backend

Copia `backend/.env.example` como `backend/.env`:

```env
PORT=4000
DATABASE_URL=postgresql://usuario:clave@host-pooler.region.neon.tech/neondb?sslmode=require
JWT_SECRET=una-clave-larga-y-secreta
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

`JWT_SECRET` firma los tokens de sesión y debe ser una clave larga y secreta en
producción. `DATABASE_URL` y `JWT_SECRET` nunca deben llegar al navegador ni al
repositorio.

## Ejecutar en local

Desde la raíz:

```bash
npm install
npm run dev
```

Se levantan dos procesos:

- Frontend Vite: `http://localhost:5173`.
- Backend Express: `http://localhost:4000`.

Comprueba el backend con:

```bash
curl http://localhost:4000/api/health
```

## Scripts disponibles

```bash
npm run dev       # frontend y backend en paralelo
npm run build     # build de producción del frontend
npm run lint      # ESLint del frontend
npm start         # backend y frontend compilado
npm run install:all
```

También puedes ejecutar scripts por workspace:

```bash
npm run dev --workspace frontend
npm run dev --workspace backend
npm run build --workspace frontend
npm run lint --workspace frontend
```

## Roles de usuario

Al registrarse, los usuarios se crean con rol `cliente`. Para dar permisos de
administración a un usuario, actualiza su rol en la base de datos:

```sql
update public.users set role = 'admin' where email = 'tu@correo.com';
```

## Seguridad y operación

- El backend verifica el JWT en todas las operaciones privadas.
- Los permisos administrativos se comprueban contra `users.role`.
- Las contraseñas se almacenan con `bcryptjs` (nunca en claro).
- Las consultas usan sentencias parametrizadas (`pg`) para evitar inyección SQL.
- Las imágenes subidas se sirven desde `/uploads` y solo los administradores
  pueden subirlas.
- Las claves sensibles se cargan desde variables de entorno.
- Los errores HTTP se normalizan mediante middleware centralizado.
- El endpoint `/api/health` permite comprobar disponibilidad de la aplicación.

## Despliegue

Consulta [`docs/DEPLOY_HOSTINGER.md`](docs/DEPLOY_HOSTINGER.md) para el flujo de
Hostinger Node.js App (build, subida, variables, puerto, dominio y
comprobaciones posteriores).

## Publicar en GitHub

El remoto configurado es:

```text
https://github.com/Mikato8/ERP-Mikato.git
```

Después de revisar los cambios localmente:

```bash
git status
git add .gitignore README.md package.json package-lock.json frontend backend docs
git commit -m "Migrar ERP Mikato a PostgreSQL/Neon"
git push origin main
```

Antes de hacer push confirma que ningún `.env` o secreto aparece en
`git status`.