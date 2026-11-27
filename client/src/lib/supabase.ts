import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  isValidUrl(supabaseUrl) &&
  !supabaseUrl.includes('your-project');

/**
 * Browser Supabase client.
 * Safely resolves to null if VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are unset.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
