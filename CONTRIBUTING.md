# Contributing

A short guide to working in this codebase. For the *why* behind the structure,
read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and the
[ADRs](docs/adr/).

## Setup

```bash
npm install
npm run dev      # Vite dev server
npm test         # node --test (repository unit tests)
npm run build    # production build
```

Requires Node 18+ (uses the built-in test runner). No other services needed —
v1 persists to the browser.

## Project layout

```
index.html                 # Vite entry; fonts + favicon
src/
  main.jsx                 # React bootstrap
  App.jsx                  # picker ↔ dashboard switch
  styles.css               # global styles + hover affordances
  lib/
    storage.js             # localStorage primitive + uid/date helpers
    repository.js          # ← data-access layer (the backend seam)
    repository.test.js     # unit tests for the above
    useStore.js            # the app's state + mutations
    tokens.js              # design tokens (colors, fonts)
    types.js               # JSDoc typedefs (the data contract)
  data/
    seed.js                # empty defaults + fixed UI scaffolding (no mock data)
  components/
    ProjectPicker.jsx
    Dashboard.jsx
    ImageSlot.jsx          # drag-and-drop photo widget
    dashboard/             # dashboard sections (Hero, Schedule, Budget, …)
docs/                      # architecture, data model, roadmap, ADRs
```

## The one rule

**Components never touch storage.** Data and callbacks come from `useStore`;
`useStore` is the only caller of the repository; the repository is the only
caller of `storage`. If you find yourself importing `storage.js` or
`localStorage` from a component, add a repository function instead.

See [ADR-0003](docs/adr/0003-repository-layer-as-the-api-seam.md).

## Conventions

- **Per-project data** is keyed by `project_id` in the repository. Never
  introduce a global record key. ([ADR-0004](docs/adr/0004-scope-data-per-project.md))
- **Immutable state updates**, mirrored to the repository in the same step:
  ```js
  setTasks(prev => { const next = [...]; repo.saveTasks(activeId, next); return next; });
  ```
- **Derive, don't duplicate.** KPI counts come from `useMemo` over tasks/docs,
  not separate state.
- **Styling** uses inline style objects with values from `tokens.js`. Keep
  hover-only styles in `styles.css`.
- **Types:** annotate new data shapes in `src/lib/types.js`.

## Tests

Add tests for any logic in the repository or other pure modules. Tests use
`node:test` + `node:assert` with an in-memory `localStorage` (see
`repository.test.js`) — no framework, no new dependencies. Run `npm test`.

## Adding an architecture decision

For a non-trivial change to structure, storage, or the data model, add an ADR:
copy the format of an existing file in `docs/adr/`, give it the next number, and
link it from `docs/README.md`.
