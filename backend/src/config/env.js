import 'dotenv/config';

export const env = {
  port: process.env.PORT || 4000,
  supabaseUrl: process.env.SUPABASE_URL,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
