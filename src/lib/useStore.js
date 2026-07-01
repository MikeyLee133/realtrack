import { useState, useEffect, useCallback, useMemo } from 'react';
import { uid, todayLabel } from './storage.js';
import { emptyBudget } from '../data/seed.js';
import * as backend from './backend.js';
import * as fileStore from './fileStore.js';

// Roll-ups for the budget card + the hero "Budget Spent" KPI. Derived from the
// stored categories — totals are never persisted (HANDOFF §4).
export function budgetTotals(budget) {
  const cats = budget?.categories || [];
  const spent = cats.reduce((s, c) => s + (Number(c.spent) || 0), 0);
  const total = cats.reduce((s, c) => s + (Number(c.budget) || 0), 0);
  const percentUsed = total > 0 ? Math.round((spent / total) * 100) : 0;
  const contingencyTotal = Number(budget?.contingencyTotal) || 0;
  const contingencyRemaining = Math.max(0, contingencyTotal - (Number(budget?.contingencyUsed) || 0));
  return { spent, total, percentUsed, contingencyTotal, contingencyRemaining };
}

// Status → display colors. 'On Track' is the default; 'Planning' is the
// neutral starting state for a brand-new project.
export function statusStyle(status) {
  switch (status) {
    case 'Planning':
      return { dot: '#4A5A6B', color: '#5A6675', bg: '#E7EAF0' };
    case 'At Risk':
      return { dot: '#C9A24E', color: '#B5862E', bg: '#F6EFD9' };
    case 'Delayed':
      return { dot: '#B5503C', color: '#B5503C', bg: '#F4E2DD' };
    default: // On Track
      return { dot: '#4F7C5A', color: '#3E6B49', bg: '#E6EFE7' };
  }
}
export function statusColor(status) {
  return statusStyle(status).dot;
}

// The valid project statuses, in the order the edit form presents them.
export const PROJECT_STATUSES = ['Planning', 'On Track', 'At Risk', 'Delayed'];

// Short name for the sidebar: first two words of the full name.
function deriveShort(name) {
  return name.trim().split(/\s+/).slice(0, 2).join(' ');
}

// Fixed photo-slot ids, so a deleted project's photos can be cleaned up.
const PHOTO_SLOTS = ['hero-site', 'photo-1', 'photo-2', 'photo-3', 'photo-4'];

// Central store — the React equivalent of the prototype's DCLogic class.
// All persistence flows through the backend seam (src/lib/backend.js), which
// is either localStorage or Supabase. Components never see storage keys or
// queries; switching backends leaves this hook (and the components) unchanged.
export function useStore() {
  const [view, setView] = useState('picker'); // 'picker' | 'dashboard'
  const [activeId, setActiveId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [docs, setDocs] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [budget, setBudget] = useState(emptyBudget);
  const [vendors, setVendors] = useState([]);

  // Async-load status. The backend (localStorage or Supabase) can be slow or
  // fail, so both load points expose loading + error + a retry, and the UI
  // shows a spinner or a retry card instead of a misleading empty screen.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectsTick, setProjectsTick] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [dataTick, setDataTick] = useState(0);

  const reloadProjects = useCallback(() => setProjectsTick((t) => t + 1), []);
  const reloadData = useCallback(() => setDataTick((t) => t + 1), []);

  // Initial fetch: purge any leftover demo data, then load the project list
  // (empty on a fresh browser — the user creates every project).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        await backend.purgeDemoData();
        const list = await backend.loadProjects();
        if (!cancelled) setProjects(list);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Could not load your projects.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectsTick]);

  // Load the active project's records whenever the active project changes.
  // Each project id maps to its own slice, so opening a different project swaps
  // in its own records (a new project starts empty).
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    setDataError(null);
    // Only surface a spinner if the load actually takes a moment — avoids a
    // flash on every project open when the backend is local (near-instant).
    const spinner = setTimeout(() => { if (!cancelled) setDataLoading(true); }, 180);
    (async () => {
      try {
        const [t, d, s, b, v] = await Promise.all([
          backend.loadTasks(activeId),
          backend.loadDocs(activeId),
          backend.loadSchedule(activeId),
          backend.loadBudget(activeId),
          backend.loadVendors(activeId),
        ]);
        if (cancelled) return;
        setTasks(t);
        setDocs(d);
        setSchedule(s);
        setBudget(b);
        setVendors(v);
      } catch (e) {
        if (!cancelled) setDataError(e?.message || 'Could not load this project.');
      } finally {
        clearTimeout(spinner);
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => { cancelled = true; clearTimeout(spinner); };
  }, [activeId, dataTick]);

  // ── Projects ────────────────────────────────────────────────────────
  const openProject = useCallback((id) => {
    setActiveId(id);
    setView('dashboard');
  }, []);
  const backToProjects = useCallback(() => setView('picker'), []);

  const createProject = useCallback(
    async ({ name, address }) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const id = uid();
      const p = {
        id,
        name: trimmed,
        short: deriveShort(trimmed),
        code: 'BUILD #' + id.slice(0, 5).toUpperCase(),
        address: address.trim() || 'Address not set',
        phaseLabel: 'PHASE 1/9 · PLANNING',
        status: 'Planning', // a new project starts as an empty, zeroed slate
        percent: 0,
        startDate: '',
        targetDate: '',
      };
      const next = [p, ...projects];
      setProjects(next);
      // Persist before navigating so the (Supabase) project row exists before
      // the active-project effect loads its child records.
      await backend.saveProjects(next);
      setActiveId(id);
      setView('dashboard');
    },
    [projects]
  );

  // Edit a project's basics (name, address, status, phase, %, dates) and
  // persist. The name drives the sidebar short name, so recompute it here.
  const updateProject = useCallback((id, patch) => {
    setProjects((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...patch };
        if (patch.name != null) merged.short = deriveShort(patch.name) || p.short;
        return merged;
      });
      backend.saveProjects(next);
      return next;
    });
  }, []);

  // Delete a project and everything under it: its records, its photos, and any
  // document attachments. On Supabase the record delete cascades from the
  // project row; files (storage/IndexedDB) are removed explicitly.
  const removeProject = useCallback(
    async (id) => {
      try {
        const projDocs = await backend.loadDocs(id);
        for (const d of projDocs) if (d.filePath) await fileStore.remove(d.filePath).catch(() => {});
      } catch {
        /* ignore file-cleanup errors */
      }
      for (const slot of PHOTO_SLOTS) await fileStore.remove(`${id}/${slot}`).catch(() => {});

      const next = projects.filter((p) => p.id !== id);
      setProjects(next);
      await backend.saveProjects(next);
      await backend.deleteProjectRecords(id).catch(() => {});
      if (activeId === id) {
        setActiveId(null);
        setView('picker');
      }
    },
    [projects, activeId]
  );

  // ── Tasks (scoped to the active project) ────────────────────────────
  const toggleTask = useCallback(
    (id) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
        backend.saveTasks(activeId, next);
        return next;
      });
    },
    [activeId]
  );

  const addTask = useCallback(
    ({ title, due }) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const t = { id: uid(), title: trimmed, due: due.trim().toUpperCase(), owner: 'OWNER', urgent: false, done: false };
      setTasks((prev) => {
        const next = [t, ...prev];
        backend.saveTasks(activeId, next);
        return next;
      });
    },
    [activeId]
  );

  const removeTask = useCallback(
    (id) => {
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== id);
        backend.saveTasks(activeId, next);
        return next;
      });
    },
    [activeId]
  );

  // ── Documents (scoped to the active project) ────────────────────────
  // An optional file is uploaded to the fileStore (IndexedDB or Supabase
  // Storage) under `<projectId>/doc-<id>-<name>`; the doc keeps the path.
  const addDoc = useCallback(
    async ({ title, type, amount, file }) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const id = uid();
      let filePath;
      if (file) {
        filePath = `${activeId}/doc-${id}-${fileStore.safeName(file.name)}`;
        try {
          await fileStore.put(filePath, file);
        } catch {
          filePath = undefined; // upload failed — keep the record, drop the file
        }
      }
      const d = { id, title: trimmed, type, date: todayLabel(), amount: amount.trim() || undefined, filePath };
      setDocs((prev) => {
        const next = [d, ...prev];
        backend.saveDocs(activeId, next);
        return next;
      });
    },
    [activeId]
  );

  const removeDoc = useCallback(
    async (id) => {
      const doc = docs.find((d) => d.id === id);
      if (doc?.filePath) await fileStore.remove(doc.filePath).catch(() => {});
      setDocs((prev) => {
        const next = prev.filter((d) => d.id !== id);
        backend.saveDocs(activeId, next);
        return next;
      });
    },
    [activeId, docs]
  );

  // ── Schedule (scoped to the active project) ─────────────────────────
  const PHASE_CYCLE = { upcoming: 'active', active: 'done', done: 'upcoming' };
  const persistSchedule = (updater) =>
    setSchedule((prev) => {
      const next = updater(prev);
      backend.saveSchedule(activeId, next);
      return next;
    });

  const addPhase = useCallback(
    ({ name, status, start, end }) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const phase = { id: uid(), name: trimmed, status: status || 'upcoming', percent: 0, start: start || '', end: end || '' };
      persistSchedule((prev) => [...prev, phase]);
    },
    [activeId]
  );
  const removePhase = useCallback((id) => persistSchedule((prev) => prev.filter((p) => p.id !== id)), [activeId]);
  // Clicking a phase node advances its status upcoming → active → done → …
  const cyclePhaseStatus = useCallback(
    (id) => persistSchedule((prev) => prev.map((p) => (p.id === id ? { ...p, status: PHASE_CYCLE[p.status] || 'upcoming' } : p))),
    [activeId]
  );

  // ── Budget (scoped to the active project) ───────────────────────────
  const persistBudget = (updater) =>
    setBudget((prev) => {
      const next = updater(prev);
      backend.saveBudget(activeId, next);
      return next;
    });

  const addBudgetCategory = useCallback(
    ({ name, budget: amt, spent }) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const cat = { id: uid(), name: trimmed, budget: Math.max(0, Number(amt) || 0), spent: Math.max(0, Number(spent) || 0) };
      persistBudget((prev) => ({ ...prev, categories: [...prev.categories, cat] }));
    },
    [activeId]
  );
  const removeBudgetCategory = useCallback(
    (id) => persistBudget((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) })),
    [activeId]
  );
  const setContingency = useCallback(
    ({ total, used }) => persistBudget((prev) => ({ ...prev, contingencyTotal: Math.max(0, Number(total) || 0), contingencyUsed: Math.max(0, Number(used) || 0) })),
    [activeId]
  );

  // ── Vendors (scoped to the active project) ──────────────────────────
  const persistVendors = (updater) =>
    setVendors((prev) => {
      const next = updater(prev);
      backend.saveVendors(activeId, next);
      return next;
    });

  const addVendor = useCallback(
    ({ name, trade, status, phone, email }) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const v = {
        id: uid(),
        name: trimmed,
        trade: trade.trim().toUpperCase(),
        status: status.trim() || 'Scheduled',
        phone: (phone || '').trim(),
        email: (email || '').trim(),
      };
      persistVendors((prev) => [...prev, v]);
    },
    [activeId]
  );
  const removeVendor = useCallback((id) => persistVendors((prev) => prev.filter((v) => v.id !== id)), [activeId]);

  const active = useMemo(
    () => projects.find((p) => p.id === activeId) || projects[0] || {},
    [projects, activeId]
  );

  return {
    view,
    projects,
    active,
    tasks,
    docs,
    schedule,
    budget,
    vendors,
    loading,
    error,
    reloadProjects,
    dataLoading,
    dataError,
    reloadData,
    openProject,
    backToProjects,
    createProject,
    updateProject,
    removeProject,
    toggleTask,
    addTask,
    removeTask,
    addDoc,
    removeDoc,
    addPhase,
    removePhase,
    cyclePhaseStatus,
    addBudgetCategory,
    removeBudgetCategory,
    setContingency,
    addVendor,
    removeVendor,
  };
}
