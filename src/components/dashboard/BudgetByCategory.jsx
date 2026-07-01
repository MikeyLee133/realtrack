import { useState } from 'react';
import { color, font } from '../../lib/tokens.js';
import { formatK } from '../../lib/storage.js';
import Card from './Card.jsx';
import EmptyState from './EmptyState.jsx';

// Per-category bar % and color are derived from the stored numbers.
function categoryView(c) {
  const pct = c.budget > 0 ? Math.min(100, Math.round((c.spent / c.budget) * 100)) : 0;
  const barColor = c.active
    ? color.accent
    : c.spent === 0
      ? '#DAD6CE'
      : pct >= 90
        ? color.green
        : color.amber;
  return { ...c, pct, barColor };
}

const numInput = { width: 110, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' };

export default function BudgetByCategory({ budget, totals, addBudgetCategory, removeBudgetCategory, setContingency }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', budget: '', spent: '' });
  const [cOpen, setCOpen] = useState(false);
  const [cDraft, setCDraft] = useState({ total: '', used: '' });

  const categories = budget?.categories || [];

  const close = () => {
    setOpen(false);
    setDraft({ name: '', budget: '', spent: '' });
  };
  const submit = () => {
    addBudgetCategory(draft);
    close();
  };
  const openContingency = () => {
    setCDraft({ total: budget.contingencyTotal || '', used: budget.contingencyUsed || '' });
    setCOpen(true);
  };
  const submitContingency = () => {
    setContingency(cDraft);
    setCOpen(false);
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Budget by Category</h3>
        <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: color.accent, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>+ Add</button>
      </div>

      {open && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, padding: 12, background: '#FAF8F5', border: '1px solid #ECE8E1', borderRadius: 11, flexWrap: 'wrap' }}>
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Category" autoFocus style={{ flex: 1, minWidth: 130, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' }} />
          <input type="number" min="0" value={draft.spent} onChange={(e) => setDraft((d) => ({ ...d, spent: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Spent ($)" style={numInput} />
          <input type="number" min="0" value={draft.budget} onChange={(e) => setDraft((d) => ({ ...d, budget: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Budget ($)" style={numInput} />
          <button onClick={submit} style={{ height: 34, padding: '0 15px', background: color.accent, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add</button>
          <button onClick={close} style={{ height: 34, width: 34, background: '#fff', color: color.faint, border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        {categories.length === 0 && <EmptyState label="NO BUDGET CATEGORIES YET — ADD ONE" />}
        {categories.map(categoryView).map((c) => (
          <div key={c.id} className="rt-removable">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                {c.name}
                {c.active && <span style={{ fontFamily: font.mono, fontSize: 10, color: color.accent, background: color.accentSoft, padding: '2px 6px', borderRadius: 5, marginLeft: 5 }}>ACTIVE</span>}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: font.mono, fontSize: 12, color: color.muted }}>{formatK(c.spent)} <span style={{ color: '#BCB7AD' }}>/ {formatK(c.budget)}</span></span>
                <button className="rt-remove" onClick={() => removeBudgetCategory(c.id)} title="Remove category" style={{ width: 18, height: 18, flex: 'none', border: 'none', background: 'none', color: color.fainter, fontSize: 15, cursor: 'pointer', lineHeight: '16px', padding: 0 }}>×</button>
              </span>
            </div>
            <div style={{ height: 7, background: color.track, borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: c.pct + '%', height: '100%', background: c.barColor, borderRadius: 5 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${color.track}` }}>
        {cOpen ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: font.mono, fontSize: 11, color: color.faint, letterSpacing: '0.04em', flex: 1 }}>CONTINGENCY (USED / TOTAL)</span>
            <input type="number" min="0" value={cDraft.used} onChange={(e) => setCDraft((d) => ({ ...d, used: e.target.value }))} placeholder="Used ($)" style={{ ...numInput, width: 100 }} />
            <input type="number" min="0" value={cDraft.total} onChange={(e) => setCDraft((d) => ({ ...d, total: e.target.value }))} placeholder="Total ($)" style={{ ...numInput, width: 100 }} />
            <button onClick={submitContingency} style={{ height: 34, padding: '0 13px', background: color.accent, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: font.mono, fontSize: 11, color: color.faint, letterSpacing: '0.04em' }}>CONTINGENCY REMAINING</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 600, color: color.greenInk }}>{formatK(totals.contingencyRemaining)} of {formatK(totals.contingencyTotal)}</span>
              <button onClick={openContingency} title="Edit contingency" style={{ background: 'none', border: 'none', color: color.accent, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Edit</button>
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
