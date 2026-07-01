// Unit tests for the JSON backup (export/import). This is a data-safety
// feature, so it's worth pinning down: validation, a full round-trip, and the
// non-destructive merge. Runs through the local (localStorage) backend with an
// in-memory storage stub — same approach as repository.test.js.

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

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

const backup = await import('./backup.js');

beforeEach(() => globalThis.localStorage.clear());

const emptyBudget = { categories: [], contingencyTotal: 0, contingencyUsed: 0 };
const entry = (id, name, extra = {}) => ({
  project: { id, name, status: 'On Track', percent: 0 },
  tasks: [], docs: [], schedule: [], budget: { ...emptyBudget }, vendors: [],
  ...extra,
});

test('isValidBackup accepts well-formed backups and rejects junk', () => {
  assert.equal(backup.isValidBackup({ projects: [entry('a', 'A')] }), true);
  assert.equal(backup.isValidBackup({ projects: [] }), true);
  assert.equal(backup.isValidBackup(null), false);
  assert.equal(backup.isValidBackup({}), false);
  assert.equal(backup.isValidBackup({ projects: [{ tasks: [] }] }), false); // no project.id
});

test('export → import round-trips projects and all record kinds', async () => {
  const data = {
    app: 'realtrack', version: 1, exportedAt: 'x',
    projects: [
      entry('p1', 'Cedar Street', {
        tasks: [{ id: 't1', title: 'Pour footings', done: false }],
        docs: [{ id: 'd1', title: 'Permit', type: 'Permit' }],
        schedule: [{ id: 's1', name: 'Permits', status: 'done' }],
        budget: { categories: [{ id: 'c1', name: 'Site', budget: 1000, spent: 400 }], contingencyTotal: 100, contingencyUsed: 0 },
        vendors: [{ id: 'v1', name: 'Acme', trade: 'FRAMING', status: 'On site' }],
      }),
    ],
  };
  await backup.importAll(data);

  const out = await backup.exportAll();
  assert.equal(out.projects.length, 1);
  const e = out.projects[0];
  assert.equal(e.project.name, 'Cedar Street');
  assert.deepEqual(e.tasks.map((t) => t.title), ['Pour footings']);
  assert.deepEqual(e.docs.map((d) => d.title), ['Permit']);
  assert.deepEqual(e.schedule.map((s) => s.name), ['Permits']);
  assert.deepEqual(e.budget.categories.map((c) => c.name), ['Site']);
  assert.equal(e.budget.contingencyTotal, 100);
  assert.equal(e.vendors[0].name, 'Acme');
});

test('import is non-destructive — keeps existing projects not in the backup', async () => {
  await backup.importAll({ projects: [entry('keep', 'Keep')] });
  await backup.importAll({ projects: [entry('new', 'New')] });
  const out = await backup.exportAll();
  assert.deepEqual(out.projects.map((p) => p.project.id).sort(), ['keep', 'new']);
});

test('import overwrites a same-id project (restore)', async () => {
  await backup.importAll({ projects: [entry('p1', 'Old name')] });
  await backup.importAll({ projects: [entry('p1', 'New name')] });
  const out = await backup.exportAll();
  assert.equal(out.projects.length, 1);
  assert.equal(out.projects[0].project.name, 'New name');
});

test('importAll rejects an invalid backup', async () => {
  await assert.rejects(() => backup.importAll({ nope: true }), /not a valid/i);
});
