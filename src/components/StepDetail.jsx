import { K, PANEL, EDGE, MONO } from '../theme.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { resolveGlossaryKey } from '../lib/resolveGlossaryKey.js';
import { autolinkAcronyms } from '../lib/autolinkAcronyms.jsx';
import GlossaryTermButton from './GlossaryTermButton.jsx';

export default function StepDetail({ cur, step, stepsLength, topology, accent, onGlossaryOpen, activeGlossaryKey }) {
  const linkOpts = { activeKey: activeGlossaryKey, onOpen: onGlossaryOpen };
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
      <h2 className="mt-2 text-lg font-semibold text-white">{autolinkAcronyms(cur.t, GLOSSARY, linkOpts)}</h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: '#a8b8d4' }}>
        {autolinkAcronyms(cur.d, GLOSSARY, linkOpts)}
      </p>
      <p className="mt-3" style={{ fontFamily: MONO, fontSize: 11, color: '#63799c' }}>
        {cur.p.map((n, i) => {
          const label = topology.nodes[n].t;
          const key = resolveGlossaryKey(label, GLOSSARY);
          return (
            <span key={`${n}-${i}`}>
              {i > 0 && (cur.rt ? '  ⇄  ' : '  →  ')}
              {key ? (
                <GlossaryTermButton termKey={key} active={activeGlossaryKey === key} onOpen={onGlossaryOpen}>
                  {label}
                </GlossaryTermButton>
              ) : (
                label
              )}
            </span>
          );
        })}
      </p>
    </div>
  );
}
