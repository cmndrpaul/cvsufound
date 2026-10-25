// Reads the Supabase keys from .env.local.
// The "anon" key and the newer "publishable" key both work here.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

/** False until you add your keys, so the UI can still be previewed. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
