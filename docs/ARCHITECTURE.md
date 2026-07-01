# Architecture

RealTrack is a single-page React app (Vite). It has no backend yet: all state
lives in the browser. The codebase is organized around **one rule** — the UI
never talks to storage directly. Everything flows through a thin stack of
layers so that the day we add a real backend, only the bottom layer changes.

## Layers

```
┌──────────────────────────────────────────────────────────────┐
│  Components            src/components/**                       │
│  Presentational React. Receive data + callbacks as props.      │
│  Hold only local UI state (which form is open, draft inputs).  │
└───────────────┬──────────────────────────────────────────────┘
                │ props (data) ▲   callbacks (intent) ▼
┌───────────────┴──────────────────────────────────────────────┐
│  Store          src/lib/useStore.js                            │
│  One hook = the app's brain. Owns projects/tasks/docs state,   │
│  the picker↔dashboard view, and all mutations. The React port  │
│  of the original design component's logic class.               │
└───────────────┬──────────────────────────────────────────────┘
                │ await load/save(projectId, …)
┌───────────────┴──────────────────────────────────────────────┐
│  Backend seam   src/lib/backend.js          ← THE SWAP        │
│  Picks the repository from the env; uniformly async.          │
└───────┬───────────────────────────────────┬──────────────────┘
        │ (default — no env)                 │ (env vars set)
┌───────┴─────────────────────────┐ ┌────────┴──────────────────┐
│ repository.js → storage.js       │ │ supabaseRepository.js      │
│ localStorage, per-project keys,  │ │ Postgres + RLS + Storage   │
│ demo-data purge, uid/dates.      │ │ (auth.uid() owns rows).    │
└──────────────────────────────────┘ └────────────────────────────┘
```

Supporting modules:

- **`src/data/seed.js`** — empty defaults + fixed UI scaffolding only (no
  mock data). Record shapes live in `src/lib/types.js`.
- **`src/lib/tokens.js`** — design tokens (colors, fonts) from HANDOFF §7.
- **`src/lib/types.js`** — JSDoc typedefs: the data contract.
- **`src/lib/supabaseRepository.js` / `supabaseClient.js` / `auth.js`** — the
  optional Supabase backend (see [SUPABASE.md](SUPABASE.md) and
  [ADR-0009](adr/0009-supabase-backend-scaffold.md)).

## Data flow (one mutation, end to end)

Checking off a task:

1. `Tasks.jsx` renders a row with `onClick={() => toggleTask(task.id)}`.
2. `useStore.toggleTask(id)` updates the `tasks` state immutably **and** calls
   `repo.saveTasks(activeId, next)`.
3. `repository.saveTasks` writes to `realtrack.<activeId>.tasks.v1`.
4. React re-renders. The `OPEN TASKS` KPI in `Dashboard.jsx` is derived from
   `tasks` via `useMemo`, so it updates automatically — no separate counter
   state to keep in sync.

## Why the repository seam matters

The repository exposes intent-level functions (`loadTasks(projectId)`,
`saveTasks(projectId, tasks)`, `loadProjects()`, …) — never raw keys. Two
payoffs:

1. **Per-project isolation is enforced in one place.** A component can't
   accidentally read another project's data because it never names a key.
2. **The backend migration is a single-file change.** Swap the bodies of the
   repository functions for Supabase client calls (`HANDOFF §5`) and add
   `async/await`; `useStore` and every component stay as they are. See
   [ADR-0003](adr/0003-repository-layer-as-the-api-seam.md).

## State ownership

| State | Lives in | Why |
|---|---|---|
| `projects`, `tasks`, `docs`, `activeId`, `view` | `useStore` | App data + navigation; shared across the tree. |
| Photo data URLs | `ImageSlot` (per slot) + localStorage | Self-contained widget; keyed by `projectId` + slot id. |
| Form open/draft state | the card that owns the form | Pure UI; no reason to lift it. |

## Conventions

- **Presentational components stay dumb.** If a component needs data or needs
  to change data, it takes a prop from `useStore`; it does not import the
  repository or storage.
- **Immutable updates.** Mutations build a new array/object and hand it to both
  `setState` and the repository in the same step.
- **Styling** is inline style objects with values from `tokens.js`, matching the
  source design component. Hover affordances live in `styles.css`.
