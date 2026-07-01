# RealTrack documentation

Start here. These docs explain how the app is built and where it's going.

| Doc | What it covers |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | The layered design (components → store → repository → storage), data flow, and conventions. |
| [DATA-MODEL.md](DATA-MODEL.md) | Entities, relationships, the per-project storage-key scheme, and the isolation model. |
| [ROADMAP.md](ROADMAP.md) | v1/v2/v3 build order (from HANDOFF §6) with current status and known limitations. |
| [adr/](adr/) | Architecture Decision Records — *why* the code is shaped this way. |

Related, at the repo root:

- [`../README.md`](../README.md) — quickstart, scripts, project layout.
- [`../HANDOFF.md`](../HANDOFF.md) — the product/privacy/data plan from the
  original design handoff (the source of truth for production requirements).
- [`../CONTRIBUTING.md`](../CONTRIBUTING.md) — how to work in the codebase.
- [`../CHANGELOG.md`](../CHANGELOG.md) — notable changes.

## Decision records

- [ADR-0001](adr/0001-record-architecture-decisions.md) — Record architecture decisions
- [ADR-0002](adr/0002-localstorage-persistence-for-v1.md) — Browser localStorage for v1 persistence
- [ADR-0003](adr/0003-repository-layer-as-the-api-seam.md) — A repository layer as the API seam
- [ADR-0004](adr/0004-scope-data-per-project.md) — Scope tasks, documents, and photos per project
- [ADR-0005](adr/0005-supabase-for-production.md) — Supabase for the production backend
- [ADR-0006](adr/0006-editable-per-project-basics.md) — Editable, per-project project basics
- [ADR-0007](adr/0007-data-drive-schedule-budget-vendors.md) — Data-drive schedule, budget, and vendors per project
- [ADR-0008](adr/0008-no-seed-data-blank-slate.md) — No seed data — blank-slate app
- [ADR-0009](adr/0009-supabase-backend-scaffold.md) — Supabase backend behind the repository seam
- [ADR-0010](adr/0010-file-storage-uploads.md) — File storage for photos and document attachments
- [ADR-0011](adr/0011-async-loading-and-error-states.md) — Loading and error states for the async backend
- [ADR-0012](adr/0012-json-backup-export-import.md) — JSON backup — export / import
- [ADR-0013](adr/0013-delete-and-search.md) — Delete actions and document search
- [ADR-0014](adr/0014-responsive-mobile-layout.md) — Responsive / mobile layout
- [ADR-0015](adr/0015-static-spa-deployment.md) — Static SPA deployment
- [ADR-0016](adr/0016-gantt-timeline.md) — Gantt timeline for the schedule

## Backend & hosting

- [SUPABASE.md](SUPABASE.md) — set up the optional Supabase backend (auth, RLS, private storage).
- [DEPLOY.md](DEPLOY.md) — deploy the app to Vercel / Netlify / any static host.
