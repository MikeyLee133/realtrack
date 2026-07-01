# ADR-0007: Data-drive schedule, budget, and vendors per project

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

After the project basics were made per-project
([ADR-0006](0006-editable-per-project-basics.md)), three dashboard sections
were still static and identical for every project: the **construction schedule
stepper**, **budget by category**, and **vendors & contractors**. A brand-new
project showed a `0%` "Planning" hero above a static "framing 65%" schedule and
a `$358.4K` budget it never spent — the last and most visible inconsistency.

This is the "v2 — make the rest data-driven" milestone from HANDOFF §6.

## Decision

Make all three sections **per-project and editable**, reusing the established
repository + per-project-record pattern
([ADR-0003](0003-repository-layer-as-the-api-seam.md),
[ADR-0004](0004-scope-data-per-project.md)):

- New record kinds `schedule`, `budget`, `vendors`, each namespaced
  `realtrack.<projectId>.<kind>.v1`. The two demo projects seed distinct data
  (Maple Ridge full; Cedar Street earlier-stage); **new projects start empty**
  with empty states.
- **Budget is stored as numbers** (`{ categories:[{budget,spent}], contingency }`)
  and every roll-up is **derived** (`budgetTotals`): per-category bar %/color,
  total spent, % used (which now drives the hero "Budget Spent" KPI), and
  contingency remaining. Nothing derived is persisted (HANDOFF §4).
- **Editing follows the app's existing vocabulary**: a "+ Add" inline form per
  card, hover-reveal "×" to remove, and — for the schedule — click a phase to
  advance its status (upcoming → active → done), mirroring the task toggle.

## Consequences

- ✅ Every project now shows its own status, schedule, budget, and vendors; the
  dashboard is internally consistent. A new project reads as a genuine blank
  slate end-to-end.
- ✅ The budget KPI and contingency are correct by construction (derived), and
  unit-tested (`budget.test.js`).
- ✅ The Supabase migration stays a single pass over the now-complete data model
  ([ADR-0005](0005-supabase-for-production.md)) — these become three more
  RLS-scoped tables, no rework of what shipped earlier.
- ⚠️ Editing is add/remove (+ schedule status cycling), not full inline field
  editing of existing rows — consistent with tasks/docs today. Fine-grained
  edit/delete across all records is the remaining v2 polish (ROADMAP).
- ⚠️ Demo budget totals now reflect the actually-stored categories (e.g. Maple
  Ridge reads from its 5 categories) rather than the original mock's "$842K /
  12 categories" — a deliberate trade for honest, derived numbers.
