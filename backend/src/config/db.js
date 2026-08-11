import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const dbConfigurado = Boolean(env.databaseUrl);

export const pool = dbConfigurado
  ? new Pool({
    connectionString: env.databaseUrl,
    ssl: env.databaseUrl.includes('sslmode=require') || env.databaseUrl.startsWith('postgres://')
      ? { rejectUnauthorized: false }
      : false,
  })
  : null;

export async function consultar(text, params = []) {
  if (!pool) {
    const error = new Error('Base de datos no configurada: no hay datos disponibles.');
    error.status = 503;
    throw error;
  }

  const { rows } = await pool.query(text, params);
  return rows;
}
