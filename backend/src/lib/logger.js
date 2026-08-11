import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROYECTO = path.resolve(__dirname, '../..');

export const logDir = process.env.LOG_DIR
  || path.join(PROYECTO, 'logs');

const niveles = { debug: 10, info: 20, warn: 30, error: 40 };

export function nivelActual() {
  return (process.env.LOG_LEVEL || 'info').toLowerCase();
}

function nivelMinimo() {
  return niveles[nivelActual()] ?? niveles.info;
}

function asegurarDirectorio() {
  fs.mkdirSync(logDir, { recursive: true });
}

function rutaArchivo() {
  const hoy = new Date().toISOString().slice(0, 10);
  return path.join(logDir, `app-${hoy}.log`);
}

function escribir(nivel, evento, datos) {
  if (niveles[nivel] < nivelMinimo()) {
    return;
  }

  const entrada = {
    ts: new Date().toISOString(),
    nivel,
    evento,
    ...datos,
  };

  const linea = `${JSON.stringify(entrada)}\n`;

  asegurarDirectorio();
  fs.appendFileSync(rutaArchivo(), linea, 'utf8');

  const espejo = nivel === 'error' || nivel === 'warn'
    ? process.stderr
    : process.stdout;
  espejo.write(linea);
}

export function logInfo(evento, datos = {}) {
  escribir('info', evento, datos);
}

export function logWarn(evento, datos = {}) {
  escribir('warn', evento, datos);
}

export function logError(error, contexto = {}) {
  escribir('error', 'error', {
    ...contexto,
    message: error?.message || error,
    stack: error?.stack,
  });
}