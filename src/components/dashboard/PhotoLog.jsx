import { color, font } from '../../lib/tokens.js';
import Card from './Card.jsx';
import ImageSlot from '../ImageSlot.jsx';
import { photoSlots } from '../../data/seed.js';

export default function PhotoLog({ projectId }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Photo Progress Log</h3>
        <span style={{ fontFamily: font.mono, fontSize: 11, color: color.faint }}>DRAG &amp; DROP</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {photoSlots.map((s) => (
          <ImageSlot key={s.id} id={s.id} projectId={projectId} placeholder={s.placeholder} radius={10} style={{ width: '100%', height: 104 }} />
        ))}
      </div>
    </Card>
  );
}
