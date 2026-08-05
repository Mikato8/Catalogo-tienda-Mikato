# Configuración paso a paso de Supabase

Esta guía configura autenticación, base de datos, Row Level Security y
almacenamiento de imágenes para ERP Mikato.

## 1. Crear el proyecto

1. Entra en [supabase.com](https://supabase.com) y accede a tu cuenta.
2. Selecciona **New project**.
3. Elige una organización, un nombre como `erp-mikato` y una contraseña fuerte
   para la base de datos.
4. Selecciona la región más próxima a tus usuarios.
5. Espera a que el proyecto termine de provisionarse.
6. En **Project Settings > API** copia:
   - **Project URL**.
   - **anon public key**.
   - **service_role key**, únicamente para el backend.

## 2. Ejecutar el esquema y los datos iniciales

1. Abre **SQL Editor** en el proyecto.
2. Crea una consulta nueva.
3. Copia el contenido completo de `supabase/schema.sql`.
4. Ejecuta la consulta y confirma que no haya errores.
5. Crea otra consulta.
6. Copia el contenido completo de `supabase/seed.sql`.
7. Ejecuta la consulta.
8. En **Table Editor** verifica las tablas:
   `profiles`, `categories`, `products`, `orders`, `order_items` y
   `order_tracking`.

El esquema crea los tipos de estado, índices, trigger para perfiles, políticas
RLS y el bucket de imágenes.

## 3. Configurar autenticación por correo

1. Ve a **Authentication > Providers**.
2. Habilita **Email**.
3. Decide si quieres exigir confirmación de correo.
4. En **Authentication > URL Configuration** define:
   - **Site URL**: `http://localhost:5173` durante desarrollo.
   - **Redirect URLs**: `http://localhost:5173/**`.
5. Para producción añade el dominio final, por ejemplo:
   `https://tienda.tudominio.com/**`.

## 4. Habilitar Google OAuth

1. En Google Cloud Console crea o selecciona un proyecto.
2. Configura la pantalla de consentimiento OAuth.
3. Crea credenciales de tipo **OAuth Client ID** para una aplicación web.
4. En Supabase abre **Authentication > Providers > Google**.
5. Activa el proveedor.
6. Introduce el Client ID y el Client Secret de Google.
7. En Google añade como URI de redirección autorizada:

   ```text
   https://TU_PROYECTO.supabase.co/auth/v1/callback
   ```

8. En Supabase añade `http://localhost:5173` y el dominio productivo dentro de
   las URLs de redirección permitidas.

La aplicación invoca `signInWithOAuth({ provider: 'google' })` y Supabase
gestiona el callback.

## 5. Revisar el bucket de imágenes

El `schema.sql` crea automáticamente el bucket público:

```text
product-images
```

Comprueba en **Storage** que existe. Las políticas permiten:

- Lectura pública de las imágenes.
- Subida por perfiles con `role = 'admin'`.
- Actualización y eliminación por administradores.

Si el proyecto ya tenía políticas con los mismos nombres, elimínalas o
renómbralas antes de volver a ejecutar el bloque correspondiente.

## 6. Crear el primer administrador

1. Registra un usuario desde `/registro` o desde
   **Authentication > Users > Add user**.
2. Copia el UUID del usuario.
3. En SQL Editor ejecuta:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = 'UUID_DEL_USUARIO';
   ```

4. Cierra y vuelve a abrir sesión en la aplicación.
5. Comprueba que el usuario puede entrar en `/admin`.

No permitas que el navegador modifique directamente el rol. El cambio de rol
debe hacerse desde un entorno administrativo seguro.

## 7. Configurar los archivos `.env`

`frontend/.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
VITE_API_URL=http://localhost:4000/api/v1
```

`backend/.env`:

```env
PORT=4000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio
CORS_ORIGIN=http://localhost:5173
```

Nunca compartas la service role key ni la incluyas en variables `VITE_*`.
