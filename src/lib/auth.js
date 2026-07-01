import { supabase } from './supabaseClient.js';

// Thin auth helpers over Supabase Auth (email/password). Used only when
// Supabase is configured; in local mode the app skips auth entirely.

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Subscribe to auth changes. Returns an unsubscribe function.
export function onAuthChange(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email, password) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}
