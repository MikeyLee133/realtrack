# ADR-0013: Delete actions and document search

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

Two gaps made the app feel unfinished:

1. **Missing deletes (and an inconsistency).** Tasks and documents could be
   added but never removed (only toggled); whole projects could be created but
   never deleted. Meanwhile schedule/budget/vendors already had row removal — so
   the app was inconsistent about what could be deleted.
2. **A dead control.** The topbar "Search documents…" box was decorative and did
   nothing.

## Decision

- **Delete everywhere it was missing**, using the app's existing hover-`×`
  vocabulary:
  - **Tasks / documents** — a hover-reveal `×` on each row (`removeTask`,
    `removeDoc`). Deleting a document also removes its attached file.
  - **Projects** — a delete action on each picker card, behind a `confirm()`
    (it's destructive). `removeProject` cleans up everything: records, photos,
    and document files. On Supabase the record delete cascades from the project
    row (`deleteProjectRecords` is a no-op there); locally it removes the five
    record keys.
- **Wire the search box** — the topbar input now filters the Documents &
  Receipts list by title/type (case-insensitive), with a "no documents match"
  state.

Row deletes have no confirm (consistent with the existing remove buttons and
easily redone); only the project delete — which removes a lot at once — confirms.

## Consequences

- ✅ Full add/remove across every list; the app is consistent and no data is
  stranded.
- ✅ File cleanup on document/project delete closes the loose end from
  [ADR-0010](0010-file-storage-uploads.md).
- ✅ The search control is honest and functional.
- ⚠️ Still no *edit* of an existing row's fields (delete + re-add covers it);
  full inline editing remains a possible follow-up.
- ⚠️ Row deletes are immediate with no undo — acceptable for single items,
  matching the other remove buttons.
