import { K, PANEL, EDGE, MONO, MUTED, FAINT } from '../theme.js';

export default function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded px-3 py-2" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: FAINT }}>LINE COLOURS</span>
      {Object.keys(K).map((k) => (
        <span key={k} className="flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 10, color: MUTED }}>
          <span style={{ width: 10, height: 3, background: K[k].c, display: 'inline-block', borderRadius: 2 }} />
          {K[k].n}
        </span>
      ))}
    </div>
  );
}
