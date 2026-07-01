# RealTrack — Construction Project Tracker

**Live: [realtrack.mikeylee.io](https://realtrack.mikeylee.io)**

A real-estate, new-construction project dashboard. This is a faithful frontend
port of the **Project Tracker** design component (`claude.ai/design`) into a
runnable React + Vite app. It reproduces the original UI and interactivity:

- **Project picker** — list projects, create new ones, click to open a dashboard.
- **Dashboard** — hero status, live KPI counters, a 9-phase construction schedule
  stepper, budget-by-category bars, documents & receipts, tasks, vendors, and a
  drag-and-drop photo progress log.
- **Interactive + persisted** — add/check off tasks, add documents, and drop
  photos. Everything is saved to the browser's `localStorage`.

## Run

```bash
npm install
npm run dev      # start the dev server (Vite prints the local URL)
npm test         # run unit tests (node --test)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Architecture

The app is layered so the UI never touches storage directly — everything flows
through a repository that can be swapped for a real backend without changing a
single component. Full write-up in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

```
components → useStore → backend ─┬─ repository → storage (localStorage, default)
                                 └─ supabaseRepository (Postgres + RLS, when configured)
```

| Path | Role |
|---|---|
| `src/lib/storage.js` | Low-level `load()` / `save()` over `localStorage` + `uid`/date helpers. |
| `src/lib/repository.js` | localStorage backend — per-project record access, empty baselines, demo-data purge. |
| `src/lib/backend.js` | **The swap seam.** Selects localStorage vs Supabase from the env; uniformly async. |
| `src/lib/supabaseRepository.js` | Supabase backend (Postgres + RLS + Storage). See [docs/SUPABASE.md](docs/SUPABASE.md). |
| `src/lib/useStore.js` | Central store hook (React port of the prototype's logic class): projects, tasks, docs + mutations. |
| `src/lib/types.js` | JSDoc typedefs — the data contract. |
| `src/data/seed.js` | Empty defaults + fixed UI scaffolding only — no mock data (the app starts blank). |
| `src/lib/tokens.js` | Design tokens (colors, fonts) from `HANDOFF.md §7`. |
| `src/components/` | `ProjectPicker`, `Dashboard`, the reusable `ImageSlot`, and the dashboard sections. |

### Documentation

- **[docs/](docs/)** — architecture, data model, roadmap, and decision records (ADRs).
- **[HANDOFF.md](HANDOFF.md)** — the production/privacy/data plan from the design handoff.
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — how to work in the codebase.
- **[CHANGELOG.md](CHANGELOG.md)** — notable changes.

## Deploy

It's a static Vite SPA — host it anywhere. Config for Vercel (`vercel.json`) and
Netlify (`netlify.toml`) is in the repo; connect the repo and you get a URL.
Step-by-step (incl. self-host and env vars) in **[docs/DEPLOY.md](docs/DEPLOY.md)**.

## Optional Supabase backend

By default the app persists to browser `localStorage` (single device, no auth).
A **Supabase backend is scaffolded** — auth, per-user isolation via Row-Level
Security, and private file storage — and activates by setting two env vars (no
code changes). See **[docs/SUPABASE.md](docs/SUPABASE.md)**.

## Status vs. production

The default (localStorage) build is a **single-user, multi-project,
private-by-design** shell, but browser-local persistence is **not private-grade**
(no auth, no encryption, no per-user isolation). Configuring Supabase
(docs/SUPABASE.md) is what makes it private-grade; wiring file uploads to Storage
is the last remaining step.
