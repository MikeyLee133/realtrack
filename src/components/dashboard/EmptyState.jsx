import { color, font } from '../../lib/tokens.js';

// Shown inside a card when the active project has no records of this kind yet
// (every user-created project starts empty — see the repository's seeding).
export default function EmptyState({ label }) {
  return (
    <div style={{ padding: '22px 10px', textAlign: 'center', fontFamily: font.mono, fontSize: 11, color: color.fainter, letterSpacing: '0.03em' }}>
      {label}
    </div>
  );
}
