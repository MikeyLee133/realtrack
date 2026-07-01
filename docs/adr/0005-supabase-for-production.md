# ADR-0005: Supabase for the production backend

- **Status:** Accepted (planned) — not yet implemented
- **Date:** 2026-06-30

## Context

Production has hard privacy requirements (HANDOFF §1): login required, per-user
data isolation, encryption in transit and at rest, and private file storage with
signed URLs. We want one service that delivers all of these on a free tier
suitable for a single personal user, and that extends to multi-user sharing
later.

## Decision

Build the backend on **Supabase**:

- **Auth** (email/password or magic link) → "login required."
- **Postgres + Row-Level Security** → per-user isolation enforced at the
  database. Every row carries `owner_id`; policies restrict all access to
  `auth.uid() = owner_id`. Extends to sharing via a `project_members` table in
  v3.
- **Storage** (private bucket, signed expiring URLs) → documents, receipts,
  photos. Never a public bucket.
- Platform provides HTTPS + encryption at rest.

Tables: `projects` (with `owner_id`), `tasks`, `documents`, then later
`vendors`, `budget_categories`, `schedule_phases`, `project_members`. Every
child table carries `project_id`. Implementation is confined to the repository
([ADR-0003](0003-repository-layer-as-the-api-seam.md)).

## Consequences

- ✅ All §1 requirements met by one service; the app's per-project namespacing
  maps onto RLS query filters.
- ✅ Clear v3 path to invite-based sharing.
- ⚠️ Requires the owner's Supabase project + credentials and an auth UI — out of
  scope for the current local build, which is why it's planned, not done.
- ⚠️ Repository functions become async; `useStore` gains loading/error states.
- Firebase was considered as a free alternative but its non-SQL model and
  security-rule syntax are fiddlier for this per-user/per-project model
  (HANDOFF §5).
