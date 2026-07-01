import { color, font } from '../../lib/tokens.js';
import { formatDate } from '../../lib/storage.js';
import EmptyState from './EmptyState.jsx';

// A simple Gantt timeline for the construction schedule: one row per phase,
// a month-based x-axis, and a bar spanning each phase's start→end (colored by
// status, with a fill for the active phase's percent). Pure CSS/flex — no lib.

const LABEL_W = 116; // left column for phase names

const parse = (iso) => {
  if (!iso) return null;
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d) ? null : d;
};

function barColor(status) {
  if (status === 'done') return color.green;
  if (status === 'active') return color.accent;
  return '#CFC9BF'; // upcoming
}

export default function GanttChart({ schedule }) {
  const dated = schedule
    .map((p) => ({ ...p, s: parse(p.start), e: parse(p.end) }))
    .filter((p) => p.s && p.e && p.e >= p.s);

  if (dated.length === 0) {
    return <EmptyState label="ADD START & END DATES TO PHASES TO SEE THE TIMELINE" />;
  }

  // Range padded to whole months for a clean axis.
  const min = new Date(Math.min(...dated.map((p) => p.s.getTime())));
  const max = new Date(Math.max(...dated.map((p) => p.e.getTime())));
  const rangeStart = new Date(min.getFullYear(), min.getMonth(), 1);
  const rangeEnd = new Date(max.getFullYear(), max.getMonth() + 1, 1);
  const total = rangeEnd - rangeStart;
  const pct = (d) => ((d - rangeStart) / total) * 100;

  const months = [];
  for (let m = new Date(rangeStart); m < rangeEnd; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) {
    months.push(new Date(m));
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayInRange = today >= rangeStart && today <= rangeEnd;

  const monthLabel = (mo, i) => {
    const base = mo.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return i === 0 || mo.getMonth() === 0 ? `${base} '${String(mo.getFullYear()).slice(2)}` : base;
  };

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ minWidth: Math.max(520, months.length * 64) }}>
        {/* Month header */}
        <div style={{ display: 'flex', height: 20 }}>
          <div style={{ width: LABEL_W, flex: 'none' }} />
          <div style={{ position: 'relative', flex: 1 }}>
            {months.map((mo, i) => (
              <div key={i} style={{ position: 'absolute', left: pct(mo) + '%', top: 0, fontFamily: font.mono, fontSize: 9.5, color: color.faint, paddingLeft: 5, letterSpacing: '0.03em' }}>
                {monthLabel(mo, i)}
              </div>
            ))}
          </div>
        </div>

        {/* Rows (with month gridlines + today marker behind the bars) */}
        <div style={{ position: 'relative', paddingTop: 4 }}>
          <div style={{ position: 'absolute', left: LABEL_W, right: 0, top: 0, bottom: 0, pointerEvents: 'none' }}>
            {months.map((mo, i) => (
              <div key={i} style={{ position: 'absolute', left: pct(mo) + '%', top: 0, bottom: 0, borderLeft: `1px solid ${color.track}` }} />
            ))}
            {todayInRange && (
              <div title="Today" style={{ position: 'absolute', left: pct(today) + '%', top: -2, bottom: 0, borderLeft: `2px dashed ${color.accent}`, opacity: 0.55 }} />
            )}
          </div>

          {dated.map((p) => {
            const left = pct(p.s);
            const width = Math.max(pct(p.e) - left, 1.2);
            const fill = barColor(p.status);
            const isUpcoming = p.status === 'upcoming';
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', height: 30 }}>
                <div style={{ width: LABEL_W, flex: 'none', paddingRight: 8, fontSize: 12, fontWeight: p.status === 'active' ? 700 : 500, color: isUpcoming ? color.muted : p.status === 'active' ? color.accent : color.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </div>
                <div style={{ position: 'relative', flex: 1, height: '100%' }}>
                  <div
                    title={`${p.name}: ${formatDate(p.start)} → ${formatDate(p.end)}`}
                    style={{ position: 'absolute', left: left + '%', width: width + '%', top: 8, height: 15, background: fill, borderRadius: 5, minWidth: 5, overflow: 'hidden' }}
                  >
                    {p.status === 'active' && p.percent > 0 && (
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: Math.min(100, p.percent) + '%', background: color.accentDark }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Range footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingLeft: LABEL_W, fontFamily: font.mono, fontSize: 9.5, color: color.fainter, letterSpacing: '0.03em' }}>
          <span>{formatDate(min.toISOString().slice(0, 10))}</span>
          <span>{formatDate(max.toISOString().slice(0, 10))}</span>
        </div>
      </div>
    </div>
  );
}
