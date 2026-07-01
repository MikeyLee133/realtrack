import { color } from '../../lib/tokens.js';

// White card with hairline border + 16px radius (HANDOFF §7).
export default function Card({ children, style, pad = '22px 24px' }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${color.hairline}`, borderRadius: 16, padding: pad, ...style }}>
      {children}
    </div>
  );
}
