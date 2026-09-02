import { K, PANEL, EDGE, MONO, MUTED, FAINT, ACTIVE_BG, ACTIVE_EDGE } from '../theme.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { autolinkAcronyms } from '../lib/autolinkAcronyms.jsx';

/**
 * One-glance orientation before the step detail: what this flow is, how
 * long it is, which protocol families and how many nodes it touches, and
 * where the same session lives in the other generations — all derived from
 * the step data, nothing extra to author.
 */
export default function FlowOverview({ scenario, networks, flows, networkId, onSwitch, onGlossaryOpen, activeGlossaryKey, tagline }) {
  const kinds = [...new Set(scenario.steps.map((s) => s.k))];
  const nodes = new Set(scenario.steps.flatMap((s) => s.p));
  const tagged = scenario.steps.filter((s) => s.tag);
  const tagNames = [...new Set(tagged.map((s) => s.tag))];
  const elsewhere = networks
    .filter((n) => n.id !== networkId && flows[n.id]?.[scenario.flowId])
    .map((n) => ({ network: n, flow: flows[n.id][scenario.flowId] }));

  return (
    <div className="rounded px-3 py-2" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: FAINT }}>
          {scenario.network.label.toUpperCase()} · {scenario.label.toUpperCase()}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: FAINT }}>
          {scenario.steps.length} steps · {nodes.size} nodes
        </span>
      </div>
      {tagline && (
        <p className="mt-1 text-xs" style={{ color: '#c6d4ea' }}>
          {tagline}
        </p>
      )}
      <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>
        {autolinkAcronyms(scenario.blurb, GLOSSARY, { activeKey: activeGlossaryKey, onOpen: onGlossaryOpen })}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
        {kinds.map((k) => (
          <span key={k} className="flex items-center gap-1" style={{ fontFamily: MONO, fontSize: 9, color: MUTED }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: K[k].c, display: 'inline-block' }} />
            {K[k].n}
          </span>
        ))}
      </div>
      {tagged.length > 0 && (
        <p className="mt-1.5 text-xs" style={{ color: MUTED }}>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em' }}>{tagNames.map((t) => t.toUpperCase()).join(' · ')}</span>
          {' '}— {tagged.length} of these steps are specific to this variant; the rest are shared with the base flow.
        </p>
      )}
      {elsewhere.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: FAINT }}>SAME SESSION IN</span>
          {elsewhere.map(({ network, flow }) => (
            <button
              key={network.id}
              type="button"
              onClick={() => onSwitch(network.id, scenario.flowId)}
              className="rounded px-2 py-0.5 text-xs"
              style={{ background: ACTIVE_BG, border: `1px solid ${EDGE}`, color: '#dbe4f3' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = ACTIVE_EDGE)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = EDGE)}
              title={`${network.label}: ${flow.label} (${flow.steps.length} steps)`}
            >
              {network.label}
              <span style={{ fontFamily: MONO, fontSize: 9, color: MUTED }}> · {flow.steps.length}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
