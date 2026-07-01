import { useState, useRef } from 'react';
import { color, font } from '../lib/tokens.js';
import { statusColor } from '../lib/useStore.js';
import { exportAll, importAll, isValidBackup } from '../lib/backup.js';
import { useIsMobile } from '../lib/useIsMobile.js';
import { LoadingState, ErrorState } from './StatusStates.jsx';

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const ghostBtn = {
  height: 40,
  padding: '0 13px',
  background: '#fff',
  color: color.muted,
  border: `1px solid ${color.hairline}`,
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  fontFamily: 'inherit',
};

export default function ProjectPicker({ store }) {
  const { projects, createProject, openProject, removeProject, loading, error, reloadProjects } = store;
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', address: '' });
  const [busy, setBusy] = useState(false);
  const importRef = useRef(null);
  const mobile = useIsMobile();

  const closeForm = () => {
    setFormOpen(false);
    setDraft({ name: '', address: '' });
  };
  const submit = () => {
    createProject(draft);
    setDraft({ name: '', address: '' });
    setFormOpen(false);
  };

  // Download a JSON backup of all projects + records.
  const onExport = async () => {
    try {
      const data = await exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `realtrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not export your data.');
    }
  };

  // Restore from a backup file (merges by project id; existing same-id projects
  // are overwritten). Attached files are not part of the JSON backup.
  const onImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      alert('Could not read that file — it isn’t valid JSON.');
      return;
    }
    if (!isValidBackup(data)) {
      alert('That file is not a valid RealTrack backup.');
      return;
    }
    const n = data.projects.length;
    if (!window.confirm(`Import ${n} project${n === 1 ? '' : 's'} from this backup? Projects with the same id will be overwritten.`)) return;
    try {
      setBusy(true);
      await importAll(data);
      reloadProjects();
    } catch (err) {
      alert(err?.message || 'Import failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', color: color.ink, padding: mobile ? '32px 18px' : '64px 32px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 38 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#fff' }}>R</div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>RealTrack</div>
            <div style={{ fontFamily: font.mono, fontSize: 10.5, color: color.faint, letterSpacing: '0.04em' }}>PROJECT WORKSPACE</div>
          </div>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'stretch' : 'flex-end', justifyContent: 'space-between', gap: mobile ? 14 : 0, marginBottom: 22 }}>
          <div>
            <h1 style={{ margin: '0 0 5px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>Your projects</h1>
            <div style={{ fontSize: 14, color: color.muted }}>
              {loading
                ? 'Loading your projects…'
                : error
                  ? 'Couldn’t load your projects'
                  : projects.length === 0
                    ? 'No projects yet — create one to get started'
                    : `${projects.length} ${projects.length === 1 ? 'project' : 'active'} · pick one to open its dashboard`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {projects.length > 0 && (
              <button onClick={onExport} title="Download a JSON backup of all your projects" style={ghostBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M8 11l4 4 4-4" /><path d="M4 21h16" /></svg>
                Export
              </button>
            )}
            <button onClick={() => importRef.current?.click()} disabled={busy} title="Restore projects from a backup file" style={{ ...ghostBtn, opacity: busy ? 0.6 : 1 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21V9M8 13l4-4 4 4" /><path d="M4 3h16" /></svg>
              {busy ? 'Importing…' : 'Import'}
            </button>
            <input ref={importRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={onImportFile} />
            <button
              className="rt-btn-primary"
              onClick={() => setFormOpen(true)}
              style={{ height: 40, padding: '0 18px', background: color.accent, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <PlusIcon />New project
            </button>
          </div>
        </div>

        {/* New project form */}
        {formOpen && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, padding: 14, background: '#fff', border: `1px solid ${color.hairline}`, borderRadius: 13, flexWrap: 'wrap' }}>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Project name"
              autoFocus
              style={{ flex: 1, minWidth: 200, height: 38, padding: '0 12px', border: '1px solid #E1DDD5', borderRadius: 9, fontSize: 13.5, background: '#fff' }}
            />
            <input
              value={draft.address}
              onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Address (optional)"
              style={{ flex: 1, minWidth: 200, height: 38, padding: '0 12px', border: '1px solid #E1DDD5', borderRadius: 9, fontSize: 13.5, background: '#fff' }}
            />
            <button onClick={submit} style={{ height: 38, padding: '0 18px', background: color.accent, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Create</button>
            <button onClick={closeForm} style={{ height: 38, width: 38, background: '#fff', color: color.faint, border: '1px solid #E1DDD5', borderRadius: 9, fontSize: 17, cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Async load status */}
        {error && (
          <div style={{ background: '#fff', border: `1px solid ${color.hairline}`, borderRadius: 15 }}>
            <ErrorState message={error} onRetry={reloadProjects} />
          </div>
        )}
        {!error && loading && (
          <div style={{ background: '#fff', border: `1px solid ${color.hairline}`, borderRadius: 15 }}>
            <LoadingState label="Loading projects" />
          </div>
        )}

        {/* Empty state — no projects yet */}
        {!loading && !error && projects.length === 0 && !formOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '64px 24px', background: '#fff', border: `1px dashed #DAD6CE`, borderRadius: 15 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: '#F1EEE9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color.faint} strokeWidth="1.8"><path d="M3 9h18M9 21V9" /><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
            </div>
            <h3 style={{ margin: '0 0 5px', fontSize: 17, fontWeight: 700 }}>Start your first project</h3>
            <div style={{ fontSize: 13.5, color: color.muted, maxWidth: 360, marginBottom: 18 }}>
              Create a project, then add its schedule, budget, documents, tasks, vendors, and photos — all your own.
            </div>
            <button
              className="rt-btn-primary"
              onClick={() => setFormOpen(true)}
              style={{ height: 40, padding: '0 18px', background: color.accent, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <PlusIcon />New project
            </button>
          </div>
        )}

        {/* Project grid */}
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          {projects.map((p) => {
            const sc = statusColor(p.status);
            const percentText = p.percent + '%';
            return (
              <div
                key={p.id}
                className="rt-card-hover rt-removable"
                onClick={() => openProject(p.id)}
                style={{ background: '#fff', border: `1px solid ${color.hairline}`, borderRadius: 15, padding: '20px 22px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: sc }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc }} />{p.status}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: font.mono, fontSize: 10, color: color.faint, letterSpacing: '0.04em' }}>{p.code}</span>
                    <button
                      className="rt-remove"
                      onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete “${p.name}” and all its data? This cannot be undone.`)) removeProject(p.id); }}
                      title="Delete project"
                      style={{ display: 'inline-flex', alignItems: 'center', border: 'none', background: 'none', color: color.fainter, cursor: 'pointer', padding: 0 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                    </button>
                  </span>
                </div>
                <h3 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{p.name}</h3>
                <div style={{ fontSize: 12.5, color: color.muted, marginBottom: 16 }}>{p.address}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: font.mono, fontSize: 10, color: color.faint, letterSpacing: '0.05em' }}>{p.phaseLabel}</span>
                  <span style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 600, color: color.accent }}>{percentText}</span>
                </div>
                <div style={{ height: 7, background: color.track, borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: percentText, height: '100%', background: color.accent, borderRadius: 5 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Prototype note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 26, fontFamily: font.mono, fontSize: 10.5, color: color.fainter, letterSpacing: '0.03em' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color.fainter} strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
          PROTOTYPE — PROJECTS ARE SAVED LOCALLY IN THIS BROWSER. EACH HAS ITS OWN TASKS, DOCUMENTS &amp; PHOTOS; A NEW PROJECT STARTS EMPTY.
        </div>
      </div>
    </div>
  );
}
