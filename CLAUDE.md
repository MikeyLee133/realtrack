# CLAUDE.md

Orientation for AI assistants (and humans) working in this repo. Read this
first; follow the links into `docs/` for depth.

## What this is

**RealTrack** — a local-first, per-project construction project tracker
(React + Vite; no other framework). Ported from a Claude Design component. Runs
on browser storage by default; an optional **Supabase** backend adds auth +
private file storage. Live at **https://realtrack.mikeylee.io**.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm test` | All tests: `test:unit` + `test:components` |
| `npm run test:unit` | Pure-logic unit tests — Node's built-in runner on `*.test.js` |
| `npm run test:components` | Component/integration tests — Vitest + jsdom on `*.test.jsx` |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the build locally |
| `./deploy/deploy-droplet.sh` | Build + rsync to the droplet (see `docs/DEPLOY.md`) |

## The one architectural rule

**Components never touch storage.** Data and callbacks come from `useStore`;
only `useStore` calls the backend; only the backend calls storage. If you find
yourself importing `storage.js` / `localStorage` / a repository from a
component, add a `useStore` method instead. See `docs/ARCHITECTURE.md` and
`docs/adr/0003-repository-layer-as-the-api-seam.md`.

## Where things live

- `src/lib/backend.js` — **the swap seam**: localStorage (default) vs Supabase (when `VITE_SUPABASE_*` env is set); uniformly async.
- `src/lib/repository.js` / `supabaseRepository.js` — the two backends behind it.
- `src/lib/useStore.js` — app state + every mutation (the "brain").
- `src/lib/fileStore.js` — binary files (IndexedDB locally / Supabase Storage).
- `src/lib/backup.js` — JSON export/import.
- `src/lib/types.js` — JSDoc data contract.
- `src/components/**` — presentational; dashboard sections in `dashboard/`.
- `supabase/migrations/` — schema + Row-Level Security + storage bucket.
- `docs/` — architecture, data model, roadmap, and ADRs (0001–0015).

## Conventions

- **Inline style objects** using tokens from `src/lib/tokens.js`. Responsive via `useIsMobile` (branch styles, no CSS media queries — inline styles win specificity).
- **No seed/mock data** — the app starts empty; a new project starts empty (ADR-0008).
- **Per-project** data keyed by project id; the backend/RLS enforces isolation.
- **Immutable** state updates, mirrored to the backend in the same step.
- **Derive, don't store** — KPIs and budget roll-ups are computed, never persisted.
- Add a unit test for any pure logic; annotate new data shapes in `types.js`.
- A significant decision gets an **ADR** in `docs/adr/` (copy the format, next number, link from `docs/README.md`).

## Gotchas

- The backend contract is **async** — `useStore` awaits loads; loads have loading/error states (ADR-0011).
- `VITE_SUPABASE_*` is read at **build time** — changing the backend needs a rebuild/redeploy.
- Attached **files are not in the JSON backup** (structured data only).
- On mobile the sidebar collapses to a top bar and drops the section nav (ADR-0014).
- **Two test runners:** pure logic → `node --test` on `*.test.js` (no JSX); components/integration → Vitest + jsdom on `*.test.jsx`. `npm test` runs both. Component tests drive the real app through the store; scope queries to a section via its `sec-<id>` anchor (see `src/App.test.jsx`).
