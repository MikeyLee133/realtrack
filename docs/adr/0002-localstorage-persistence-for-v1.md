# ADR-0002: Browser localStorage for v1 persistence

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

The imported design component persisted user input to `localStorage`. Turning it
into a "faithful frontend app" (the chosen scope) means a runnable app with the
same interactivity, without yet standing up the production backend — which
requires the owner's Supabase account, credentials, and auth decisions
(`HANDOFF §5`).

We need persistence that: works with zero infrastructure, survives reloads, and
doesn't lock us out of the eventual backend.

## Decision

Persist all interactive data (projects, tasks, documents, photos) to
`localStorage` for v1, **behind the repository layer** ([ADR-0003](0003-repository-layer-as-the-api-seam.md))
so it is the only thing that has to change later.

## Consequences

- ✅ The app runs with `npm install && npm run dev` — no accounts, no secrets.
- ✅ Faithful to the prototype's behavior.
- ⚠️ **Not private-grade**: single device, no auth, no encryption, no sync. This
  is explicitly *not* production-ready (HANDOFF §1/§3). The prototype banners and
  docs say so.
- ⚠️ Photos are stored as data URLs, which is fine for a few images but is not
  how production should handle files (private bucket + signed URLs).
- The migration path is owned by [ADR-0005](0005-supabase-for-production.md).
