import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.js';
import { uploadsDir } from './controllers/upload.js';
import { logInfo } from './lib/logger.js';
import routes from './routes/index.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(__dirname, '../../frontend/dist');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(morgan('combined'));

// Service worker de autodestrucción.
// Otra PWA (Porcicultura) llegó a registrarse en este dominio y su service worker
// seguía sirviendo su index.html cacheado por encima del catálogo de Mikato.
// Este worker no precachea nada: en su activación borra todos los caches, se
// desregistra y recarga las pestañas abiertas, de modo que el navegador vuelva a
// pedir todo al servidor. El navegador busca las actualizaciones de sw.js sin pasar
// por el service worker anterior, así que este reemplazo siempre llega.
const serviceWorkerAutodestruct = [
  "/* Mikato: limpia service workers heredados (PWA de otro proyecto). */",
  "self.addEventListener('install', () => self.skipWaiting());",
  "",
  "self.addEventListener('activate', (event) => {",
  "  event.waitUntil((async () => {",
  "    try {",
  "      const nombres = await caches.keys();",
  "      await Promise.all(nombres.map((nombre) => caches.delete(nombre)));",
  "    } catch (error) {",
  "      // Si el cacheo falla igual hay que desregistrar el worker.",
  "    }",
  "",
  "    try {",
  "      await self.registration.unregister();",
  "    } catch (error) {",
  "      // Sin registro no hay nada más que hacer.",
  "    }",
  "",
  "    const clientes = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });",
  "    for (const cliente of clientes) {",
  "      try {",
  "        await cliente.navigate(cliente.url);",
  "      } catch (error) {",
  "        // Pestañas cerradas o no navegables: se recargan solas al volver.",
  "      }",
  "    }",
  "  })());",
  "});",
  "",
].join('\n');

app.get('/sw.js', (_req, res) => {
  res.set({
    'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Service-Worker-Allowed': '/',
  });
  res.send(serviceWorkerAutodestruct);
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    servicio: 'ERP Mikato',
  });
});

app.use('/api/v1', routes);
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(frontend));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  return res.sendFile(
    path.join(frontend, 'index.html'),
    (error) => error && res.status(404).json({
      error: 'Frontend no compilado.',
    }),
  );
});

app.use(errorMiddleware);

app.listen(env.port, () => {
  logInfo('servidor_iniciado', { puerto: env.port });
});
