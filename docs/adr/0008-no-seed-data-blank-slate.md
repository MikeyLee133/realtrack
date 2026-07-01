# ADR-0008: No seed data — blank-slate app

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

Through ADRs 0004–0007 the app became fully per-project and editable, but it
still shipped **two seeded demo projects** (Maple Ridge, Cedar Street) with
example tasks, documents, schedule, budget, and vendors. That demo data was
useful while building the UI, but the product is a private, single-user tool:
the owner wants to enter all of their own information, not delete sample data
first.

## Decision

Remove **all** seed/mock data. The app boots to a blank slate:

- `loadProjects()` returns `[]` — the project list starts empty and the user
  creates every project. The picker shows a "Start your first project" empty
  state.
- All demo seed functions and the `demoSeed` registry are deleted; a project's
  records always start from the empty default (`[]`, or `emptyBudget`).
- `purgeDemoData()` runs once on boot to clear demo projects and their records
  from any browser that opened an earlier build (idempotent, flag-guarded). It
  replaces the now-obsolete legacy-key migration.
- Hard-coded mock strings that implied a specific project are removed: the fake
  "Dana Keller / Project Owner" sidebar user → a neutral "Project Owner / Local
  workspace"; the "NEW CONSTRUCTION · CUSTOM RESIDENCE" topbar eyebrow → the
  project's own code; the photo-log's fixed "JUN 2026" → a "Drag & drop" hint;
  stage-specific photo placeholders → generic "Add a photo".

## Consequences

- ✅ A fresh install is genuinely empty; the user enters 100% of the data.
- ✅ Nothing to delete first; no sample project masquerading as real data.
- ✅ Existing demo data is cleaned up automatically (`purgeDemoData`).
- ⚠️ The two demo projects no longer exist to make the app "look full" on first
  run — by design. The picker empty state guides the user to create one.
- The data shapes (`src/lib/types.js`, HANDOFF §4) are unchanged; only the
  source of the first records changed (user input instead of seed).
