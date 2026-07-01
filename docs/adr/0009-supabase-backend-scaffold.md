# ADR-0009: Supabase backend behind the repository seam

- **Status:** Accepted (scaffolded; activate with credentials)
- **Date:** 2026-06-30

## Context

Persistence has been browser `localStorage` throughout v1/v2 — fine for building
the UI, but it fails the handoff's hard requirement (HANDOFF §1): login,
per-user isolation, encryption, and private file storage. [ADR-0005](0005-supabase-for-production.md)
chose Supabase for this. With the data model now complete (ADRs 0004–0008), the
backend can be added in a single pass.

Standing up Supabase needs the owner's account + credentials, which we don't
have. But everything that doesn't need secrets can be built and left ready to
activate.

## Decision

Add the Supabase backend **behind the existing repository seam**
([ADR-0003](0003-repository-layer-as-the-api-seam.md)), keeping localStorage as
the zero-config default:

- **SQL migrations** (`supabase/migrations/`): the six tables, each with
  `owner_id default auth.uid()` + `project_id`; RLS policies scoping all access
  to the owner; a private `files` storage bucket + policies.
- **`supabaseRepository.js`**: an async implementation of the same contract as
  `repository.js`, mapping rows ⇄ app objects and treating "save a collection"
  as replace-the-project's-rows. RLS (not client code) enforces isolation.
- **`backend.js`**: selects localStorage vs Supabase from
  `isSupabaseConfigured()` (two env vars) and exposes a uniformly **async**
  interface. The repository contract became async so `useStore` awaits loads
  without caring which backend is live.
- **Auth**: `auth.js` + a `Login` screen gated by `AuthGate` in `App.jsx`,
  rendered only when Supabase is configured. Local mode skips auth entirely.
- `uid()` now returns a UUID, valid for the Postgres `uuid` id columns.

## Consequences

- ✅ The app still runs with `npm run dev` and zero config (localStorage); all
  tests pass. Activating the backend is: run two SQL files + set two env vars.
- ✅ Per-user isolation is enforced at the database (RLS), the strongest place —
  not in app code.
- ✅ `useStore` and every component are unchanged in spirit; only loads became
  awaited. The seam paid off exactly as intended.
- ⚠️ Bundle size grows (~+115 KB gz) from `@supabase/supabase-js`, imported
  regardless of mode. Acceptable; could be lazy-loaded later.
- ⚠️ File uploads (ImageSlot, documents) aren't wired to Storage yet — schema,
  bucket, and helpers exist; the UI still uses the localStorage path. Tracked in
  docs/SUPABASE.md + ROADMAP.
- ⚠️ Not runtime-verified end-to-end against a live Supabase project (needs
  credentials); verified only that local mode is unaffected.
