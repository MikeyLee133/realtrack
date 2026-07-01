# Data Model

The authoritative field-level shapes are the JSDoc typedefs in
[`src/lib/types.js`](../src/lib/types.js) and HANDOFF §4. This document covers
how those entities relate, how they're keyed, and how isolation works.

## Entities & relationships

```
                       ┌─────────────┐
                       │   Project   │   many per user (prod: + owner_id)
                       │  id, name…  │
                       └──────┬──────┘
            project_id (1—∞)  │
        ┌──────────────┬──────┴───────┬──────────────┐
        ▼          ▼          ▼          ▼          ▼
   ┌────────┐ ┌─────────┐ ┌───────┐ ┌────────┐ ┌─────────┐
   │  Task  │ │ Document│ │ Photo │ │Schedule│ │ Budget  │
   │        │ │/Receipt │ │ slots │ │ phases │ │ Vendors │
   └────────┘ └─────────┘ └───────┘ └────────┘ └─────────┘

   ──────── all interactive, per-project, persisted ────────
```

- **Project** is the aggregate root. Every interactive record belongs to exactly
  one project via `project_id`. Its **basics** — name, address, status, phase,
  `percent`, `startDate`, `targetDate` — are user-editable and persisted in the
  project list ([ADR-0006](adr/0006-editable-per-project-basics.md)). Dates are
  ISO `YYYY-MM-DD`; "days left" is derived from `targetDate`, not stored.
- **Task**, **Document/Receipt**, **Photo slots**, **Schedule phases**,
  **Budget**, and **Vendors** are all interactive and persisted, scoped per
  project ([ADR-0007](adr/0007-data-drive-schedule-budget-vendors.md)).
- **Budget** is stored as numbers (`{ categories:[{budget,spent}],
  contingencyTotal, contingencyUsed }`); the bar %/color, total spent, % used
  (hero KPI), and contingency remaining are **derived** via `budgetTotals`,
  never stored.

## Storage keys (localStorage)

Everything is namespaced so projects can't read each other's data:

| Data | Key | Written by |
|---|---|---|
| Project list | `realtrack.projects.v1` | `repository.saveProjects` |
| A project's tasks | `realtrack.<projectId>.tasks.v1` | `repository.saveTasks` |
| A project's documents | `realtrack.<projectId>.docs.v1` | `repository.saveDocs` |
| A project's schedule | `realtrack.<projectId>.schedule.v1` | `repository.saveSchedule` |
| A project's budget | `realtrack.<projectId>.budget.v1` | `repository.saveBudget` |
| A project's vendors | `realtrack.<projectId>.vendors.v1` | `repository.saveVendors` |

`<projectId>` is a generated `uid()` (a UUID). Records are JSON; **binary files
are stored separately** (see below).

### Files (photos + document attachments)

Files never go in localStorage or DB rows — they use a dedicated store
(`src/lib/fileStore.js`, [ADR-0010](adr/0010-file-storage-uploads.md)), keyed by
a path that starts with the project id:

| File | Path | Local | Supabase |
|---|---|---|---|
| Photo slot | `<projectId>/<slotId>` | IndexedDB blob | `files` bucket object |
| Document attachment | `<projectId>/doc-<docId>-<name>` | IndexedDB blob | `files` bucket object |

Locally these are served as object URLs; on Supabase as short-lived signed URLs.
The leading `<projectId>` segment is what Supabase Storage RLS checks.

### Demo-data purge

Earlier builds shipped two seeded demo projects (`mr204`, `cs108`). The app is
now a blank slate ([ADR-0008](adr/0008-no-seed-data-blank-slate.md)), so
`repository.purgeDemoData()` runs once on boot to remove any demo projects and
their namespaced records from a browser that opened an older build, plus the
original prototype's un-namespaced `mr204.tasks.v1` / `mr204.docs.v1` keys. It's
flag-guarded (`realtrack.demoPurged.v1`) and idempotent.

## Isolation model

**Today (local):** isolation is by key namespace. The repository is the only
code that builds keys, and it always includes `projectId`, so there is no path
for one project to read another's records. The `repository.test.js` suite pins
this down.

**Production (Supabase):** the same boundary becomes real security. Every row
carries `owner_id` (and `project_id`), and Postgres Row-Level Security policies
restrict every `select/insert/update/delete` to `auth.uid() = owner_id`. The
namespace-by-project the app already does maps directly onto query filters; the
per-user dimension is added by auth. See
[ADR-0005](adr/0005-supabase-for-production.md) and HANDOFF §5.

## Seeding

- **There is no seed/mock data** ([ADR-0008](adr/0008-no-seed-data-blank-slate.md)).
  The project list starts empty; the user creates every project, and each one
  starts with empty records (empty states everywhere) until the user adds them.
- A project's empty baseline is persisted on first read so record ids stay
  stable across reloads.

## Production migration notes

- `due` / `date` / `completedLabel` are **display strings** today (e.g.
  `"JUL 9"`). Production should store ISO dates and derive labels + "overdue"
  status, replacing the `urgent` boolean (HANDOFF §6 step 6).
- Documents need a `fileUrl` (signed, expiring URL to the file in a private
  bucket) once real uploads land (HANDOFF §1).
