import { createClient } from '@supabase/supabase-js';

// The Supabase backend activates only when both env vars are set (see
// .env.example and docs/SUPABASE.md). With them absent, the app stays on the
// localStorage backend and never touches the network — so `npm run dev` works
// with zero configuration.
// `import.meta.env` is a real object under Vite and undefined under plain Node
// (the test runner), so read it defensively — this module is imported by the
// store, which the unit tests load.
const env = (import.meta && import.meta.env) || {};
const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

// Created lazily and only when configured, so importing this module is safe in
// local mode (no client, no connection attempt).
export const supabase = isSupabaseConfigured()
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
