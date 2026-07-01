# ADR-0010: File storage for photos and document attachments

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

Two related gaps remained after the backend scaffold:

1. **A latent bug.** Progress photos were stored as base64 data-URLs in
   `localStorage`, which caps at ~5 MB. A couple of phone photos overflow it;
   `ImageSlot` caught the quota error and kept the image "in-session only," so a
   photo *looked* saved but vanished on reload.
2. **A missing feature.** Documents/receipts stored only metadata — no actual
   file could be attached (HANDOFF §4 defines a `fileUrl`).

Binary files don't belong in the data repository (localStorage keys or DB rows).
They need their own storage, in both backends.

## Decision

Add a **file-storage seam** (`src/lib/fileStore.js`), parallel to the data
`backend.js`, with `put` / `getUrl` / `remove`:

- **local mode → IndexedDB.** Blobs are stored directly (hundreds of MB, no
  base64 bloat), served to the UI as object URLs. This fixes the quota bug.
- **Supabase mode → the private `files` bucket**, served via short-lived signed
  URLs (the schema/bucket/policies already existed in ADR-0009).

Files are keyed by a path starting with the project id (`<projectId>/...`), so
the same key works as an IndexedDB key and satisfies Supabase Storage RLS.

- **Photos:** `ImageSlot` now reads/writes through the fileStore at
  `<projectId>/<slotId>`, with object-URL revocation to avoid leaks.
- **Documents:** the add form takes an optional file; `addDoc` uploads it to
  `<projectId>/doc-<id>-<name>` and stores the returned `filePath` on the doc
  record (mapped to the `documents.file_path` column on Supabase). A **View**
  action on rows resolves the URL on demand and opens the file.

## Consequences

- ✅ The photo quota bug is gone — images persist and scale in local mode.
- ✅ Documents can carry real files; the Supabase path uses signed, private URLs.
- ✅ One abstraction serves both backends; components never branch on mode.
- ⚠️ Switching photos from localStorage to IndexedDB means any images saved by an
  older build aren't migrated (they were the buggy, often-dropped ones). Old
  `realtrack.*.image-slot.*` localStorage keys are now orphaned/harmless.
- ⚠️ File cleanup on record/project delete isn't wired (documents have no delete
  yet; project delete doesn't purge files). Noted for the edit/delete follow-up.
- IndexedDB/Storage aren't exercised by the node unit tests (no browser); this
  feature is verified via the headless-Chrome run instead.
