# ADR-0003: A repository layer as the API seam

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

`HANDOFF §3` highlights that the prototype's persistence was deliberately
isolated in a few methods so it could be swapped for a real API "and the UI is
unchanged." We want to preserve and strengthen that property as the app grows
into multiple components and a multi-project model.

If components or the store called `localStorage` directly, the future backend
migration would touch dozens of files, and per-project isolation would be
enforced ad hoc in many places (easy to get wrong).

## Decision

Introduce **`src/lib/repository.js`** as the single data-access layer. It
exposes intent-level functions — `loadProjects`, `saveProjects`,
`loadTasks(projectId)`, `saveTasks(projectId, …)`, `loadDocs`, `saveDocs`,
`migrateLegacyKeys` — and is the only module that knows about storage keys.

- Above it: `useStore` calls the repository; components call `useStore`.
- Below it: today `storage.js` (localStorage). Tomorrow: a Supabase client.

## Consequences

- ✅ **The backend swap is one file.** Replace the function bodies with Supabase
  calls and make them `async`; signatures stay the same.
- ✅ **Isolation is centralized.** Only the repository builds keys, and it always
  includes `projectId` — there's no path for a component to read across
  projects. Verified by `repository.test.js`.
- ⚠️ Going async later means `useStore` adds `await`/loading states. Acceptable
  and localized; the component API (data + callbacks) is unaffected.
- The repository is plain functions (not a class/context) — trivially unit
  testable with an in-memory localStorage.
