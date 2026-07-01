import { useState, useEffect, useMemo } from 'react';
import { color, font } from '../../lib/tokens.js';
import { vendorView, PhoneIcon, MailIcon } from './Vendors.jsx';

// A spacious, searchable contractor directory grouped by trade, opened from the
// Vendors card. Each entry has tap-to-call / tap-to-email links and a remove.

const contactLink = { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 500, color: color.accent, textDecoration: 'none' };

export default function VendorDirectory({ vendors, removeVendor, onClose }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Filter, then group by trade (alphabetical), vendors sorted by name.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? vendors.filter((v) => [v.name, v.trade, v.phone, v.email].some((f) => (f || '').toLowerCase().includes(q)))
      : vendors;
    const byTrade = {};
    for (const v of filtered) {
      const t = (v.trade || '').trim() || 'OTHER';
      (byTrade[t] ||= []).push(v);
    }
    return Object.keys(byTrade)
      .sort()
      .map((trade) => ({ trade, list: byTrade[trade].slice().sort((a, b) => a.name.localeCompare(b.name)) }));
  }, [vendors, query]);

  const total = vendors.length;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(27,26,23,0.34)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50 }}>
      <div role="dialog" aria-label="Contractor Directory" onClick={(e) => e.stopPropagation()} style={{ width: 'min(620px, 100%)', maxHeight: '88vh', display: 'flex', flexDirection: 'column', background: '#fff', border: `1px solid ${color.hairline}`, borderRadius: 16, boxShadow: '0 24px 60px rgba(27,26,23,0.22)' }}>
        {/* Header */}
        <div style={{ padding: '22px 24px 14px', borderBottom: `1px solid ${color.track}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>Contractor Directory</h3>
              <div style={{ fontFamily: font.mono, fontSize: 11, color: color.faint, marginTop: 3 }}>{total} {total === 1 ? 'CONTRACTOR' : 'CONTRACTORS'}</div>
            </div>
            <button onClick={onClose} style={{ height: 32, width: 32, background: '#fff', color: color.faint, border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 17, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 13px', background: '#FAF8F5', border: `1px solid ${color.hairline}`, borderRadius: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color.faint} strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, trade, or contact…" autoFocus style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: color.ink, width: '100%' }} />
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '8px 24px 22px' }}>
          {groups.length === 0 && (
            <div style={{ padding: '32px 10px', textAlign: 'center', fontFamily: font.mono, fontSize: 11, color: color.fainter, letterSpacing: '0.03em' }}>
              {query ? `NO CONTRACTORS MATCH “${query.trim().toUpperCase()}”` : 'NO CONTRACTORS YET'}
            </div>
          )}

          {groups.map(({ trade, list }) => (
            <div key={trade} style={{ marginTop: 16 }}>
              <div style={{ fontFamily: font.mono, fontSize: 10, letterSpacing: '0.08em', color: color.faint, padding: '0 2px 8px' }}>{trade}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {list.map(vendorView).map((v) => (
                  <div key={v.id} className="rt-row-hover" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 8px', borderRadius: 9 }}>
                    <div style={{ width: 36, height: 36, flex: 'none', borderRadius: 10, background: v.avatar, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{v.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{v.name}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: v.statusColor }}>
                          {v.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F7C5A' }} />}
                          {v.status}
                        </span>
                      </div>
                      {(v.phone || v.email) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', marginTop: 6 }}>
                          {v.phone && <a href={`tel:${v.phone.replace(/\s+/g, '')}`} style={contactLink}><PhoneIcon />{v.phone}</a>}
                          {v.email && <a href={`mailto:${v.email}`} style={{ ...contactLink, minWidth: 0 }}><MailIcon /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.email}</span></a>}
                        </div>
                      )}
                    </div>
                    <button className="rt-remove" onClick={() => removeVendor(v.id)} title="Remove vendor" style={{ width: 22, height: 22, flex: 'none', border: 'none', background: 'none', color: color.fainter, fontSize: 16, cursor: 'pointer', lineHeight: '20px' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
