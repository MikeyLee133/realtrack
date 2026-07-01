import { color, font } from '../lib/tokens.js';

// Shared loading + error states for the async backend. Used by the picker
// (initial projects load) and the dashboard (active project's records) so a
// slow or failed load never shows a misleading empty screen.

export function Spinner({ size = 22, stroke = 2.5, tone = color.accent }) {
  return (
    <svg className="rt-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color.hairline} strokeWidth={stroke} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={tone} strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
}

export function LoadingState({ label = 'Loading…', pad = '60px 24px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: pad }}>
      <Spinner />
      <div style={{ fontFamily: font.mono, fontSize: 11, color: color.faint, letterSpacing: '0.05em' }}>{label.toUpperCase()}</div>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry, pad = '48px 24px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: pad }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: '#F4E2DD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color.red} strokeWidth="2"><path d="M12 8v5" /><path d="M12 16h.01" /><circle cx="12" cy="12" r="9" /></svg>
      </div>
      <div style={{ maxWidth: 380 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 3 }}>Couldn’t load</div>
        <div style={{ fontSize: 13, color: color.muted }}>{message}</div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rt-btn-primary"
          style={{ marginTop: 4, height: 38, padding: '0 18px', background: color.accent, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
