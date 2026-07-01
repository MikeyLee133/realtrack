# ADR-0011: Loading and error states for the async backend

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

Making the repository async ([ADR-0009](0009-supabase-backend-scaffold.md)) left
two load points that could be slow or fail — the initial project list and each
project's records — with no UI for it. A failed Supabase fetch (network, expired
session, RLS) rendered a **silent empty screen** indistinguishable from "no data
yet," and a slow fetch showed nothing while it ran. The backend was ~90% done
without this.

## Decision

Track `loading` / `error` (initial projects) and `dataLoading` / `dataError`
(active project's records) in `useStore`, each with a retry action
(`reloadProjects`, `reloadData`). Surface them with shared `LoadingState` /
`ErrorState` components (spinner + a "Try again" button):

- **Picker** — shows a spinner while projects load and a retry card on error,
  instead of flashing the "no projects yet" empty state.
- **Dashboard** — gates the hero + sections on the active project's load, so a
  loading or failed project shows a spinner / retry rather than a misleading
  all-empty dashboard.

To avoid a spinner flashing on every project open in the near-instant local
backend, the dashboard spinner is **delayed ~180 ms** — it appears only for
genuinely slow (Supabase) loads.

## Consequences

- ✅ Failures are visible and recoverable (retry) instead of silent.
- ✅ Slow loads show a spinner; fast local loads show no flash.
- ✅ One pair of components serves both load points; the pattern extends to any
  future async surface.
- ⚠️ Errors are shown as a generic message + retry; there's no differentiated
  handling (e.g. auth-expired → re-login). Fine for now.
- The loading/error logic lives in the React store, so it's covered by the
  headless-Chrome verification rather than the node unit tests.
