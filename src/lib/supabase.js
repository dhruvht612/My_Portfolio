import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
/** Supabase “anon” JWT or newer publishable key — either works with createClient. */
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const urlOk = typeof supabaseUrl === 'string' && supabaseUrl.trim().length > 0
const keyOk = typeof supabaseAnonKey === 'string' && supabaseAnonKey.trim().length > 0

/** True when both URL and anon key are set (safe to call Supabase). */
export const isSupabaseConfigured = urlOk && keyOk

/**
 * Supabase browser client, or null when env vars are missing.
 * Avoids createClient(undefined, undefined) which throws.
 */
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim()) : null
