// ── Defaults & static UI data ────────────────────────────────────────
// The app ships with NO seed/mock data — every project and all of its
// records are created by the user (see ADR-0008). This file holds only the
// empty defaults and fixed UI scaffolding the app needs.

// Default empty value for a project with no budget yet. Roll-ups (total
// spent, % used, contingency remaining) are derived from this, never stored.
export const emptyBudget = { categories: [], contingencyTotal: 0, contingencyUsed: 0 };

// The fixed photo-log slots (a 2×2 grid). The slots themselves are UI; the
// images dropped into them are per-project (see ImageSlot).
export const photoSlots = [
  { id: 'photo-1', placeholder: 'Add a photo' },
  { id: 'photo-2', placeholder: 'Add a photo' },
  { id: 'photo-3', placeholder: 'Add a photo' },
  { id: 'photo-4', placeholder: 'Add a photo' },
];
