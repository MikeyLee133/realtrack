import { useState } from 'react';
import { color, font } from '../../lib/tokens.js';
import Card from './Card.jsx';
import EmptyState from './EmptyState.jsx';
import VendorDirectory from './VendorDirectory.jsx';

export const AVATARS = ['#3D4A3F', '#5A4A3D', '#4A5A6B', '#6B4A4A', '#4F5A4A', '#5B5560'];

// Avatar initials + color and the status color are derived from the stored
// fields; contact info (phone/email) is optional and shown as tap-to-call /
// tap-to-email links — handy on-site from a phone.
export function vendorView(v) {
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

const contactLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11.5,
  fontWeight: 500,
  color: color.accent,
  textDecoration: 'none',
  maxWidth: '100%',
};
const input = { height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' };

export function PhoneIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></svg>;
}
export function MailIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
}

export default function Vendors({ vendors, addVendor, removeVendor }) {
  const [open, setOpen] = useState(false);
  const [dirOpen, setDirOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', trade: '', status: '', phone: '', email: '' });

  const close = () => {
    setOpen(false);
    setDraft({ name: '', trade: '', status: '', phone: '', email: '' });
  };
  const submit = () => {
    addVendor(draft);
    close();
  };
  const field = (key) => ({
    value: draft[key],
    onChange: (e) => setDraft((d) => ({ ...d, [key]: e.target.value })),
    onKeyDown: (e) => e.key === 'Enter' && submit(),
  });

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Vendors &amp; Contractors</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {vendors.length > 0 && (
            <button onClick={() => setDirOpen(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: color.accent, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Directory →</button>
          )}
          <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: color.accent, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>+ Add</button>
        </div>
      </div>

      {dirOpen && <VendorDirectory vendors={vendors} removeVendor={removeVendor} onClose={() => setDirOpen(false)} />}

      {open && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, padding: 12, background: '#FAF8F5', border: '1px solid #ECE8E1', borderRadius: 11, flexWrap: 'wrap' }}>
          <input {...field('name')} placeholder="Vendor name" autoFocus style={{ ...input, flex: 1, minWidth: 130 }} />
          <input {...field('trade')} placeholder="Trade" style={{ ...input, width: 110 }} />
          <input {...field('status')} placeholder="Status (On site / Jul 8…)" style={{ ...input, width: 150 }} />
          <input {...field('phone')} type="tel" placeholder="Phone (optional)" style={{ ...input, width: 150 }} />
          <input {...field('email')} type="email" placeholder="Email (optional)" style={{ ...input, flex: 1, minWidth: 150 }} />
          <button onClick={submit} style={{ height: 34, padding: '0 15px', background: color.accent, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add</button>
          <button onClick={close} style={{ height: 34, width: 34, background: '#fff', color: color.faint, border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {vendors.length === 0 && <EmptyState label="NO VENDORS YET — ADD A CONTRACTOR" />}
        {vendors.map(vendorView).map((v) => (
          <div key={v.id} className="rt-row-hover" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 6px', borderRadius: 8 }}>
            <div style={{ width: 32, height: 32, flex: 'none', borderRadius: 9, background: v.avatar, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, marginTop: 1 }}>{v.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{v.name}</div>
              <div style={{ fontFamily: font.mono, fontSize: 10, color: color.faint }}>{v.trade}</div>
              {(v.phone || v.email) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', marginTop: 5 }}>
                  {v.phone && (
                    <a href={`tel:${v.phone.replace(/\s+/g, '')}`} title="Call" style={contactLink}>
                      <PhoneIcon />{v.phone}
                    </a>
                  )}
                  {v.email && (
                    <a href={`mailto:${v.email}`} title="Email" style={{ ...contactLink, minWidth: 0 }}>
                      <MailIcon /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.email}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: v.statusColor, marginTop: 2, flex: 'none' }}>
              {v.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F7C5A' }} />}
              {v.status}
            </span>
            <button className="rt-remove" onClick={() => removeVendor(v.id)} title="Remove vendor" style={{ width: 22, height: 22, flex: 'none', border: 'none', background: 'none', color: color.fainter, fontSize: 16, cursor: 'pointer', lineHeight: '20px', marginTop: 1 }}>×</button>
          </div>
        ))}
      </div>
    </Card>
  );
}
