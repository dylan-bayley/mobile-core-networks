import { K, PANEL, EDGE, MONO } from '../theme.js';

export default function Legend() {
  return (
    <div className="mt-3 flex flex-wrap gap-3 rounded px-3 py-2" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      {Object.keys(K).map((k) => (
        <span key={k} className="flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 10, color: '#8ea1bf' }}>
          <span style={{ width: 10, height: 3, background: K[k].c, display: 'inline-block', borderRadius: 2 }} />
          {K[k].n}
        </span>
      ))}
    </div>
  );
}
