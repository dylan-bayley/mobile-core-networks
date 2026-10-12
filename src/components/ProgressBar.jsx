import { K } from '../theme.js';

/**
 * One clickable segment per step: a seekable scrubber that doubles as a
 * mini-map of which protocol family each step belongs to. The segments are
 * out of the tab order (tabIndex -1): the step list next to it is the
 * keyboard route to every step, and 30 extra tab stops here would bury the
 * controls. Each segment's hit area is taller than its 8px bar, for touch.
 */
export default function ProgressBar({ steps, step, progress, accent, onGo }) {
  return (
    <div role="group" aria-label="Step progress — click a segment to jump" className="mt-1 flex h-6 w-full gap-px">
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
            tabIndex={-1}
            onClick={() => onGo(i)}
            className="flex h-full min-w-0 flex-1 items-center"
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
          >
            <span
              className="block h-2 w-full overflow-hidden"
              style={{ background: '#111c31', borderRadius: i === 0 ? '3px 0 0 3px' : i === steps.length - 1 ? '0 3px 3px 0' : 0 }}
            >
              <span className="block h-full" style={{ width: `${fill * 100}%`, background: colour, opacity: i < step ? 0.7 : 1 }} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
