import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabase = env.supabaseUrl && env.serviceKey
  ? createClient(env.supabaseUrl, env.serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  : null;
