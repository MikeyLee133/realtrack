import { color, font } from '../../lib/tokens.js';
import { statusStyle } from '../../lib/useStore.js';
import { formatDate, daysUntil, formatK } from '../../lib/storage.js';
import { useIsMobile } from '../../lib/useIsMobile.js';
import Card from './Card.jsx';
import ImageSlot from '../ImageSlot.jsx';

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: font.mono, fontSize: 10.5, color: color.faint, letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{value}</div>
    </div>
  );
}

// Hero + KPI stack. The hero (status, phase, completion, dates) is driven by
// the active project and edited via the Edit Project modal; the BUDGET SPENT
// card stays static for now (HANDOFF §2). KPI counters derive from tasks/docs.
export default function HeroRow({ active, budget, onEdit, docCount, receiptCount, permitCount, openCount, urgentLabel }) {
  const st = statusStyle(active.status);
  const percent = active.percent ?? 0;
  const left = daysUntil(active.targetDate);
  const mobile = useIsMobile();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1.55fr 1fr', gap: 18, marginBottom: 18 }}>
      {/* Hero */}
      <Card pad="22px" style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 16 : 22 }}>
        <ImageSlot id="hero-site" projectId={active.id} placeholder="Drop a site photo" radius={12} style={{ width: mobile ? '100%' : 210, height: mobile ? 170 : 188, flex: 'none' }} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: st.bg, color: st.color, fontSize: 11, fontWeight: 600, padding: '4px 9px', borderRadius: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} />{active.status || 'Planning'}
            </span>
            <span style={{ fontFamily: font.mono, fontSize: 11, color: color.faint }}>{active.phaseLabel || ''}</span>
            <button
              onClick={onEdit}
              title="Edit project details"
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: color.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              Edit
            </button>
          </div>
          <h2 style={{ margin: '0 0 3px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{active.name || 'Project'}</h2>
          <div style={{ fontSize: 13, color: color.muted, marginBottom: 18 }}>{active.address || ''}</div>

          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: '0.06em', color: color.faint }}>OVERALL COMPLETION</span>
              <span style={{ fontFamily: font.mono, fontSize: 15, fontWeight: 600, color: color.accent }}>{percent}%</span>
            </div>
            <div style={{ height: 9, background: color.track, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: percent + '%', height: '100%', background: 'linear-gradient(90deg,#BB5A33,#C97A4E)', borderRadius: 6 }} />
            </div>
            <div style={{ display: 'flex', gap: 26, marginTop: 18 }}>
              <Stat label="STARTED" value={formatDate(active.startDate)} />
              <Stat label="TARGET" value={formatDate(active.targetDate)} />
              <Stat label="DAYS LEFT" value={left == null ? '—' : String(left)} />
            </div>
          </div>
        </div>
      </Card>

      {/* KPI stack */}
      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 18 }}>
        <Card pad="18px 20px" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: font.mono, fontSize: 10.5, letterSpacing: '0.06em', color: color.faint }}>BUDGET SPENT</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: color.greenInk }}>{budget.percentUsed}% used</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '8px 0 9px' }}>
            <span style={{ fontFamily: font.mono, fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>{formatK(budget.spent)}</span>
            <span style={{ fontSize: 13, color: color.faint }}>/ {formatK(budget.total)}</span>
          </div>
          <div style={{ height: 7, background: color.track, borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: budget.percentUsed + '%', height: '100%', background: color.green, borderRadius: 5 }} />
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Card pad="18px 18px" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontFamily: font.mono, fontSize: 10.5, letterSpacing: '0.04em', color: color.faint }}>DOCUMENTS</span>
            <div style={{ fontFamily: font.mono, fontSize: 26, fontWeight: 600, margin: '7px 0 2px' }}>{docCount}</div>
            <span style={{ fontSize: 11.5, color: color.muted }}>{receiptCount} receipts · {permitCount} permits</span>
          </Card>
          <Card pad="18px 18px" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontFamily: font.mono, fontSize: 10.5, letterSpacing: '0.04em', color: color.faint }}>OPEN TASKS</span>
            <div style={{ fontFamily: font.mono, fontSize: 26, fontWeight: 600, margin: '7px 0 2px' }}>{openCount}</div>
            <span style={{ fontSize: 11.5, color: color.red, fontWeight: 500 }}>{urgentLabel}</span>
          </Card>
        </div>
      </div>
    </div>
  );
}
