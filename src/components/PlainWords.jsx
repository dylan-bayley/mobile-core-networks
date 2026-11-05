import { PANEL, EDGE, MONO, TEXT, TEXT_2, MUTED, FAINT } from '../theme.js';

/**
 * Collapsible "In plain words" block for the Learn and Flows pages. Closed by
 * default so readers who already know the material can skip it. Same fields as
 * the always-open block on a component page: job, analogy, without, limit?.
 */
export default function PlainWords({ plain, className = '' }) {
  if (!plain) return null;
  return (
    <details className={`rounded ${className}`} style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <summary className="cursor-pointer px-3 py-2 text-xs" style={{ fontFamily: MONO, letterSpacing: '0.08em', color: MUTED }}>
        IN PLAIN WORDS
      </summary>
      <div className="px-3 pb-3">
        <p className="max-w-[60ch] text-base font-medium leading-snug" style={{ color: TEXT }}>
          {plain.job}
        </p>
        <dl className="mt-2.5 max-w-[70ch] space-y-2 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
          <div>
            <dt className="text-xs" style={{ color: MUTED }}>Think of it as</dt>
            <dd>{plain.analogy}</dd>
          </div>
          <div>
            <dt className="text-xs" style={{ color: MUTED }}>Without it</dt>
            <dd>{plain.without}</dd>
          </div>
          {plain.limit && (
            <div>
              <dt className="text-xs" style={{ color: MUTED }}>Where the analogy stops</dt>
              <dd>{plain.limit}</dd>
            </div>
          )}
        </dl>
        <p className="mt-2.5 text-xs" style={{ color: FAINT }}>
          The hotel picture is an analogy to help you learn, not part of the specification.
        </p>
      </div>
    </details>
  );
}
