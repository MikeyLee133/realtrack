// ── Backend selector ─────────────────────────────────────────────────
// The single switch between the two repository implementations. When Supabase
// is configured (env vars present), the app talks to Postgres + RLS; otherwise
// it stays on localStorage. The contract is uniformly async here so useStore
// awaits loads without caring which backend is active — the whole point of the
// repository seam (ADR-0003, ADR-0009).

import * as local from './repository.js';
import * as supabase from './supabaseRepository.js';
import { isSupabaseConfigured } from './supabaseClient.js';

export const usingSupabase = isSupabaseConfigured();

const impl = usingSupabase ? supabase : local;

// Wrap so local (sync) and Supabase (async) present the same async interface.
const asyncify = (fn) => async (...args) => fn(...args);

export const purgeDemoData = asyncify(impl.purgeDemoData);
export const loadProjects = asyncify(impl.loadProjects);
export const saveProjects = asyncify(impl.saveProjects);
export const loadTasks = asyncify(impl.loadTasks);
export const saveTasks = asyncify(impl.saveTasks);
export const loadDocs = asyncify(impl.loadDocs);
export const saveDocs = asyncify(impl.saveDocs);
export const loadSchedule = asyncify(impl.loadSchedule);
export const saveSchedule = asyncify(impl.saveSchedule);
export const loadBudget = asyncify(impl.loadBudget);
export const saveBudget = asyncify(impl.saveBudget);
export const loadVendors = asyncify(impl.loadVendors);
export const saveVendors = asyncify(impl.saveVendors);
export const deleteProjectRecords = asyncify(impl.deleteProjectRecords);
