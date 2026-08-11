# Despliegue en Hostinger como aplicación Node.js

Esta guía publica el frontend compilado y la API Express como una sola
aplicación Node.js.

## 1. Preparar el build

En local instala dependencias y crea las variables del frontend:

```bash
npm install
cp frontend/.env.example frontend/.env
```

Edita `frontend/.env` con la URL de la API en producción:

```env
VITE_API_URL=https://tu-dominio.com/api/v1
```

Genera el frontend:

```bash
npm run build
```

El resultado debe existir en `frontend/dist`.

## 2. Crear la aplicación en Hostinger

1. Entra al hPanel de Hostinger.
2. Abre **Websites > Add website > Node.js App**.
3. Selecciona la versión de Node.js 18 o superior.
4. Define el directorio de la aplicación como la raíz del proyecto, donde están
   `package.json`, `frontend/` y `backend/`.
5. Configura el dominio o subdominio que usará la tienda.
6. Guarda la aplicación y espera a que Hostinger prepare el entorno.

## 3. Subir el proyecto

Puedes usar Git, el administrador de archivos o SSH. Si utilizas Git:

```bash
git clone https://github.com/Mikato8/ERP-Mikato.git
cd ERP-Mikato
npm install
```

También debes subir el directorio `frontend/dist` generado con las variables
de producción. No subas archivos `.env` con secretos dentro del repositorio.

## 4. Variables de entorno

En la configuración de la aplicación Node.js define:

```env
PORT=4000
DATABASE_URL=postgresql://usuario:clave@host-pooler.region.neon.tech/neondb?sslmode=require
JWT_SECRET=una-clave-larga-y-secreta
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://tu-dominio.com
```

Las variables `VITE_*` deben existir durante `npm run build`, porque Vite las
inserta en los archivos estáticos. Las variables del backend deben existir en
el proceso que ejecuta `npm start`.

## 5. Comando de instalación y arranque

Desde el directorio raíz:

```bash
npm install
npm run build
npm start
```

El script `start` ejecuta `backend/src/server.js`. Express sirve la API bajo
`/api/v1` y el contenido estático de `frontend/dist`.

Hostinger puede asignar dinámicamente el puerto mediante `PORT`. El backend ya
lee esa variable; no fijes otro puerto en el código.

## 6. Dominio y HTTPS

1. Configura el dominio en Hostinger.
2. Activa el certificado SSL.
3. Cambia `CORS_ORIGIN` a la URL exacta del frontend.
4. Ejecuta en Neon `backend/sql/schema.sql` y `backend/sql/seed.sql` si la base
   de datos aún no tiene el esquema.

## 7. Comprobaciones posteriores

Comprueba primero la salud de la API:

```bash
curl https://tu-dominio.com/api/health
```

La respuesta esperada es similar a:

```json
{
  "status": "ok",
  "servicio": "ERP Mikato"
}
```

Después verifica:

- Carga del catálogo.
- Inicio de sesión por correo.
- Subida de una imagen desde `/admin`.
- Creación de un pedido.
- Cambio de estado y timeline.
- Fallback de rutas como `/producto/ID` al recargar.

Si aparece `Frontend no compilado`, revisa que `frontend/dist` exista en la
ubicación relativa a `backend/src/server.js`.
