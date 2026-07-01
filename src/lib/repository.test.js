// Unit tests for the repository (the data-access layer). Run with `npm test`
// (Node's built-in test runner — no extra dependencies). These pin down the
// behaviour that makes the app multi-project: per-project namespacing,
// isolation between projects, the empty blank-slate baseline, and the one-time
// purge of demo data left by older builds.

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// node has no localStorage — install a minimal in-memory implementation that
// matches the small surface storage.js uses (getItem/setItem/removeItem).
function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  };
}
globalThis.localStorage = memoryStorage();

const repo = await import('./repository.js');

beforeEach(() => globalThis.localStorage.clear());

test('keys are namespaced per project and kind', () => {
  assert.equal(repo.taskKey('p1'), 'realtrack.p1.tasks.v1');
  assert.equal(repo.docKey('p2'), 'realtrack.p2.docs.v1');
  assert.notEqual(repo.taskKey('a'), repo.taskKey('b'));
});

test('the project list starts empty (no seed data)', () => {
  assert.deepEqual(repo.loadProjects(), []);
});

test('a new project starts empty and persists that baseline', () => {
  assert.deepEqual(repo.loadTasks('brand-new'), []);
  // baseline is written, so a second read is stable
  assert.equal(localStorage.getItem(repo.taskKey('brand-new')), '[]');
  // budget gets the object-shaped empty default
  assert.deepEqual(repo.loadBudget('brand-new'), { categories: [], contingencyTotal: 0, contingencyUsed: 0 });
});

test('records are isolated between projects', () => {
  repo.saveTasks('alpha', [{ id: '1', title: 'Alpha only', done: false }]);
  repo.saveTasks('beta', [{ id: '2', title: 'Beta only', done: false }]);

  assert.deepEqual(repo.loadTasks('alpha').map((t) => t.title), ['Alpha only']);
  assert.deepEqual(repo.loadTasks('beta').map((t) => t.title), ['Beta only']);
});

test('saved records survive a reload', () => {
  repo.saveTasks('p1', [{ id: 'x', title: 'Edited', done: true }]);
  assert.deepEqual(repo.loadTasks('p1'), [{ id: 'x', title: 'Edited', done: true }]);
});

test('purgeDemoData removes demo projects + their records, keeps real ones', () => {
  localStorage.setItem(
    repo.KEY_PROJECTS,
    JSON.stringify([{ id: 'mr204', name: 'Maple' }, { id: 'cs108', name: 'Cedar' }, { id: 'mine', name: 'Mine' }])
  );
  repo.saveTasks('mr204', [{ id: 't', title: 'demo', done: false }]);
  repo.saveBudget('cs108', { categories: [{ id: 'c', budget: 1, spent: 1 }], contingencyTotal: 0, contingencyUsed: 0 });
  repo.saveTasks('mine', [{ id: 'm', title: 'real', done: false }]);

  repo.purgeDemoData();

  const projects = JSON.parse(localStorage.getItem(repo.KEY_PROJECTS));
  assert.deepEqual(projects.map((p) => p.id), ['mine']); // demos gone, real kept
  assert.equal(localStorage.getItem(repo.taskKey('mr204')), null);
  assert.equal(localStorage.getItem(repo.budgetKey('cs108')), null);
  assert.deepEqual(repo.loadTasks('mine').map((t) => t.title), ['real']);
});

test('deleteProjectRecords clears every record kind for a project', () => {
  repo.saveTasks('p1', [{ id: 't', title: 'x', done: false }]);
  repo.saveDocs('p1', [{ id: 'd', title: 'y', type: 'Receipt' }]);
  repo.saveSchedule('p1', [{ id: 's', name: 'Permits', status: 'done' }]);
  repo.saveBudget('p1', { categories: [{ id: 'c', budget: 1, spent: 1 }], contingencyTotal: 0, contingencyUsed: 0 });
  repo.saveVendors('p1', [{ id: 'v', name: 'Acme' }]);
  // an unrelated project must be untouched
  repo.saveTasks('other', [{ id: 'o', title: 'keep', done: false }]);

  repo.deleteProjectRecords('p1');

  for (const key of [repo.taskKey('p1'), repo.docKey('p1'), repo.scheduleKey('p1'), repo.budgetKey('p1'), repo.vendorKey('p1')]) {
    assert.equal(localStorage.getItem(key), null);
  }
  assert.deepEqual(repo.loadTasks('other').map((t) => t.title), ['keep']);
});

test('purgeDemoData runs once and is a no-op afterward', () => {
  repo.purgeDemoData(); // sets the flag on a clean store
  // a stray demo project added later (shouldn't normally happen) is left alone
  localStorage.setItem(repo.KEY_PROJECTS, JSON.stringify([{ id: 'mr204', name: 'Maple' }]));
  repo.purgeDemoData();
  assert.deepEqual(JSON.parse(localStorage.getItem(repo.KEY_PROJECTS)).map((p) => p.id), ['mr204']);
});
