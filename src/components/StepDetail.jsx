import { K, PANEL, EDGE, MONO } from '../theme.js';

export default function StepDetail({ cur, step, stepsLength, topology, accent }) {
  return (
    <div className="lg:col-span-3 rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: MONO, fontSize: 11, color: accent }}>
          {String(step + 1).padStart(2, '0')} / {String(stepsLength).padStart(2, '0')}
        </span>
        <span className="rounded px-2 py-0.5" style={{ fontFamily: MONO, fontSize: 10, color: accent, border: `1px solid ${accent}55` }}>
          {K[cur.k].n}
        </span>
        {cur.tag && (
          <span className="rounded px-2 py-0.5" style={{ fontFamily: MONO, fontSize: 10, color: '#8ea1bf', border: `1px solid ${EDGE}` }}>
            {cur.tag}
          </span>
        )}
      </div>
      <h2 className="mt-2 text-lg font-semibold text-white">{cur.t}</h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: '#a8b8d4' }}>
        {cur.d}
      </p>
      <p className="mt-3" style={{ fontFamily: MONO, fontSize: 11, color: '#63799c' }}>
        {cur.p.map((n) => topology.nodes[n].t).join(cur.rt ? '  ⇄  ' : '  →  ')}
      </p>
    </div>
  );
}
