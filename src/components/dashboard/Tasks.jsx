import { useState } from 'react';
import { color, font } from '../../lib/tokens.js';
import Card from './Card.jsx';
import EmptyState from './EmptyState.jsx';

function taskView(t) {
  const done = !!t.done;
  return {
    ...t,
    done,
    metaLine: done
      ? t.completedLabel || 'COMPLETED'
      : (t.due ? 'DUE ' + t.due : 'NO DUE DATE') + (t.owner ? ' · ' + t.owner : ''),
    metaColor: done ? color.fainter : t.urgent ? color.red : color.faint,
    boxBorder: t.urgent && !done ? '#D49C8C' : '#D6D2CA',
    boxBg: t.urgent && !done ? '#F9EFEB' : 'transparent',
  };
}

export default function Tasks({ tasks, toggleTask, addTask, removeTask }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: '', due: '' });

  const close = () => {
    setOpen(false);
    setDraft({ title: '', due: '' });
  };
  const submit = () => {
    addTask(draft);
    close();
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Tasks &amp; To-dos</h3>
        <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: color.accent, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>+ Add</button>
      </div>

      {open && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, padding: 12, background: '#FAF8F5', border: '1px solid #ECE8E1', borderRadius: 11, flexWrap: 'wrap' }}>
          <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Task title" autoFocus style={{ flex: 1, minWidth: 140, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' }} />
          <input value={draft.due} onChange={(e) => setDraft((d) => ({ ...d, due: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Due (e.g. Jul 9)" style={{ width: 120, height: 34, padding: '0 11px', border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 13, background: '#fff' }} />
          <button onClick={submit} style={{ height: 34, padding: '0 15px', background: color.accent, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add</button>
          <button onClick={close} style={{ height: 34, width: 34, background: '#fff', color: color.faint, border: '1px solid #E1DDD5', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {tasks.length === 0 && <EmptyState label="NO TASKS YET — ADD ONE TO GET STARTED" />}
        {tasks.map(taskView).map((task) => (
          <div
            key={task.id}
            className="rt-row-hover"
            onClick={() => toggleTask(task.id)}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '9px 6px', borderRadius: 8, cursor: 'pointer', opacity: task.done ? 0.55 : 1 }}
          >
            {task.done ? (
              <div style={{ width: 18, height: 18, flex: 'none', marginTop: 1, borderRadius: 6, border: `2px solid ${color.green}`, background: color.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
            ) : (
              <div style={{ width: 18, height: 18, flex: 'none', marginTop: 1, borderRadius: 6, border: `2px solid ${task.boxBorder}`, background: task.boxBg }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? color.faint : color.ink }}>{task.title}</div>
              <div style={{ fontFamily: font.mono, fontSize: 10.5, color: task.metaColor, marginTop: 2 }}>{task.metaLine}</div>
            </div>
            <button className="rt-remove" onClick={(e) => { e.stopPropagation(); removeTask(task.id); }} title="Delete task" style={{ width: 20, height: 20, flex: 'none', marginTop: 1, border: 'none', background: 'none', color: color.fainter, fontSize: 15, cursor: 'pointer', lineHeight: '18px', padding: 0 }}>×</button>
          </div>
        ))}
      </div>
    </Card>
  );
}
