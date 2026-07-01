// Unit tests for the budget roll-up + money formatter. These are the derived
// values that feed the budget card and the hero "Budget Spent" KPI — none of
// them are stored, so they must be computed correctly from the categories.

import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const { formatK } = await import('./storage.js');
const { budgetTotals } = await import('./useStore.js');

test('formatK renders thousands with one decimal, $0 for zero', () => {
  assert.equal(formatK(78000), '$78.0K');
  assert.equal(formatK(6800), '$6.8K');
  assert.equal(formatK(358400), '$358.4K');
  assert.equal(formatK(0), '$0');
  assert.equal(formatK(undefined), '$0');
});

test('budgetTotals sums spent/budget and derives % used', () => {
  const budget = {
    categories: [
      { budget: 78000, spent: 78000 },
      { budget: 92000, spent: 90500 },
      { budget: 134000, spent: 81000 },
    ],
    contingencyTotal: 74000,
    contingencyUsed: 12000,
  };
  const t = budgetTotals(budget);
  assert.equal(t.spent, 249500);
  assert.equal(t.total, 304000);
  assert.equal(t.percentUsed, Math.round((249500 / 304000) * 100)); // 82
  assert.equal(t.contingencyRemaining, 62000);
  assert.equal(t.contingencyTotal, 74000);
});

test('budgetTotals handles an empty budget without dividing by zero', () => {
  const t = budgetTotals({ categories: [], contingencyTotal: 0, contingencyUsed: 0 });
  assert.equal(t.spent, 0);
  assert.equal(t.total, 0);
  assert.equal(t.percentUsed, 0);
  assert.equal(t.contingencyRemaining, 0);
});

test('budgetTotals never reports negative contingency remaining', () => {
  const t = budgetTotals({ categories: [], contingencyTotal: 10000, contingencyUsed: 15000 });
  assert.equal(t.contingencyRemaining, 0);
});

test('budgetTotals tolerates a missing/undefined budget', () => {
  const t = budgetTotals(undefined);
  assert.equal(t.total, 0);
  assert.equal(t.percentUsed, 0);
});
