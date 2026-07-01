import { useState } from 'react';
import { color, font } from '../../lib/tokens.js';
import Card from './Card.jsx';
import EmptyState from './EmptyState.jsx';

const AVATARS = ['#3D4A3F', '#5A4A3D', '#4A5A6B', '#6B4A4A', '#4F5A4A', '#5B5560'];

// Avatar initials + color and the status color are derived from the stored
// name/status, so adding a vendor needs only name, trade, and status.
function vendorView(v) {
  const initials = v.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  let hash = 0;
  for (const ch of v.name) hash = (hash + ch.charCodeAt(0)) % AVATARS.length;
  const s = v.status || '';
  const status = /on.?site/i.test(s)
    ? { color: '#3E6B49', dot: true }
    : /complete/i.test(s)
      ? { color: '#9C988F', dot: false }
      : { color: '#B5862E', dot: false }; // a date or "Scheduled"
  return { ...v, initials, avatar: AVATARS[hash], statusColor: status.color, dot: status.dot };
}

export default function Vendors({ vendors, addVendor, removeVendor }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', trade: '', status: '' });

  const close = () => {
    setOpen(false);
    setDraft({ name: '', trade: '', status: '' });
  };
  const submit = () => {
    addVendor(draft);
    close();
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Vendors &amp; Contractors</h3>
        <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: color.accent, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>+ Add</button>
      </div>

      {open && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, padding: 12, background: '#FAF8F5', border: '1px solid #ECE8E1', borderRadius: 11, flexWrap: 'wrap' }}>
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Vendor name" autoFocus style={{ flex: 1, minWidth: 130, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' }} />
          <input value={draft.trade} onChange={(e) => setDraft((d) => ({ ...d, trade: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Trade" style={{ width: 110, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' }} />
          <input value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Status (On site / Jul 8…)" style={{ width: 150, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' }} />
          <button onClick={submit} style={{ height: 34, padding: '0 15px', background: color.accent, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add</button>
          <button onClick={close} style={{ height: 34, width: 34, background: '#fff', color: color.faint, border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {vendors.length === 0 && <EmptyState label="NO VENDORS YET — ADD A CONTRACTOR" />}
        {vendors.map(vendorView).map((v) => (
          <div key={v.id} className="rt-row-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 6px', borderRadius: 8 }}>
            <div style={{ width: 32, height: 32, flex: 'none', borderRadius: 9, background: v.avatar, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{v.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{v.name}</div>
              <div style={{ fontFamily: font.mono, fontSize: 10, color: color.faint }}>{v.trade}</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: v.statusColor }}>
              {v.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F7C5A' }} />}
              {v.status}
            </span>
            <button className="rt-remove" onClick={() => removeVendor(v.id)} title="Remove vendor" style={{ width: 22, height: 22, flex: 'none', border: 'none', background: 'none', color: color.fainter, fontSize: 16, cursor: 'pointer', lineHeight: '20px' }}>×</button>
          </div>
        ))}
      </div>
    </Card>
  );
}
