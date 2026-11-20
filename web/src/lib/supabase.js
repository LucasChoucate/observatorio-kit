import { createClient } from '@supabase/supabase-js';

// Somente chaves públicas. A anon key é protegida pelo RLS (leitura apenas).
// NUNCA usar a service_role no frontend.
const url = import.meta.env.VITE_SUPABASE_URL;
const chaveAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && chaveAnon);

if (!supabaseConfigurado) {
  console.error(
    'Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em ' +
      'web/.env.local (local) ou nas Environment Variables da Vercel.',
  );
}

export const supabase = supabaseConfigurado ? createClient(url, chaveAnon) : null;
