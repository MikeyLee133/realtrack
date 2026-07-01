import { supabase } from './supabaseClient.js';
import { uid } from './storage.js';

// Supabase implementation of the repository contract (see repository.js for the
// localStorage implementation). Same function names, async. owner_id is set by
// the database (default auth.uid()) and RLS scopes every query to the signed-in
// user, so this module never needs to know who the user is.
//
// The contract's "save the whole collection" semantics map to: replace the
// project's rows (delete + insert). Roll-ups (budget totals) stay derived in
// the UI; only the raw rows live here.

const BUDGET = 'budget_categories';

function must(error) {
  if (error) throw error;
}

// ── row ⇄ app-object mapping ──────────────────────────────────────────
const toProjectRow = (p) => ({
  id: p.id, name: p.name, short: p.short, code: p.code, address: p.address,
  status: p.status, percent: p.percent, phase_label: p.phaseLabel,
  start_date: p.startDate || null, target_date: p.targetDate || null,
});
const toProject = (r) => ({
  id: r.id, name: r.name, short: r.short, code: r.code, address: r.address,
  status: r.status, percent: r.percent, phaseLabel: r.phase_label,
  startDate: r.start_date || '', targetDate: r.target_date || '',
});

const toTaskRow = (t) => ({ id: t.id, title: t.title, due: t.due ?? null, owner: t.owner ?? null, urgent: !!t.urgent, done: !!t.done, completed_label: t.completedLabel ?? null });
const toTask = (r) => ({ id: r.id, title: r.title, due: r.due ?? '', owner: r.owner ?? '', urgent: r.urgent, done: r.done, completedLabel: r.completed_label ?? undefined });

const toDocRow = (d) => ({ id: d.id, title: d.title, type: d.type, date: d.date ?? null, amount: d.amount ?? null, badge: d.badge ?? null, file_path: d.filePath ?? null });
const toDoc = (r) => ({ id: r.id, title: r.title, type: r.type, date: r.date ?? '', amount: r.amount ?? undefined, badge: r.badge ?? undefined, filePath: r.file_path ?? undefined });

const toPhaseRow = (p) => ({ id: p.id, name: p.name, status: p.status, percent: p.percent ?? 0, date: p.date ?? '' });
const toPhase = (r) => ({ id: r.id, name: r.name, status: r.status, percent: r.percent ?? 0, date: r.date ?? '' });

const toCatRow = (c) => ({ id: c.id, name: c.name, budget: c.budget, spent: c.spent, active: !!c.active });
const toCat = (r) => ({ id: r.id, name: r.name, budget: Number(r.budget), spent: Number(r.spent), active: r.active });

const toVendorRow = (v) => ({ id: v.id, name: v.name, trade: v.trade ?? null, status: v.status ?? null });
const toVendor = (r) => ({ id: r.id, name: r.name, trade: r.trade ?? '', status: r.status ?? '' });

// ── generic child-collection helpers ─────────────────────────────────
async function loadChild(table, projectId, toObj) {
  const { data, error } = await supabase.from(table).select('*').eq('project_id', projectId).order('position');
  must(error);
  return (data || []).map(toObj);
}
async function replaceChild(table, projectId, rows, toRow) {
  must((await supabase.from(table).delete().eq('project_id', projectId)).error);
  if (rows.length) {
    const payload = rows.map((r, i) => ({ ...toRow(r), project_id: projectId, position: i }));
    must((await supabase.from(table).insert(payload)).error);
  }
}

// purge is a localStorage concern — no-op for the remote backend.
export async function purgeDemoData() {}

// Deleting the project row cascades to all child records (ON DELETE CASCADE),
// so there is nothing extra to clear here.
export async function deleteProjectRecords() {}

// ── projects ──────────────────────────────────────────────────────────
export async function loadProjects() {
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  must(error);
  return (data || []).map(toProject);
}
export async function saveProjects(projects) {
  // upsert the current list, then delete the user's projects no longer in it
  const keep = new Set(projects.map((p) => p.id));
  const { data: existing, error } = await supabase.from('projects').select('id');
  must(error);
  const toDelete = (existing || []).map((r) => r.id).filter((id) => !keep.has(id));
  if (toDelete.length) must((await supabase.from('projects').delete().in('id', toDelete)).error);
  if (projects.length) must((await supabase.from('projects').upsert(projects.map(toProjectRow))).error);
}

// ── tasks / documents / schedule / vendors ───────────────────────────
export const loadTasks = (pid) => loadChild('tasks', pid, toTask);
export const saveTasks = (pid, rows) => replaceChild('tasks', pid, rows, toTaskRow);
export const loadDocs = (pid) => loadChild('documents', pid, toDoc);
export const saveDocs = (pid, rows) => replaceChild('documents', pid, rows, toDocRow);
export const loadSchedule = (pid) => loadChild('schedule_phases', pid, toPhase);
export const saveSchedule = (pid, rows) => replaceChild('schedule_phases', pid, rows, toPhaseRow);
export const loadVendors = (pid) => loadChild('vendors', pid, toVendor);
export const saveVendors = (pid, rows) => replaceChild('vendors', pid, rows, toVendorRow);

// ── budget (categories + project-level contingency) ──────────────────
export async function loadBudget(projectId) {
  const categories = await loadChild(BUDGET, projectId, toCat);
  const { data, error } = await supabase.from('projects').select('contingency_total, contingency_used').eq('id', projectId).single();
  must(error);
  return {
    categories,
    contingencyTotal: Number(data?.contingency_total) || 0,
    contingencyUsed: Number(data?.contingency_used) || 0,
  };
}
export async function saveBudget(projectId, budget) {
  await replaceChild(BUDGET, projectId, budget.categories || [], toCatRow);
  must((await supabase.from('projects').update({
    contingency_total: budget.contingencyTotal || 0,
    contingency_used: budget.contingencyUsed || 0,
  }).eq('id', projectId)).error);
}

// ── private file storage (documents / photos) ────────────────────────
// Files live under `<projectId>/...` in the private 'files' bucket; RLS in
// 0002_storage.sql restricts them to the project owner. Served via signed URLs.
export async function uploadFile(projectId, file) {
  const path = `${projectId}/${uid()}-${file.name}`;
  const { error } = await supabase.storage.from('files').upload(path, file);
  must(error);
  return path;
}
export async function signedUrl(path, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from('files').createSignedUrl(path, expiresIn);
  must(error);
  return data?.signedUrl;
}
export async function removeFile(path) {
  must((await supabase.storage.from('files').remove([path])).error);
}
