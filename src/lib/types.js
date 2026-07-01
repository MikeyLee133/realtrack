// Data contract for RealTrack, expressed as JSDoc typedefs so editors get
// autocompletion and type-checking without adopting TypeScript. These mirror
// HANDOFF.md §4 and docs/DATA-MODEL.md — they are the shapes a real backend
// (Supabase) must honor. Import for documentation/intellisense only; this
// file emits no runtime code.

/**
 * A construction project. There are many per user; in production each row
 * also carries an `owner_id` that scopes it to an account (HANDOFF §1).
 * @typedef {Object} Project
 * @property {string} id           Stable id (demo: 'mr204'; created: uid()).
 * @property {string} name         Full name, e.g. "Maple Ridge Residence".
 * @property {string} short        Short name for the sidebar.
 * @property {string} code         Display code, e.g. "BUILD #MR-204".
 * @property {string} address      Street address (or "Address not set").
 * @property {string} phaseLabel   e.g. "PHASE 4/9 · FRAMING".
 * @property {'Planning'|'On Track'|'At Risk'|'Delayed'} status  'Planning' is
 *   the default for a new project.
 * @property {number} percent      Overall completion, 0–100.
 * @property {string} startDate    ISO 'YYYY-MM-DD', or '' if unset.
 * @property {string} targetDate   ISO 'YYYY-MM-DD', or '' if unset. "Days left"
 *   is derived from this, not stored.
 */

/**
 * A task / to-do. Scoped to a project. `due`/`completedLabel` are display
 * strings today; production should store ISO dates and derive "overdue".
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} [due]            Display string, e.g. "JUL 9".
 * @property {string} [owner]          e.g. "OWNER", "SITE MGR".
 * @property {boolean} urgent          Drives the "due this week" KPI + styling.
 * @property {boolean} done
 * @property {string} [completedLabel] e.g. "COMPLETED JUN 9" (done tasks).
 */

/**
 * A document or receipt. Scoped to a project. Money docs use `amount`;
 * non-money docs (permits, plans) use a status `badge`.
 * @typedef {Object} DocumentRecord
 * @property {string} id
 * @property {string} title
 * @property {'Receipt'|'Invoice'|'Permit'|'Plan'|'Contract'} type
 * @property {string} date                       Display string, e.g. "JUN 27".
 * @property {string} [amount]                   e.g. "24,180" (money docs).
 * @property {string} [fileUrl]                  Production: signed URL to file.
 * @property {{text:string,color:string,bg:string}} [badge]  Status pill.
 */

/**
 * A construction schedule phase (the stepper). Scoped to a project. The node's
 * sub-label is derived from `status` (+ `percent` for the active phase).
 * @typedef {Object} SchedulePhase
 * @property {string} id
 * @property {string} name
 * @property {'done'|'active'|'upcoming'} status
 * @property {number} [percent]   Progress of the active phase, 0–100.
 * @property {string} [start]     ISO 'YYYY-MM-DD' — phase start (for the Gantt).
 * @property {string} [end]       ISO 'YYYY-MM-DD' — phase end (for the Gantt).
 */

/**
 * A budget category. Scoped to a project. `budget`/`spent` are numbers; the bar
 * %, color, and all roll-ups are DERIVED (see {@link Budget}).
 * @typedef {Object} BudgetCategory
 * @property {string} id
 * @property {string} name
 * @property {number} budget   Allocated amount in dollars.
 * @property {number} spent    Spent so far in dollars.
 * @property {boolean} [active] Marks the in-progress category (clay bar).
 */

/**
 * A project's budget: a list of categories plus contingency. Totals (spent,
 * % used) and contingency-remaining are derived via `budgetTotals`, never
 * stored.
 * @typedef {Object} Budget
 * @property {BudgetCategory[]} categories
 * @property {number} contingencyTotal
 * @property {number} contingencyUsed
 */

/**
 * A vendor / contractor. Scoped to a project. Avatar initials + color and the
 * status color are derived in the view from `name`/`status`.
 * @typedef {Object} Vendor
 * @property {string} id
 * @property {string} name
 * @property {string} trade    e.g. "FRAMING".
 * @property {string} status   "On site" | "Complete" | a date | "Scheduled".
 */

export {};
