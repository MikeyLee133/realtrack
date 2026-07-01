import { useState, useEffect } from 'react';
import { color, font } from '../../lib/tokens.js';
import { PROJECT_STATUSES } from '../../lib/useStore.js';

// Modal for editing a project's basics (name, address, status, phase,
// % complete, start/target dates). On save it calls onSave(patch); the store
// merges + persists. These are the per-project fields the user controls — the
// project name is decided here and saved with the rest.

const inputStyle = {
  height: 38,
  padding: '0 12px',
  border: '1px solid #E1DDD5',
  borderRadius: 9,
  fontSize: 13.5,
  background: '#fff',
  color: color.ink,
  width: '100%',
};

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontFamily: font.mono, fontSize: 10.5, letterSpacing: '0.04em', color: color.faint }}>{label}</span>
      {children}
    </label>
  );
}

export default function EditProjectModal({ project, onSave, onClose }) {
  const [draft, setDraft] = useState(project);

  // Re-sync if a different project is opened while mounted.
  useEffect(() => setDraft(project), [project]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (key) => (e) => {
    const value = e.target.value;
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const submit = () => {
    if (!draft.name.trim()) return; // name is required
    onSave({
      name: draft.name.trim(),
      address: draft.address.trim() || 'Address not set',
      status: draft.status,
      phaseLabel: draft.phaseLabel.trim(),
      percent: Math.max(0, Math.min(100, Number(draft.percent) || 0)),
      startDate: draft.startDate || '',
      targetDate: draft.targetDate || '',
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(27,26,23,0.34)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(560px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#fff', border: `1px solid ${color.hairline}`, borderRadius: 16, padding: '24px 26px', boxShadow: '0 24px 60px rgba(27,26,23,0.22)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>Edit project</h3>
          <button onClick={onClose} style={{ height: 32, width: 32, background: '#fff', color: color.faint, border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 17, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="PROJECT NAME">
            <input value={draft.name} onChange={set('name')} placeholder="Project name" autoFocus style={inputStyle} />
          </Field>
          <Field label="ADDRESS">
            <input value={draft.address === 'Address not set' ? '' : draft.address} onChange={set('address')} placeholder="Street address" style={inputStyle} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="STATUS">
              <select value={draft.status} onChange={set('status')} style={inputStyle}>
                {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="% COMPLETE">
              <input type="number" min="0" max="100" value={draft.percent} onChange={set('percent')} style={inputStyle} />
            </Field>
          </div>

          <Field label="CURRENT PHASE">
            <input value={draft.phaseLabel} onChange={set('phaseLabel')} placeholder="e.g. PHASE 4/9 · FRAMING" style={inputStyle} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="START DATE">
              <input type="date" value={draft.startDate || ''} onChange={set('startDate')} style={inputStyle} />
            </Field>
            <Field label="TARGET DATE">
              <input type="date" value={draft.targetDate || ''} onChange={set('targetDate')} style={inputStyle} />
            </Field>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ height: 40, padding: '0 18px', background: '#fff', color: color.muted, border: '1px solid #E1DDD5', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button className="rt-btn-primary" onClick={submit} style={{ height: 40, padding: '0 20px', background: color.accent, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}
