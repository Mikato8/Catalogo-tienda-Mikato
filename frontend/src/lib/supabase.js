import { createClient } from '@supabase/supabase-js';

export const configurado = Boolean(
  import.meta.env.VITE_SUPABASE_URL
  && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export const supabase = configurado
  ? createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  )
  : null;
