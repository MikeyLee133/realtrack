# ADR-0012: JSON backup — export / import

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

By default the app is local-first: a user's projects and records live in the
browser (localStorage + IndexedDB). That's private and zero-config, but fragile —
"clear browsing data," a new device, or a different browser loses everything.
This is personal financial/project data, so a self-service backup is a real
safety net (and useful even in Supabase mode for portability).

## Decision

Add **export / import of all data as a single JSON file** (`src/lib/backup.js`),
driven from the project picker:

- **Export** reads every project and its five record kinds through the async
  backend into one object (`{ app, version, exportedAt, projects: [{ project,
  tasks, docs, schedule, budget, vendors }] }`) and downloads it.
- **Import** validates the file, then **merges by project id** — imported
  projects are upserted and their records restored, while existing projects not
  in the backup are left untouched (non-destructive). A confirm dialog guards
  the overwrite.

Because it goes through `backend.js`, the same feature works in both the
localStorage and Supabase backends.

## Consequences

- ✅ A browser wipe or device change no longer means data loss — the user holds
  a portable copy.
- ✅ Non-destructive restore (merge by id), with a confirm before overwriting.
- ✅ Backend-agnostic; no new persistence code.
- ⚠️ **Attached files are not included** (photos, document files are blobs in
  IndexedDB / Storage). The JSON captures the structured data — the part hardest
  to recreate. A future version could bundle files (e.g. a zip) if needed.
- ⚠️ Import trusts the file's ids; a malformed-but-valid-shaped file could create
  odd records. Acceptable for a single-user tool.
