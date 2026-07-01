// ── Repository: the data-access layer ────────────────────────────────
// This module is the single seam between the UI and where data lives. The
// UI (components → useStore) never touches storage directly — it goes
// through these functions. Today they read/write browser localStorage; in
// production they become authenticated, project-scoped API calls (Supabase)
// with the SAME signatures, so nothing above this file changes. See
// docs/adr/0003-repository-layer-as-the-api-seam.md.
//
// Data is namespaced per project (`realtrack.<projectId>.<kind>.v1`) so one
// project can never read another's records — the local stand-in for the
// per-user / per-project isolation a real backend enforces with row-level
// security (docs/adr/0004-scope-data-per-project.md, HANDOFF §1).

import { load, save, remove } from './storage.js';
import { emptyBudget } from '../data/seed.js';

export const KEY_PROJECTS = 'realtrack.projects.v1';

/** localStorage key for a project's records of a given kind. */
export const recordKey = (projectId, kind) => `realtrack.${projectId}.${kind}.v1`;
export const taskKey = (projectId) => recordKey(projectId, 'tasks');
export const docKey = (projectId) => recordKey(projectId, 'docs');
export const scheduleKey = (projectId) => recordKey(projectId, 'schedule');
export const budgetKey = (projectId) => recordKey(projectId, 'budget');
export const vendorKey = (projectId) => recordKey(projectId, 'vendors');

// ── Demo-data purge ──────────────────────────────────────────────────
// Earlier builds shipped two seeded demo projects (mr204, cs108). The app is
// now a blank slate (ADR-0008), so on first boot we remove any demo projects
// and their records left in a browser that opened an older build — plus the
// original prototype's un-namespaced global keys. Runs once (guarded by a
// flag); idempotent.
const DEMO_IDS = ['mr204', 'cs108'];
const DEMO_KINDS = ['tasks', 'docs', 'schedule', 'budget', 'vendors'];
const DEMO_SLOTS = ['hero-site', 'photo-1', 'photo-2', 'photo-3', 'photo-4'];
const PURGE_FLAG = 'realtrack.demoPurged.v1';

export function purgeDemoData() {
  if (load(PURGE_FLAG)) return;

  const projects = load(KEY_PROJECTS);
  if (projects) save(KEY_PROJECTS, projects.filter((p) => !DEMO_IDS.includes(p.id)));

  DEMO_IDS.forEach((id) => {
    DEMO_KINDS.forEach((kind) => remove(recordKey(id, kind)));
    DEMO_SLOTS.forEach((slot) => remove(`realtrack.${id}.image-slot.${slot}`));
  });
  // original prototype's pre-namespacing global keys
  remove('mr204.tasks.v1');
  remove('mr204.docs.v1');

  save(PURGE_FLAG, true);
}

// ── Projects ─────────────────────────────────────────────────────────
// No seed: the project list starts empty and the user creates every project.
export function loadProjects() {
  return load(KEY_PROJECTS) || [];
}
export function saveProjects(projects) {
  save(KEY_PROJECTS, projects);
}

// ── Per-project records ──────────────────────────────────────────────
// On first read of a project, start with `emptyValue` and persist that
// baseline so ids stay stable across reloads. There is no seed data — every
// project starts empty and the user fills it in.
function loadKind(key, emptyValue = []) {
  const stored = load(key);
  if (stored) return stored;
  save(key, emptyValue);
  return emptyValue;
}

export function loadTasks(projectId) {
  return loadKind(taskKey(projectId));
}
export function saveTasks(projectId, tasks) {
  save(taskKey(projectId), tasks);
}

export function loadDocs(projectId) {
  return loadKind(docKey(projectId));
}
export function saveDocs(projectId, docs) {
  save(docKey(projectId), docs);
}

export function loadSchedule(projectId) {
  return loadKind(scheduleKey(projectId));
}
export function saveSchedule(projectId, phases) {
  save(scheduleKey(projectId), phases);
}

export function loadBudget(projectId) {
  return loadKind(budgetKey(projectId), { ...emptyBudget });
}
export function saveBudget(projectId, budget) {
  save(budgetKey(projectId), budget);
}

export function loadVendors(projectId) {
  return loadKind(vendorKey(projectId));
}
export function saveVendors(projectId, vendors) {
  save(vendorKey(projectId), vendors);
}

// Remove all of a project's record keys (called when a project is deleted).
// On Supabase this is unnecessary — deleting the project row cascades.
export function deleteProjectRecords(projectId) {
  remove(taskKey(projectId));
  remove(docKey(projectId));
  remove(scheduleKey(projectId));
  remove(budgetKey(projectId));
  remove(vendorKey(projectId));
}
