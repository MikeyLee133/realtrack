// Unit tests for the pure date helpers used by the hero card. Run with
// `npm test`. These cover the formatting and the derived "days left" that
// replaced the prototype's hard-coded values.

import { test } from 'node:test';
import assert from 'node:assert/strict';

// storage.js references `localStorage` inside load/save; the date helpers
// don't, but provide a stub so importing the module never throws.
globalThis.localStorage ??= {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const { formatDate, daysUntil } = await import('./storage.js');

test('formatDate renders an ISO date for display', () => {
  assert.equal(formatDate('2026-01-13'), 'Jan 13, 2026');
  assert.equal(formatDate('2026-11-20'), 'Nov 20, 2026');
});

test('formatDate returns an em dash for empty/unset dates', () => {
  assert.equal(formatDate(''), '—');
  assert.equal(formatDate(undefined), '—');
  assert.equal(formatDate(null), '—');
});

test('daysUntil returns null when there is no target date', () => {
  assert.equal(daysUntil(''), null);
  assert.equal(daysUntil(undefined), null);
});

test('daysUntil counts whole days to a future date and never goes negative', () => {
  const inTen = new Date();
  inTen.setHours(0, 0, 0, 0);
  inTen.setDate(inTen.getDate() + 10);
  const iso = inTen.toISOString().slice(0, 10);
  assert.equal(daysUntil(iso), 10);

  // a past date clamps to 0 rather than reporting negative days
  assert.equal(daysUntil('2000-01-01'), 0);
});
