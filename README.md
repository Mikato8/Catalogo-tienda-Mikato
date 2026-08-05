# ERP Mikato

ERP Mikato es una plataforma de comercio electrónico y gestión operativa para
productos producidos y comercializados por Mikato. La primera versión combina
un catálogo público, carrito, checkout, seguimiento de pedidos y un panel de
administración para productos, categorías y estados de pedidos.

El proyecto está preparado para desplegarse como una sola aplicación Node.js:
Express sirve la API REST y, después del build, también entrega el frontend
compilado de Vite.

## Funcionalidades

- Catálogo responsive con búsqueda y filtro por categoría.
- Detalle de producto y carrito persistido en el navegador.
- Checkout autenticado con creación de pedidos.
- Mis pedidos y timeline de seguimiento.
- Autenticación con correo/contraseña y Google OAuth mediante Supabase Auth.
- Panel de administración con CRUD de productos y categorías.
- Carga de imágenes de productos a Supabase Storage.
- Gestión administrativa de pedidos y cambios de estado.
- Registro automático de cada cambio en `order_tracking`.
- Modo demostración cuando faltan las credenciales de Supabase.
- API REST versionada bajo `/api/v1`.
- Endpoint de salud en `/api/health`.

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
        Supabase Auth/Storage          Express REST API
        sesión e imágenes              JWT + lógica de negocio
                                               │
                                               ▼
                                      Supabase PostgreSQL
                                      tablas, RLS y tracking
```

El frontend usa Supabase directamente únicamente para autenticación y
almacenamiento de imágenes. El catálogo y los pedidos se consultan mediante
Express para centralizar reglas de negocio y autorización. La clave
`SUPABASE_SERVICE_ROLE_KEY` solo existe en el backend.

## Stack tecnológico

### Frontend

- React 18.
- Vite.
- React Router DOM 6.
- Ant Design 5.
- Redux Toolkit y React Redux.
- Supabase JS.
- ESLint.

### Backend

- Node.js con módulos ES.
- Express.
- Supabase JS con service role.
- Helmet.
- CORS.
- Morgan.
- dotenv.

### Datos y despliegue

- PostgreSQL gestionado por Supabase.
- Supabase Row Level Security.
- Supabase Storage.
- Hostinger Node.js App.

## Estructura de carpetas

```text
ERP-Mikato/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/          Configuración y cliente Supabase
│       ├── controllers/     Controladores HTTP
│       ├── middleware/      JWT, permisos y errores
│       ├── routes/          Rutas versionadas de la API
│       ├── services/        Acceso reutilizable a datos
│       └── server.js        Arranque Express y hosting del frontend
├── docs/
│   ├── DEPLOY_HOSTINGER.md
│   └── SUPABASE_SETUP.md
├── frontend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── components/      Navegación, cards, protección y timeline
│       ├── contexts/        Contexto de sesión
│       ├── data/            Datos de demostración
│       ├── lib/             Cliente Supabase
│       ├── pages/           Vistas públicas y de cuenta
│       │   └── admin/        Vistas de administración
│       ├── services/        Cliente HTTP de la API
│       └── store/            Slices y configuración Redux
├── supabase/
│   ├── schema.sql           Tablas, funciones, RLS y Storage
│   └── seed.sql             Categorías y productos de ejemplo
├── .gitignore
├── package.json              Workspaces y scripts raíz
└── README.md
```

## Requisitos

- Node.js 18 o superior.
- npm 9 o superior.
- Una cuenta de Supabase para el flujo completo.
- Git para versionar y publicar el proyecto.

El catálogo y el panel administrativo demo pueden abrirse sin Supabase, pero
los usuarios, pedidos persistentes, OAuth y Storage requieren configuración.

## Configuración de Supabase

Sigue la guía detallada en
[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md). En resumen:

1. Crea un proyecto Supabase.
2. Ejecuta `supabase/schema.sql` en SQL Editor.
3. Ejecuta `supabase/seed.sql`.
4. Habilita Email y Google OAuth.
5. Crea o promueve un usuario administrador.
6. Copia las URL y claves a los archivos `.env`.

## Variables de entorno

### Frontend

Copia `frontend/.env.example` como `frontend/.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
VITE_API_URL=http://localhost:4000/api/v1
```

Las variables `VITE_*` se incorporan durante el build. No pongas aquí la clave
service role.

### Backend

Copia `backend/.env.example` como `backend/.env`:

```env
PORT=4000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio
CORS_ORIGIN=http://localhost:5173
```

La clave `SUPABASE_SERVICE_ROLE_KEY` permite saltarse RLS y nunca debe llegar al
navegador, al repositorio ni a los logs.

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

## Build y producción

Ejecuta:

```bash
npm run build
npm start
```

Express buscará el frontend en `frontend/dist` y usará fallback SPA para las
rutas de React. En producción debes definir las variables `VITE_*` antes del
build y las variables del backend en el entorno de ejecución.

## Publicar en GitHub

El remoto configurado es:

```text
https://github.com/Mikato8/ERP-Mikato.git
```

Después de revisar los cambios localmente:

```bash
git status
git add .gitignore README.md package.json package-lock.json frontend backend supabase docs
git commit -m "Construir ERP e-commerce Mikato"
git push origin main
```

Antes de hacer push confirma que ningún `.env` o secreto aparece en
`git status`.

## Despliegue

Consulta [`docs/DEPLOY_HOSTINGER.md`](docs/DEPLOY_HOSTINGER.md) para el flujo
completo de Hostinger Node.js App. La guía incluye build, subida, variables,
puerto, dominio y comprobaciones posteriores.

## Seguridad y operación

- El backend verifica el JWT de Supabase en todas las operaciones privadas.
- Los permisos administrativos se comprueban contra `profiles.role`.
- Las tablas sensibles tienen RLS.
- Las imágenes tienen políticas separadas en Storage.
- Las claves sensibles se cargan desde variables de entorno.
- Los errores HTTP se normalizan mediante middleware centralizado.
- El endpoint `/api/health` permite comprobar disponibilidad de la aplicación.
