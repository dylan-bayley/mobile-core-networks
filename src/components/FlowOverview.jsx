import { K, PANEL, EDGE, MONO } from '../theme.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { autolinkAcronyms } from '../lib/autolinkAcronyms.jsx';

/**
 * One-glance orientation before the step detail: what this flow is, how
 * long it is, which protocol families and how many nodes it touches — all
 * derived from the step data, nothing extra to author.
 */
export default function FlowOverview({ scenario, onGlossaryOpen, activeGlossaryKey }) {
  const kinds = [...new Set(scenario.steps.map((s) => s.k))];
  const nodes = new Set(scenario.steps.flatMap((s) => s.p));
  return (
    <div className="rounded px-3 py-2" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: '#4d618a' }}>
          {scenario.network.label.toUpperCase()} · {scenario.label.toUpperCase()}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: '#4d618a' }}>
          {scenario.steps.length} steps · {nodes.size} nodes
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: '#8ea1bf' }}>
        {autolinkAcronyms(scenario.blurb, GLOSSARY, { activeKey: activeGlossaryKey, onOpen: onGlossaryOpen })}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
        {kinds.map((k) => (
          <span key={k} className="flex items-center gap-1" style={{ fontFamily: MONO, fontSize: 9, color: '#63799c' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: K[k].c, display: 'inline-block' }} />
            {K[k].n}
          </span>
        ))}
      </div>
    </div>
  );
}
