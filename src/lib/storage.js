// ── Storage primitive ────────────────────────────────────────────────
// The lowest-level read/write over browser localStorage, plus small id/date
// helpers. The repository (src/lib/repository.js) builds the namespaced,
// per-project data model on top of these. To make this production-ready,
// swap the bodies of load() / save() for authenticated API calls (see
// HANDOFF.md §3 and §5) — the repository's signatures stay the same.

export function load(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* storage full or unavailable — ignore in the prototype */
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// A UUID when available (so ids are valid for the Postgres `uuid` columns in
// the Supabase backend), with a string fallback for very old runtimes. Works
// as a localStorage key suffix too.
export function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Display label for "today", matching the prototype's `today()` helper.
export function todayLabel() {
  const d = new Date();
  return MONTHS[d.getMonth()] + ' ' + d.getDate();
}

// Parse an ISO 'YYYY-MM-DD' string to a local Date (noon-anchored to dodge
// timezone-offset rollovers). Returns null for empty/invalid input.
function parseISODate(iso) {
  if (!iso) return null;
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d) ? null : d;
}

// Format an ISO date for display, e.g. '2026-01-13' → 'Jan 13, 2026'.
// Falls back to an em dash for empty/unset dates.
export function formatDate(iso) {
  const d = parseISODate(iso);
  if (!d) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format a dollar amount in thousands, e.g. 78000 → '$78.0K', 0 → '$0'.
export function formatK(n) {
  const v = Number(n) || 0;
  if (v === 0) return '$0';
  return '$' + (v / 1000).toFixed(1) + 'K';
}

// Whole days from today until the target date (never negative). Returns null
// when there is no valid target — "days left" is derived, not stored.
export function daysUntil(iso) {
  const target = parseISODate(iso);
  if (!target) return null;
  target.setHours(0, 0, 0, 0); // compare calendar dates, not times
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target - startOfToday) / 86400000));
}
