import { useEffect, useState } from 'react';
import { K, PANEL, EDGE, MONO, MUTED, FAINT, TEXT_2, ACTIVE_BG } from '../theme.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { resolveGlossaryKey } from '../lib/resolveGlossaryKey.js';
import { autolinkAcronyms } from '../lib/autolinkAcronyms.jsx';
import GlossaryTermButton from './GlossaryTermButton.jsx';

function CopyLink({ url }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt('Copy this link', url);
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy a link to this exact step"
      className="ml-auto rounded px-2 py-0.5"
      style={{ fontFamily: MONO, fontSize: 10, color: copied ? '#3fd6a0' : MUTED, border: `1px solid ${EDGE}`, background: 'transparent' }}
    >
      {copied ? 'copied ✓' : 'copy link'}
    </button>
  );
}

/**
 * The reading surface for the current step. `announce` controls whether
 * this instance carries the aria-live region — the step detail is rendered
 * twice (aside on wide screens, under the controls on narrow ones) and only
 * the visible copy should speak.
 */
export default function StepDetail({
  cur,
  step,
  stepsLength,
  topology,
  accent,
  onGlossaryOpen,
  activeGlossaryKey,
  analogs = [],
  onJumpAnalog,
  shareUrl,
  announce = true,
}) {
  const linkOpts = { activeKey: activeGlossaryKey, onOpen: onGlossaryOpen };
  return (
    <div className="rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex flex-wrap items-center gap-2">
        <span style={{ fontFamily: MONO, fontSize: 11, color: accent }}>
          {String(step + 1).padStart(2, '0')} / {String(stepsLength).padStart(2, '0')}
        </span>
        <span className="rounded px-2 py-0.5" style={{ fontFamily: MONO, fontSize: 10, color: accent, border: `1px solid ${accent}55` }}>
          {K[cur.k].n}
        </span>
        {cur.tag && (
          <span
            className="rounded px-2 py-0.5"
            style={{ fontFamily: MONO, fontSize: 10, color: MUTED, border: `1px solid ${EDGE}` }}
            title="This step is specific to this variant"
          >
            {cur.tag}
          </span>
        )}
        {shareUrl && <CopyLink url={shareUrl} />}
      </div>
      <div aria-live={announce ? 'polite' : undefined} aria-atomic={announce ? 'true' : undefined}>
        <h2 className="mt-2 text-lg font-semibold text-white">{autolinkAcronyms(cur.t, GLOSSARY, linkOpts)}</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
          {autolinkAcronyms(cur.d, GLOSSARY, linkOpts)}
        </p>
      </div>
      <p className="mt-3" style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>
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

      {cur.pitfall && (
        <aside
          className="mt-3 rounded px-3 py-2 text-xs leading-relaxed"
          style={{ background: `${accent}12`, borderLeft: `3px solid ${accent}`, color: '#c6d4ea' }}
        >
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: accent }}>IN PRACTICE </span>
          {autolinkAcronyms(cur.pitfall, GLOSSARY, linkOpts)}
        </aside>
      )}

      {analogs.length > 0 && (
        <div className="mt-3 rounded p-2" style={{ border: `1px dashed ${EDGE}` }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: FAINT }}>COMPARE — THE SAME STEP IN ANOTHER GENERATION</div>
          {analogs.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => onJumpAnalog(a)}
              className="mt-1 flex w-full items-start gap-2 rounded px-2 py-1 text-left"
              style={{ background: 'transparent', border: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACTIVE_BG)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              title={`Switch to ${a.network.label} · ${a.flowLabel} at this step`}
            >
              <span className="shrink-0" style={{ fontFamily: MONO, fontSize: 10, color: K[a.step.k].c, paddingTop: 2, minWidth: 28 }}>
                {a.network.short}
              </span>
              <span className="text-xs leading-snug">
                <span style={{ color: '#e6edfa' }}>{a.step.t}</span>
                <span style={{ color: MUTED }}> · {a.step.m}</span>
                <span style={{ color: FAINT }}> · {a.flowLabel}</span>
              </span>
              <span className="ml-auto shrink-0" style={{ color: MUTED }}>→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
