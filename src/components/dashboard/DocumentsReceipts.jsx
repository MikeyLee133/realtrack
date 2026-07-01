import { useState, useRef } from 'react';
import { color, font } from '../../lib/tokens.js';
import * as fileStore from '../../lib/fileStore.js';
import Card from './Card.jsx';
import EmptyState from './EmptyState.jsx';

// Open a document's stored file: resolve its URL (object URL locally, signed
// URL on Supabase) on demand and open it in a new tab.
async function openFile(filePath) {
  try {
    const url = await fileStore.getUrl(filePath);
    if (url) window.open(url, '_blank', 'noopener');
  } catch {
    /* ignore */
  }
}

const DOC_STYLE = {
  Receipt: { iconBg: '#F4E2DD', iconStroke: '#B5503C' },
  Invoice: { iconBg: '#F4E2DD', iconStroke: '#B5503C' },
  Permit: { iconBg: '#E6EFE7', iconStroke: '#3E6B49' },
  Plan: { iconBg: '#E7EAF0', iconStroke: '#4A5A6B' },
  Contract: { iconBg: '#EFE7DD', iconStroke: '#8A5A2B' },
};
const DOC_TYPES = ['Receipt', 'Invoice', 'Permit', 'Plan', 'Contract'];

function docView(d) {
  const st = DOC_STYLE[d.type] || { iconBg: '#F0EEE9', iconStroke: '#75716A' };
  return {
    ...d,
    typeDate: (d.type || '').toUpperCase() + ' · ' + (d.date || ''),
    iconBg: st.iconBg,
    iconStroke: st.iconStroke,
    iconLabel: (d.type || '?').slice(0, 1),
    hasAmount: !!d.amount,
    amountText: d.amount ? '$' + d.amount : '',
    hasBadge: !d.amount && !!d.badge,
    hasFile: !!d.filePath,
  };
}

export default function DocumentsReceipts({ docs, addDoc, removeDoc, open, setOpen, query = '' }) {
  const [draft, setDraft] = useState({ title: '', type: 'Receipt', amount: '' });
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const close = () => {
    setOpen(false);
    setDraft({ title: '', type: 'Receipt', amount: '' });
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const submit = () => {
    addDoc({ ...draft, file });
    close();
  };

  // Filter by the topbar search query (title or type, case-insensitive).
  const q = query.trim().toLowerCase();
  const visible = q
    ? docs.filter((d) => d.title.toLowerCase().includes(q) || (d.type || '').toLowerCase().includes(q))
    : docs;

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Documents &amp; Receipts</h3>
        <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: color.accent, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>+ Add</button>
      </div>

      {open && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, padding: 12, background: '#FAF8F5', border: '1px solid #ECE8E1', borderRadius: 11, flexWrap: 'wrap' }}>
          <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Document name" autoFocus style={{ flex: 1, minWidth: 150, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' }} />
          <select value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))} style={{ height: 34, padding: '0 9px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff', color: color.ink }}>
            {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Amount (optional)" style={{ width: 130, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' }} />
          <label title="Attach a file (optional)" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: 170, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 12.5, background: '#fff', color: file ? color.ink : color.faint, cursor: 'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-8.49 8.49a5 5 0 0 1-7.07-7.07l8.49-8.49a3 3 0 0 1 4.24 4.24l-8.49 8.49a1 1 0 0 1-1.41-1.41l7.78-7.78" /></svg>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file ? file.name : 'Attach file'}</span>
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <button onClick={submit} style={{ height: 34, padding: '0 15px', background: color.accent, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>
          <button onClick={close} style={{ height: 34, width: 34, background: '#fff', color: color.faint, border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {docs.length === 0 && <EmptyState label="NO DOCUMENTS YET — ADD A RECEIPT, PERMIT OR PLAN" />}
        {docs.length > 0 && visible.length === 0 && <EmptyState label={`NO DOCUMENTS MATCH “${query.trim().toUpperCase()}”`} />}
        {visible.map(docView).map((doc) => (
          <div key={doc.id} className="rt-row-hover" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 8px', borderRadius: 9, cursor: 'pointer' }}>
            <div style={{ width: 34, height: 34, flex: 'none', borderRadius: 8, background: doc.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.mono, fontSize: 11, fontWeight: 600, color: doc.iconStroke }}>{doc.iconLabel}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.title}</div>
              <div style={{ fontFamily: font.mono, fontSize: 10.5, color: color.faint, marginTop: 1 }}>{doc.typeDate}</div>
            </div>
            {doc.hasAmount && <span style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 600 }}>{doc.amountText}</span>}
            {doc.hasBadge && (
              <span style={{ fontFamily: font.mono, fontSize: 11, color: doc.badge.color, background: doc.badge.bg, padding: '3px 8px', borderRadius: 6 }}>{doc.badge.text}</span>
            )}
            {doc.hasFile && (
              <button onClick={(e) => { e.stopPropagation(); openFile(doc.filePath); }} title="Open attached file" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: color.accent, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-8.49 8.49a5 5 0 0 1-7.07-7.07l8.49-8.49a3 3 0 0 1 4.24 4.24l-8.49 8.49a1 1 0 0 1-1.41-1.41l7.78-7.78" /></svg>
                View
              </button>
            )}
            <button className="rt-remove" onClick={(e) => { e.stopPropagation(); removeDoc(doc.id); }} title="Delete document" style={{ width: 20, height: 20, flex: 'none', border: 'none', background: 'none', color: color.fainter, fontSize: 15, cursor: 'pointer', lineHeight: '18px', padding: 0 }}>×</button>
          </div>
        ))}
      </div>
    </Card>
  );
}
