# ADR-0004: Scope tasks, documents, and photos per project

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

The first cut of the app had a working project picker, but tasks and documents
were stored under two global keys (`mr204.tasks.v1`, `mr204.docs.v1`) inherited
from the single-project prototype. Every project opened the same shared list —
so creating "Cedar Street" and adding a task also changed "Maple Ridge."
Photos had the same problem (global slot keys).

This contradicts the product's core promise (HANDOFF: "the owner runs multiple
projects… architect data as multi-project from day one") and is the exact bug a
user hits within the first minute. It is also a correctness prerequisite for the
backend: a multi-tenant schema can't be bolted on cleanly over shared state.

## Decision

Namespace every interactive record by `project_id`:

- `realtrack.<projectId>.tasks.v1`
- `realtrack.<projectId>.docs.v1`
- `realtrack.<projectId>.image-slot.<slotId>`

The repository ([ADR-0003](0003-repository-layer-as-the-api-seam.md)) loads the
active project's slice when the project changes; `useStore` re-fetches on
`activeId` change. Demo projects seed distinct data; user-created projects start
empty (with empty states). Legacy global keys migrate once into the `mr204`
namespace.

## Consequences

- ✅ Projects are truly isolated locally; opening a different project swaps in
  its own tasks/docs/photos. KPI counters (derived) update accordingly.
- ✅ The key scheme maps 1:1 onto production query filters
  (`where project_id = …`), so the Supabase migration is mechanical.
- ✅ New behavior is covered by `repository.test.js` (namespacing, isolation,
  seeding, migration).
- ⚠️ Static dashboard sections (hero, schedule, budget, vendors) are still
  shared/identical across projects — they are display-only until v2
  (see ROADMAP). Scoping them is deferred, not forgotten.
