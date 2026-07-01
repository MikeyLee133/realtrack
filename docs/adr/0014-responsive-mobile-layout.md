# ADR-0014: Responsive / mobile layout

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

The UI was built at fixed desktop widths — a 248px sidebar, multi-column grids
(`1.55fr 1fr`, `1.5fr 1fr`), a 9-column schedule stepper. On a phone it
overflowed horizontally and was unusable. That matters for *this* app: a
construction owner is often on-site with a phone.

The app is styled with **inline style objects**, so CSS media queries can't
override them without `!important`. A JS-driven approach fits the architecture.

## Decision

Add a `useIsMobile()` hook (matchMedia `max-width: 820px`, updates on resize)
and branch the layout-critical inline styles on it:

- **Sidebar** → a compact sticky **top bar** on mobile (back + project identity
  + sign-out); the decorative nav list and user footer are dropped.
- **Dashboard** → the sidebar/main flex stacks to a column; paddings shrink; the
  topbar (title + search + add) stacks and the search fills the width; the lower
  grid collapses to one column.
- **Hero** → the hero grid and the hero card stack; the site photo goes
  full-width.
- **Picker** → single-column project grid; header stacks; action buttons wrap.
- **Schedule stepper** → wrapped in a horizontal-scroll container with a
  min-width, so the phases stay legible instead of crushing.

## Consequences

- ✅ Usable on a phone: single-column, no horizontal overflow, a compact header.
- ✅ No `!important` hacks — layout decisions stay in JS next to the markup.
- ✅ One hook; each component opts in where it owns layout.
- ⚠️ Breakpoint is a single 820px cutoff (mobile vs desktop); no tablet-specific
  middle layout. Fine for now.
- ⚠️ The mobile sidebar hides the (decorative) section nav; when those links
  become real routes, mobile will need a menu/drawer for them.
