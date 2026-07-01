import * as backend from './backend.js';
import { emptyBudget } from '../data/seed.js';

// ── Backup: export / import all data ─────────────────────────────────
// A local-first safety net: the user's projects and records live in the
// browser (or Supabase), so let them download a JSON backup and restore it if
// the browser is wiped or they move devices. Works through the async backend,
// so it covers both localStorage and Supabase.
//
// Note: attached FILES (photos, document files) are not included — only the
// structured data (the part that's hardest to recreate). See ADR-0012.

const VERSION = 1;

export async function exportAll() {
  const projects = await backend.loadProjects();
  const out = { app: 'realtrack', version: VERSION, exportedAt: new Date().toISOString(), projects: [] };
  for (const project of projects) {
    const [tasks, docs, schedule, budget, vendors] = await Promise.all([
      backend.loadTasks(project.id),
      backend.loadDocs(project.id),
      backend.loadSchedule(project.id),
      backend.loadBudget(project.id),
      backend.loadVendors(project.id),
    ]);
    out.projects.push({ project, tasks, docs, schedule, budget, vendors });
  }
  return out;
}

export function isValidBackup(data) {
  return (
    !!data &&
    typeof data === 'object' &&
    Array.isArray(data.projects) &&
    data.projects.every((e) => e && e.project && typeof e.project.id === 'string')
  );
}

// Merge imported projects into the current set (upsert by id) and restore each
// project's records. Existing projects not present in the backup are kept, so
// importing is non-destructive to unrelated projects.
export async function importAll(data) {
  if (!isValidBackup(data)) throw new Error('That file is not a valid RealTrack backup.');

  const current = await backend.loadProjects();
  const byId = new Map(current.map((p) => [p.id, p]));
  for (const entry of data.projects) byId.set(entry.project.id, entry.project);
  const merged = [...byId.values()];
  await backend.saveProjects(merged);

  for (const entry of data.projects) {
    const id = entry.project.id;
    await backend.saveTasks(id, entry.tasks || []);
    await backend.saveDocs(id, entry.docs || []);
    await backend.saveSchedule(id, entry.schedule || []);
    await backend.saveBudget(id, entry.budget || { ...emptyBudget });
    await backend.saveVendors(id, entry.vendors || []);
  }
  return { imported: data.projects.length, total: merged.length };
}
