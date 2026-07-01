# ADR-0016: Gantt timeline for the schedule

- **Status:** Accepted
- **Date:** 2026-07-01

## Context

The construction schedule was a horizontal **stepper** — good for showing
sequence and per-phase status, but it couldn't show *when* phases happen or how
they **overlap** on a calendar. The owner wanted to "visually see how all of the
things line up" — i.e. a timeline / Gantt view.

A Gantt needs real dates, but a phase only had a status and a single milestone
label (`date`, a display string). So the data model had to grow.

## Decision

- **Extend the phase model** with `start` and `end` (ISO `YYYY-MM-DD`), replacing
  the freeform milestone string. The add-phase form now uses two date pickers;
  the stepper's sub-label derives a short milestone from `end`.
- **Add a `GanttChart` component** — pure CSS/flex, no charting library: one row
  per phase, a month-based x-axis (padded to whole months) with gridlines, a bar
  spanning each phase's `start`→`end` colored by status (green done / clay active
  with a percent fill / grey upcoming), a dashed **today** marker, and a
  start–end range footer. Horizontally scrollable on narrow screens.
- **Add a Stepper | Timeline toggle** in the schedule card, defaulting to
  **Timeline**. Phases without both dates are shown in the stepper but skipped by
  the Gantt (with an "add dates" hint when none are dated).

## Consequences

- ✅ Phase durations, sequencing, and overlaps are visible at a glance on a real
  calendar; the "today" line shows where the build stands.
- ✅ No new dependency — it's ~100 lines of layout math.
- ✅ Both views coexist; the stepper still gives the quick status read.
- ⚠️ Phases need start+end to appear on the timeline (by design). Old phases with
  only the legacy `date` string won't have bars until dates are added.
- ⚠️ Very long ranges can crowd the month labels; the chart scrolls horizontally
  rather than compressing further.
