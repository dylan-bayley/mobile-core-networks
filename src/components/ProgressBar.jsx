import { K } from '../theme.js';

/**
 * One clickable segment per step: a seekable scrubber that doubles as a
 * mini-map of which protocol family each step belongs to.
 */
export default function ProgressBar({ steps, step, progress, accent, onGo }) {
  return (
    <div role="group" aria-label="Step progress — click a segment to jump" className="mt-3 flex h-2 w-full gap-px">
      {steps.map((s, i) => {
        const fill = i < step ? 1 : i === step ? progress : 0;
        const colour = i === step ? accent : K[s.k].c;
        return (
          <button
            key={s.id}
            type="button"
            title={`${String(i + 1).padStart(2, '0')} · ${s.t}`}
            aria-label={`Go to step ${i + 1}: ${s.t}`}
            aria-current={i === step ? 'step' : undefined}
            onClick={() => onGo(i)}
            className="min-w-0 flex-1 overflow-hidden"
            style={{
              background: '#111c31',
              border: 0,
              padding: 0,
              cursor: 'pointer',
              borderRadius: i === 0 ? '3px 0 0 3px' : i === steps.length - 1 ? '0 3px 3px 0' : 0,
            }}
          >
            <div style={{ width: `${fill * 100}%`, height: '100%', background: colour, opacity: i < step ? 0.7 : 1 }} />
          </button>
        );
      })}
    </div>
  );
}
