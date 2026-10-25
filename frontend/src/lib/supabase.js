import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const getSupabaseStatus = () => {
  const configured = isSupabaseConfigured();
  return {
    configured,
    url: supabaseUrl && !supabaseUrl.includes('your-project-id')
      ? `${supabaseUrl.substring(0, 24)}...`
      : 'Not configured',
    hasKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes('your-anon-key')),
  };
};
