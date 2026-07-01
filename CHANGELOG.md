# Changelog

All notable changes to this project are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **Deployment config.** Host-neutral static-deploy setup (`vercel.json`,
  `netlify.toml` with SPA fallback) + `docs/DEPLOY.md`, so the app can go live on
  a real URL local-first or Supabase-backed. ([ADR-0015](docs/adr/0015-static-spa-deployment.md))
- **Responsive / mobile layout.** The app now works on a phone: the sidebar
  becomes a compact top bar and every multi-column layout stacks to one column
  (no horizontal overflow). Driven by a `useIsMobile` hook.
  ([ADR-0014](docs/adr/0014-responsive-mobile-layout.md))
- **Delete actions everywhere.** Remove tasks and documents (hover-`×`), and
  delete whole projects from the picker (with a confirm). Deleting a document or
  project also cleans up its files. ([ADR-0013](docs/adr/0013-delete-and-search.md))
- **Working document search.** The topbar search box now filters the Documents
  & Receipts list (was decorative). ([ADR-0013](docs/adr/0013-delete-and-search.md))
- **JSON backup — export / import.** Download all projects + records as a JSON
  file and restore it later (merges by project id, non-destructive). A safety net
  against browser wipes; works in both backends. Attached files aren't included.
  ([ADR-0012](docs/adr/0012-json-backup-export-import.md))
- **Loading and error states for the async backend.** The picker and dashboard
  now show a spinner while data loads and a retry card if a load fails, instead
  of a silent empty screen. The dashboard spinner is delayed so the near-instant
  local backend never flashes it. ([ADR-0011](docs/adr/0011-async-loading-and-error-states.md))
- **File uploads with a proper storage layer** (`fileStore.js`): progress photos
  and document attachments now persist via IndexedDB locally / the private
  Supabase bucket when configured. Documents can attach a file (with a **View**
  action); the doc add form gained a file picker.
  ([ADR-0010](docs/adr/0010-file-storage-uploads.md))
- **Supabase backend (scaffolded, behind the repository seam).**

### Fixed
- **Photos no longer silently vanish.** They were stored as base64 in
  localStorage and overflowed its ~5 MB quota; they now live in IndexedDB
  (or Supabase Storage). ([ADR-0010](docs/adr/0010-file-storage-uploads.md)) SQL migrations
  (tables + Row-Level Security + a private storage bucket), an async
  `supabaseRepository`, a `backend.js` selector, email/password auth + a login
  gate, and `docs/SUPABASE.md`. The app stays on localStorage by default and
  switches to Supabase when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are
  set — no code changes. ([ADR-0009](docs/adr/0009-supabase-backend-scaffold.md))

### Changed
- The repository contract is now **async** (`useStore` awaits loads), so one
  interface serves both backends. `uid()` returns a UUID (valid for Postgres).
- **Blank-slate app: removed all seed/mock data.** The project list starts
  empty and the user creates and fills in every project; the picker shows a
  "Start your first project" empty state. Removed the two demo projects and all
  seeded records, plus hard-coded mock strings (the fake sidebar user, the
  topbar eyebrow, the photo-log date, stage-specific photo labels).
  ([ADR-0008](docs/adr/0008-no-seed-data-blank-slate.md))

### Added
- **`purgeDemoData`** — one-time cleanup that clears demo projects/records left
  by earlier builds (replaces the legacy-key migration); unit-tested.
- **Per-project, editable schedule, budget, and vendors.** The construction
  schedule stepper, budget-by-category, and vendor list are now per-project with
  add/remove editing (and click-to-advance phase status); new projects start
  empty. Budget roll-ups — total spent, % used (drives the hero KPI), and
  contingency remaining — are derived from stored numbers, never persisted.
  ([ADR-0007](docs/adr/0007-data-drive-schedule-budget-vendors.md))
- **`budgetTotals` + `formatK`** helpers, with unit tests.
- **Editable, per-project project basics.** Status (now incl. a `Planning`
  state), current phase, % complete, and ISO start/target dates are stored per
  project and edited via a new **Edit Project** modal; "days left" is derived
  from the target date instead of hard-coded. The project name/address are
  user-owned and saved with the rest. ([ADR-0006](docs/adr/0006-editable-per-project-basics.md))
- **`updateProject` mutation** in the store, persisting through the repository.
- **Date helpers** (`formatDate`, `daysUntil`) with unit tests.
- **Per-project data scoping.** Tasks, documents, and photos are now namespaced
  by `project_id` (`realtrack.<projectId>.<kind>.v1`); opening a different
  project shows its own records. ([ADR-0004](docs/adr/0004-scope-data-per-project.md))
- **Repository data-access layer** (`src/lib/repository.js`) — the single seam
  between the UI and storage, designed to be swapped for a backend without
  touching components. ([ADR-0003](docs/adr/0003-repository-layer-as-the-api-seam.md))
- **Distinct demo seed data** for the second demo project (Cedar Street), so
  per-project isolation is visible on first run.
- **Empty states** for tasks and documents on newly created projects.
- **Legacy-key migration**: the prototype's global `mr204.*` keys are moved into
  the per-project namespace once, without clobbering newer data.
- **Unit tests** (`npm test`, `node:test`) covering namespacing, isolation,
  seeding, and migration.
- **Documentation set**: `docs/ARCHITECTURE.md`, `docs/DATA-MODEL.md`,
  `docs/ROADMAP.md`, ADRs 0001–0005, `CONTRIBUTING.md`, and JSDoc typedefs
  (`src/lib/types.js`).

### Changed
- The dashboard **hero** (status, phase, completion bar, dates) now renders from
  the active project instead of fixed values; new projects start `Planning · 0%`.
- Photos are now stored per project (previously a single global set of slots).
- Prototype banners updated to state that data is scoped per project.

## [0.1.0] — 2026-06-30

### Added
- Initial faithful port of the **Project Tracker** design component to a
  React + Vite app: project picker and dashboard (hero, KPIs, schedule stepper,
  budget, documents/receipts, tasks, vendors, photo log).
- Interactive + persisted via `localStorage`. ([ADR-0002](docs/adr/0002-localstorage-persistence-for-v1.md))
