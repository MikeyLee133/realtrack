# ADR-0006: Editable, per-project project basics

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

After per-project scoping of tasks/docs/photos
([ADR-0004](0004-scope-data-per-project.md)), the dashboard's **hero** —
status, current phase, % complete, start/target dates — was still hard-coded to
Maple Ridge's values and rendered identically for every project, including
brand-new empty ones. The owner wants each project to carry its own status and
timeline, with the name (and the rest of the basics) decided by the user and
saved.

The remaining static sections (schedule stepper, budget categories, vendors)
are larger and were explicitly deferred for now.

## Decision

Make the **project basics** per-project and user-editable:
`name`, `address`, `status` (now including a `Planning` state), `phaseLabel`,
`percent`, `startDate`, `targetDate`.

- Dates are stored as ISO `YYYY-MM-DD`; the hero formats them for display and
  **derives "days left"** from `targetDate` (`daysUntil`) rather than storing a
  stale number — matching the production guidance to use real dates (HANDOFF §6
  step 6).
- A new project starts **empty/zeroed**: `Planning`, `0%`, blank dates (shown as
  `—`). The two demo projects keep rich example data.
- Editing is via an **Edit Project modal** opened from the hero; `useStore`
  gains an `updateProject(id, patch)` mutation that merges and persists through
  the repository's `saveProjects` (so the picker cards and sidebar update too).

The schedule stepper, budget, and vendors remain static for now (see ROADMAP
v2). This keeps the change focused and ships value without the larger editors.

## Consequences

- ✅ Each project shows its own status/phase/completion/timeline; the picker
  cards reflect edits immediately (same `projects` source of truth).
- ✅ "Days left" is always correct relative to today; no hard-coded number.
- ✅ Project name is fully user-owned: set on create, editable after, persisted
  in `realtrack.projects.v1`.
- ⚠️ A new project still shows the static schedule/budget/vendors block, which
  can look inconsistent next to its `0%` hero. Documented as the v2 follow-up.
- Pure date helpers (`formatDate`, `daysUntil`) are unit-tested
  (`storage.test.js`).
