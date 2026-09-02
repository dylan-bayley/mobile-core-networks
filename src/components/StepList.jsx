import { memo, useEffect, useRef } from 'react';
import { K, PANEL, EDGE, MONO } from '../theme.js';

function StepList({ steps, step, onGo }) {
  const listRef = useRef(null);
  const firstRender = useRef(true);

  // Scroll the *list container* only. `scrollIntoView` would also scroll the
  // document, which yanked the page down to the list on load and on every
  // auto-advance while the learner was watching the diagram above.
  useEffect(() => {
    const list = listRef.current;
    const el = list && list.querySelector(`[data-step="${step}"]`);
    if (!list || !el) return;
    if (firstRender.current) {
      firstRender.current = false;
      if (step === 0) return;
    }
    const top = el.offsetTop - list.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top - 4;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight + 4;
  }, [step]);

  return (
    <div className="flex min-h-0 flex-col rounded" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="px-3 py-1.5" style={{ borderBottom: `1px solid ${EDGE}`, fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: '#4d618a' }}>
        STEPS · click to jump
      </div>
      <div ref={listRef} className="relative min-h-0 overflow-y-auto p-1" style={{ maxHeight: '16rem' }}>
        {steps.map((s, i) => {
          const on = i === step;
          return (
            <button
              key={s.id}
              data-step={i}
              onClick={() => onGo(i)}
              aria-current={on ? 'step' : undefined}
              className="flex w-full items-start gap-2 rounded px-2 py-1.5 text-left"
              style={{ background: on ? '#152441' : 'transparent', opacity: i <= step ? 1 : 0.5 }}
            >
              <span style={{ fontFamily: MONO, fontSize: 10, color: on ? K[s.k].c : '#4d618a', paddingTop: 2 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-xs leading-snug" style={{ color: on ? '#ffffff' : '#8ea1bf' }}>
                {s.t}
                {s.tag && <span style={{ color: '#63799c' }}> · {s.tag}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(StepList);
