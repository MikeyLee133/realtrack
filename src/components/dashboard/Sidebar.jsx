import { color, font } from '../../lib/tokens.js';
import { usingSupabase } from '../../lib/backend.js';
import { signOut } from '../../lib/auth.js';
import { useIsMobile } from '../../lib/useIsMobile.js';

export default function Sidebar({ active, onBack, sections = [], activeSection, onNavigate }) {
  const initial = (active.short || 'P').slice(0, 1);
  const mobile = useIsMobile();

  // On mobile the sidebar becomes a compact sticky top bar; the decorative nav
  // list and the user footer are dropped to save vertical space.
  if (mobile) {
    return (
      <aside style={{ background: '#211F1B', color: '#EDEAE3', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button className="rt-back" onClick={onBack} title="All projects" style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#8C877D', cursor: 'pointer', padding: 4, fontFamily: 'inherit' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>{initial}</div>
        <div style={{ lineHeight: 1.1, flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.short || 'Project'}</div>
          <div style={{ fontFamily: font.mono, fontSize: 9.5, color: '#928D82', letterSpacing: '0.04em' }}>{active.code || ''}</div>
        </div>
        {usingSupabase && (
          <button onClick={() => signOut()} className="rt-back" style={{ background: 'none', border: 'none', color: '#8C877D', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 4, fontFamily: 'inherit' }}>Sign out</button>
        )}
      </aside>
    );
  }

  return (
    <aside style={{ width: 248, flex: 'none', background: '#211F1B', color: '#EDEAE3', padding: '26px 18px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
      <button
        className="rt-back"
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: '#8C877D', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: '0 8px 12px', fontFamily: 'inherit' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
        All projects
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 8px 4px' }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff' }}>{initial}</div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: '-0.01em' }}>{active.short || 'Project'}</div>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: '#928D82', letterSpacing: '0.04em' }}>{active.code || ''}</div>
        </div>
      </div>

      <nav style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontFamily: font.mono, fontSize: 9.5, letterSpacing: '0.12em', color: '#6F6A60', padding: '0 12px 8px' }}>PROJECT</div>
        {sections.map((s) => {
          const activeItem = s.id === activeSection;
          return (
            <button
              key={s.id}
              onClick={() => onNavigate?.(s.id)}
              className={activeItem ? undefined : 'rt-nav-item'}
              style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 9, width: '100%', textAlign: 'left', border: 'none', fontFamily: 'inherit',
                background: activeItem ? '#332F29' : 'transparent',
                color: activeItem ? '#fff' : '#B5AFA4',
                fontSize: 13.5, fontWeight: activeItem ? 600 : 400, cursor: 'pointer',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: activeItem ? color.accent : '#4F4A42' }} />
              {s.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '14px 12px 4px', borderTop: '1px solid #34302A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3A3631', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B5AFA4' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
          </div>
          <div style={{ lineHeight: 1.2, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Project Owner</div>
            <div style={{ fontSize: 10.5, color: '#8C877D' }}>{usingSupabase ? 'Signed in' : 'Local workspace'}</div>
          </div>
          {usingSupabase && (
            <button onClick={() => signOut()} title="Sign out" className="rt-back" style={{ background: 'none', border: 'none', color: '#8C877D', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              Sign out
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
