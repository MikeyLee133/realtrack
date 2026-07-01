# Maple Ridge Project Tracker — Handoff Notes

A project dashboard for a new-construction build. Originally built as a streaming
**Design Component** (`Project Tracker.dc.html`) on claude.ai/design, now ported
to a React + Vite app (see `README.md`). This document is the product/data plan
for taking the prototype to production.

**Primary user:** the project owner (single user, private). **Reuse goals:** the
owner runs **multiple projects** over time, and the app **may later be opened to
other users** who each have their own private projects. Build
single-user-private **first**, but architect data as multi-project and
multi-tenant from day one (see §1 and Build Order). The current prototype is a
single hard-coded project ("Maple Ridge", id `mr204`) — that id is a stand-in
for a real, user-created project record.

---

## 1. Privacy & access requirements (must-have)

Privacy is a hard requirement. The data is personal financial/project info.

- **Login required.** No data is reachable without authentication.
- **Per-user data isolation.** Every record is scoped to an account id. One
  user can never read another's data. (The `mr204` prefix in the prototype is a
  stand-in for a project id — replace with real `owner_id` / `project_id`.)
- **Encryption.** HTTPS in transit; encryption at rest for the database and any
  uploaded files (documents, receipts, photos).
- **Private file storage.** Document/receipt/photo files must live in
  access-controlled storage with signed, expiring URLs — never a public bucket.
- **Invite-based sharing (phase 2).** When opened to others, sharing is explicit
  and per-project, with roles (e.g. owner = full, collaborator = view/limited).
  Default is private to the owner.
- **Note:** the current prototype is NOT private-grade — see §3.

---

## 2. What's real vs. mocked in the prototype

| Area | State today |
|---|---|
| **Project picker** | ✅ Multi-project landing — list of projects, create new, click to open. Persisted. |
| **Tasks** | ✅ Interactive — add, check off / un-check. Persisted. |
| **Documents & Receipts** | ✅ Interactive — add (name, type, optional amount). Persisted. |
| **Photo Progress Log** | ✅ Drag-and-drop. Persists per slot. |
| **KPI counters** | ✅ Derived live from the tasks/docs arrays. |
| Hero status / completion | ⚠️ Static — hard-coded in template. |
| Schedule stepper (9 phases) | ⚠️ Static (data-driven from `src/data/seed.js`, but values are fixed). |
| Budget categories + bars | ⚠️ Static. |
| Vendors & contractors | ⚠️ Static. |

The ⚠️ sections are display-only today; their data shapes are defined in §4.

---

## 3. Where the data lives today (and why it's not yet private)

Prototype persistence is **browser `localStorage`** only — single device, no
auth, no sync, not encrypted. Keys are namespaced per project (built in
`src/lib/repository.js`; full scheme in `docs/DATA-MODEL.md`):

- `realtrack.projects.v1` — the project list.
- `realtrack.<projectId>.tasks.v1` — a project's tasks.
- `realtrack.<projectId>.docs.v1` — a project's documents.
- `realtrack.<projectId>.image-slot.<slotId>` — a project's photos (data URLs).

The original prototype's un-namespaced `mr204.tasks.v1` / `mr204.docs.v1` keys
are migrated once on boot (`repository.migrateLegacyKeys`).

The persistence layer is isolated in the **repository** (`src/lib/repository.js`)
— the single seam between the UI and storage. Mutations live in
`src/lib/useStore.js` (`toggleTask`, `addTask`, `addDoc`, `createProject`).
**Swap the repository for authenticated API calls** and the UI is unchanged
(see `docs/adr/0003-repository-layer-as-the-api-seam.md`).

---

## 4. Data shapes (the API contract)

### Live in the prototype

```js
// Task
{ id: string, title: string, due: string,   // display "JUL 9" today; use ISO date in prod
  owner: string, urgent: boolean, done: boolean,
  completedLabel?: string }

// Document / Receipt
{ id: string, title: string,
  type: "Receipt"|"Invoice"|"Permit"|"Plan"|"Contract",
  date: string,        // display "JUN 27" today; use ISO date in prod
  amount?: string,     // money docs only, e.g. "24,180"
  fileUrl?: string,    // ADD in prod — signed URL to the stored file
  badge?: { text, color, bg } }   // status pill for non-money docs
```

### Static today — define these to make them data-driven

```js
// Project (the hero + overall status) — there are MANY of these per user
{ id, owner_id,
  name, address, phaseIndex, phaseLabel,
  status: "On Track"|"At Risk"|"Delayed",
  percentComplete: number,                      // 0–100
  startDate, targetDate }

// SchedulePhase (the 9-step stepper)
{ id, order, name,
  status: "done"|"active"|"upcoming",
  percent?: number,
  date }

// BudgetCategory
{ id, name, budget: number, spent: number, active?: boolean }

// Vendor
{ id, name, initials, trade,
  status: "on-site"|"complete"|"scheduled",
  nextDate?, contact? }
```

---

## 5. Production stack — use Supabase

**Decision: build on Supabase.** Its free tier covers a personal project and it
delivers every privacy requirement from §1 in one service:

- **Auth** built in (email/password or magic link) — satisfies "login required".
- **Postgres + Row-Level Security (RLS)** — every row carries `owner_id` and an
  RLS policy restricts `select/insert/update/delete` to `auth.uid() = owner_id`.
  Extends cleanly to invite-based sharing in v3 (add a `project_members` table).
- **Supabase Storage** for documents, receipts, and photos in a **private**
  bucket, served via signed, expiring URLs (`fileUrl` in §4). Never public.
- Encryption in transit (HTTPS) and at rest are provided by the platform.

Concretely: one Supabase project; tables `projects` (one row per build, with
`owner_id`), `tasks`, `documents` (+ later `vendors`, `budget_categories`,
`schedule_phases`, `project_members`), every child table carrying a `project_id`
foreign key. RLS scopes reads/writes to the signed-in user. One private `files`
bucket, pathed by `project_id`. The `load()`/`save()` boundary and the
mutations in `useStore.js` become Supabase client calls.

---

## 6. Build order (suggested)

**v1 — private, single user, MULTI-PROJECT (the must-have):**
1. Auth + a `projects` table (many rows per user), each with `owner_id`.
2. Project picker / "new project" flow + a route per project. ✅ The app has
   this picker; in prod, scope every child query by the opened `project_id`
   (today tasks/docs are shared across projects).
3. `tasks` and `documents` tables matching §4, keyed by `project_id`; RLS scopes
   everything to the owner.
4. Private file upload/storage for documents & receipts (signed URLs).
5. Swap `storage.js` + the `useStore.js` mutations for authenticated,
   project-scoped API calls.
6. Real ISO dates + a formatter, so "due this week" / overdue is computed
   instead of the current `urgent` flag.

**v2 — make the rest data-driven:**
7. Project/hero, schedule phases, budget categories, vendors (shapes in §4),
   with derived roll-ups for budget totals and "days left".
8. Edit / delete on tasks and documents.

**v3 — multi-user collaboration:**
9. `project_members` table + invite flow; per-project roles and access control.

---

## 7. Design system

- Fonts: **Schibsted Grotesk** (UI) + **IBM Plex Mono** (data/labels).
- Accent: `#BB5A33` (clay). Canvas `#F6F4F0`, ink `#1B1A17`, hairline `#E8E5DF`.
- Status: green `#4F7C5A`, amber `#C9A24E`, red/overdue `#B5503C`.
- Cards: white, `1px #E8E5DF` border, 16px radius. Mono for all labels/figures.
- Tokens live in `src/lib/tokens.js`.
