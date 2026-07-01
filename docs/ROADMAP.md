# Roadmap

Derived from HANDOFF §6, annotated with current status. The guiding constraint:
build **single-user, private, multi-project first**, but keep the data model
multi-tenant-ready from day one.

Legend: ✅ done · 🟡 partial · ⬜ not started

## v1 — private, single user, multi-project (the must-have)

- ✅ **Project picker + per-project dashboard.** List, create, open projects.
- ✅ **Per-project data scoping.** Tasks, documents, and photos are namespaced
  by `project_id`; a new project starts empty. Legacy keys migrate. (See
  [ADR-0004](adr/0004-scope-data-per-project.md).)
- 🟡 **Auth + `projects.owner_id`.** Scaffolded: email/password login + RLS
  policies ([ADR-0009](adr/0009-supabase-backend-scaffold.md)); activates with
  credentials (docs/SUPABASE.md).
- 🟡 **Backend tables with RLS** for all six record kinds — written in
  `supabase/migrations/`; run them to activate.
- ✅ **File storage wired** — photos + document attachments persist via
  IndexedDB (local) / private Supabase bucket with signed URLs
  ([ADR-0010](adr/0010-file-storage-uploads.md)).
- ✅ **Repository swapped behind a backend seam** ([ADR-0009](adr/0009-supabase-backend-scaffold.md)).
- ✅ **Loading + error states** for the async backend, with retry
  ([ADR-0011](adr/0011-async-loading-and-error-states.md)).
- 🟡 **Real ISO dates + formatter.** The project hero now stores ISO
  start/target dates and derives "days left" ([ADR-0006](adr/0006-editable-per-project-basics.md));
  tasks still use display-string due dates + the `urgent` flag.

### Also done

- ✅ **Editable, per-project project basics.** Name, address, status (incl. a
  `Planning` state), phase, % complete, and start/target dates are per-project
  and user-edited via the Edit Project modal; a new project starts empty/zeroed.
  ([ADR-0006](adr/0006-editable-per-project-basics.md))

## v2 — make the rest data-driven

- ✅ Project hero basics ([ADR-0006](adr/0006-editable-per-project-basics.md)).
- ✅ **Schedule phases, budget categories, and vendors are per-project and
  editable** ([ADR-0007](adr/0007-data-drive-schedule-budget-vendors.md)), with
  derived budget roll-ups (total spent, % used → hero KPI, contingency
  remaining) and "days left" derived from the target date.
- ✅ **Delete** on tasks, documents, and whole projects (+ file cleanup)
  ([ADR-0013](adr/0013-delete-and-search.md)). Inline **edit** of an existing
  row's fields is the remaining CRUD gap (delete + re-add covers it today).
- ✅ **JSON backup (export / import)** as a local-first safety net
  ([ADR-0012](adr/0012-json-backup-export-import.md)).
- ✅ **Document search** wired ([ADR-0013](adr/0013-delete-and-search.md)).
- ✅ **Mobile / responsive layout** ([ADR-0014](adr/0014-responsive-mobile-layout.md)).
- 🟡 **Deployment** — static-deploy config + guide ready
  ([ADR-0015](adr/0015-static-spa-deployment.md)); go live by connecting a host
  (docs/DEPLOY.md).
- ⬜ Include attached files in the backup (currently structured data only).

## v3 — multi-user collaboration

- ⬜ `project_members` table + invite flow.
- ⬜ Per-project roles (owner = full, collaborator = view/limited); default
  private to the owner.

## Known limitations in the current build

- **Every dashboard section is now per-project.** A brand-new project reads as a
  genuine blank slate (Planning · 0%, empty schedule/budget/vendors/tasks/docs).
- Editing is **add + remove** (plus schedule status cycling); there is no inline
  field editing of existing rows yet — the remaining v2 polish.
- Persistence is **browser-local and not private-grade**: no auth, no
  encryption, single device. This is the v1 backend work (Supabase). See
  HANDOFF §1/§3.
