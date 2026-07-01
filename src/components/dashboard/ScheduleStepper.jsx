import { useState } from 'react';
import { color, font } from '../../lib/tokens.js';
import Card from './Card.jsx';
import EmptyState from './EmptyState.jsx';
import GanttChart from './GanttChart.jsx';

const GREEN = color.green;
const GREY = '#EAE6DF';

// ISO date → short milestone label, e.g. '2026-08-18' → 'AUG 18'.
const shortDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
};

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
  return shortDate(phase.end) || phase.date || '—';
}

const dateInput = { height: 34, padding: '0 8px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 12.5, background: '#fff', color: color.ink };

export default function ScheduleStepper({ schedule, addPhase, removePhase, cyclePhaseStatus }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('timeline'); // 'timeline' (Gantt) | 'stepper'
  const [draft, setDraft] = useState({ name: '', status: 'upcoming', start: '', end: '' });
  const last = schedule.length - 1;
  const doneCount = schedule.filter((p) => p.status === 'done').length;

  const close = () => {
    setOpen(false);
    setDraft({ name: '', status: 'upcoming', start: '', end: '' });
  };
  const submit = () => {
    addPhase(draft);
    close();
  };

  const toggleBtn = (id, label) => (
    <button
      onClick={() => setView(id)}
      style={{ height: 26, padding: '0 10px', border: 'none', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: view === id ? '#fff' : 'transparent', color: view === id ? color.ink : color.faint, boxShadow: view === id ? '0 1px 2px rgba(27,26,23,0.08)' : 'none' }}
    >
      {label}
    </button>
  );

  return (
    <Card pad="22px 24px" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 16 : 20, gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Construction Schedule</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {schedule.length > 0 && <span style={{ fontFamily: font.mono, fontSize: 11, color: color.faint }}>{doneCount} OF {schedule.length} DONE</span>}
          <div style={{ display: 'flex', gap: 2, padding: 2, background: '#F1EEE9', borderRadius: 8 }}>
            {toggleBtn('timeline', 'Timeline')}
            {toggleBtn('stepper', 'Stepper')}
          </div>
          <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: color.accent, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>+ Add</button>
        </div>
      </div>

      {open && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, padding: 12, background: '#FAF8F5', border: '1px solid #ECE8E1', borderRadius: 11, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Phase name" autoFocus style={{ flex: 1, minWidth: 140, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' }} />
          <select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))} style={{ height: 34, padding: '0 9px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff', color: color.ink }}>
            <option value="upcoming">Upcoming</option><option value="active">Active</option><option value="done">Done</option>
          </select>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: font.mono, fontSize: 10, color: color.faint }}>
            START <input type="date" aria-label="Start date" value={draft.start} onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))} style={dateInput} />
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: font.mono, fontSize: 10, color: color.faint }}>
            END <input type="date" aria-label="End date" value={draft.end} onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))} style={dateInput} />
          </label>
          <button onClick={submit} style={{ height: 34, padding: '0 15px', background: color.accent, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add</button>
          <button onClick={close} style={{ height: 34, width: 34, background: '#fff', color: color.faint, border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
      )}

      {schedule.length === 0 ? (
        <EmptyState label="NO SCHEDULE YET — ADD PHASES WITH START & END DATES" />
      ) : view === 'timeline' ? (
        <GanttChart schedule={schedule} />
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
