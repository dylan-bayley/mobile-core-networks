import { PANEL, EDGE, MONO, MUTED, FAINT, TEXT_2, ACTIVE_BG, ACTIVE_EDGE, K } from '../theme.js';
import { isCompleted } from '../lib/progress.js';

/**
 * First-visit orientation. Also reachable later from the header "help"
 * button, so it doubles as the "what is this / where do I start" page.
 */
export default function IntroCard({ path, progress, networkId, networkLabel, currentFlowId, onStart, onClose }) {
  const done = path.filter((f) => isCompleted(progress, networkId, f.id)).length;
  const next = path.find((f) => !isCompleted(progress, networkId, f.id)) ?? path[0];

  return (
    <section
      aria-labelledby="intro-title"
      className="mb-3 rounded p-4"
      style={{ background: PANEL, border: `1px solid ${ACTIVE_EDGE}` }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 id="intro-title" className="text-base font-semibold text-white">
            New here? This is a guided tour of the signalling inside a mobile network.
          </h2>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
            Each message a phone triggers on the network is played one step at a time, with a plain-English note on what it does.
          </p>
          <ol className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3" style={{ color: TEXT_2 }}>
            <li className="flex gap-2">
              <span style={{ fontFamily: MONO, color: K.control.c }}>1</span>
              <span>Pick a <strong style={{ color: '#fff' }}>network</strong> and a <strong style={{ color: '#fff' }}>session</strong>.</span>
            </li>
            <li className="flex gap-2">
              <span style={{ fontFamily: MONO, color: K.control.c }}>2</span>
              <span>Watch the dot travel, or use <kbd style={{ fontFamily: MONO }}>←</kbd> <kbd style={{ fontFamily: MONO }}>→</kbd> to step.</span>
            </li>
            <li className="flex gap-2">
              <span style={{ fontFamily: MONO, color: K.control.c }}>3</span>
              <span>Click an <span className="underline decoration-dotted underline-offset-2">underlined acronym</span> for a definition.</span>
            </li>
          </ol>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close introduction"
          className="rounded px-2 py-1"
          style={{ color: MUTED, background: 'none', border: `1px solid ${EDGE}`, fontSize: 12, lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', color: FAINT }}>SUGGESTED ORDER · {networkLabel.toUpperCase()}</span>
        {path.map((f, i) => {
          const finished = isCompleted(progress, networkId, f.id);
          const current = f.id === currentFlowId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onStart(f.id)}
              title={f.tagline}
              className="rounded px-2 py-1 text-xs"
              style={{
                background: current ? ACTIVE_BG : 'transparent',
                border: `1px solid ${current ? ACTIVE_EDGE : EDGE}`,
                color: finished ? '#3fd6a0' : current ? '#fff' : MUTED,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 12, marginRight: 5, color: FAINT }}>{i + 1}</span>
              {f.label}
              {finished && ' ✓'}
            </button>
          );
        })}
        <span className="text-xs" style={{ color: FAINT }}>
          {done} of {path.length} done on {networkLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onStart(next.id)}
          className="rounded px-4 py-2 text-sm font-semibold"
          style={{ background: K.control.c, color: '#06101f', border: 0 }}
        >
          {done === 0 ? `Start with ${next.label}` : `Continue: ${next.label}`} ▸
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-3 py-2 text-sm"
          style={{ background: 'transparent', border: `1px solid ${EDGE}`, color: MUTED }}
        >
          I know my way around
        </button>
      </div>
    </section>
  );
}
