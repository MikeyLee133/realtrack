import { useState } from 'react';
import { color, font } from '../../lib/tokens.js';
import Card from './Card.jsx';
import EmptyState from './EmptyState.jsx';

const GREEN = color.green;
const GREY = '#EAE6DF';

function CheckCircle() {
  return (
    <div style={{ width: 26, height: 26, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
    </div>
  );
}

function Node({ phase, order }) {
  if (phase.status === 'done') return <CheckCircle />;
  if (phase.status === 'active') {
    return (
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: color.accent, boxShadow: `0 0 0 4px ${color.accentSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, color: '#fff', fontFamily: font.mono, fontSize: 11, fontWeight: 600 }}>
        {order}
      </div>
    );
  }
  return <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff', border: '2px solid #DAD6CE', zIndex: 1 }} />;
}

// Sub-label under a node is derived from status (+ percent for active).
function subLabel(phase) {
  if (phase.status === 'done') return 'DONE';
  if (phase.status === 'active') return `${phase.percent || 0}% · ACTIVE`;
  return phase.date || '—';
}

export default function ScheduleStepper({ schedule, addPhase, removePhase, cyclePhaseStatus }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', status: 'upcoming', date: '' });
  const last = schedule.length - 1;
  const doneCount = schedule.filter((p) => p.status === 'done').length;

  const close = () => {
    setOpen(false);
    setDraft({ name: '', status: 'upcoming', date: '' });
  };
  const submit = () => {
    addPhase(draft);
    close();
  };

  return (
    <Card pad="22px 24px" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 16 : 20 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Construction Schedule</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {schedule.length > 0 && <span style={{ fontFamily: font.mono, fontSize: 11, color: color.faint }}>{doneCount} OF {schedule.length} PHASES DONE</span>}
          <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: color.accent, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>+ Add</button>
        </div>
      </div>

      {open && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, padding: 12, background: '#FAF8F5', border: '1px solid #ECE8E1', borderRadius: 11, flexWrap: 'wrap' }}>
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Phase name" autoFocus style={{ flex: 1, minWidth: 140, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' }} />
          <select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))} style={{ height: 34, padding: '0 9px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff', color: color.ink }}>
            <option value="upcoming">Upcoming</option><option value="active">Active</option><option value="done">Done</option>
          </select>
          <input value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Milestone (e.g. Aug 18)" style={{ width: 150, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' }} />
          <button onClick={submit} style={{ height: 34, padding: '0 15px', background: color.accent, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add</button>
          <button onClick={close} style={{ height: 34, width: 34, background: '#fff', color: color.faint, border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
      )}

      {schedule.length === 0 ? (
        <EmptyState label="NO SCHEDULE YET — ADD PHASES (CLICK A PHASE TO ADVANCE ITS STATUS)" />
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: schedule.length * 64 }}>
          {schedule.map((phase, i) => {
            const leftColor = i > 0 && schedule[i - 1].status === 'done' ? GREEN : GREY;
            const rightColor = phase.status === 'done' ? GREEN : GREY;
            const isActive = phase.status === 'active';
            const isUpcoming = phase.status === 'upcoming';
            return (
              <div key={phase.id} className="rt-removable" onClick={() => cyclePhaseStatus(phase.id)} title="Click to advance status" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', cursor: 'pointer' }}>
                {i > 0 && <div style={{ position: 'absolute', top: 13, left: '-50%', width: '50%', height: 3, background: leftColor }} />}
                {i < last && <div style={{ position: 'absolute', top: 13, left: '50%', right: '-50%', height: 3, background: rightColor }} />}
                <Node phase={phase} order={i + 1} />
                <div style={{ fontSize: 11.5, fontWeight: isActive ? 700 : 600, marginTop: 10, color: isActive ? color.accent : isUpcoming ? color.muted : color.ink }}>{phase.name}</div>
                <div style={{ fontFamily: font.mono, fontSize: 9.5, marginTop: 2, color: isActive ? color.accent : isUpcoming ? color.fainter : color.faint }}>{subLabel(phase)}</div>
                <button className="rt-remove" onClick={(e) => { e.stopPropagation(); removePhase(phase.id); }} title="Remove phase" style={{ marginTop: 4, width: 18, height: 18, border: 'none', background: 'none', color: color.fainter, fontSize: 14, cursor: 'pointer', lineHeight: '16px', padding: 0 }}>×</button>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </Card>
  );
}
