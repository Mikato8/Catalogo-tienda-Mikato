import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.js';
import { uploadsDir } from './controllers/upload.js';
import routes from './routes/index.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(__dirname, '../../frontend/dist');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(morgan('combined'));

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
  console.log(`Servidor Mikato escuchando en ${env.port}`);
});
