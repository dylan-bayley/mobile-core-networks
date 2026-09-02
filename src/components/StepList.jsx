import { memo, useEffect, useRef, useState } from 'react';
import { K, PANEL, EDGE, MONO, MUTED, FAINT, ACTIVE_BG } from '../theme.js';

const COMPACT_ROWS = 6;
const ROW_PX = 30;

function StepList({ steps, step, onGo }) {
  const listRef = useRef(null);
  const firstRender = useRef(true);
  const [expanded, setExpanded] = useState(false);

  // Scroll the *list container* only. `scrollIntoView` would also scroll the
  // document, which yanked the page down to the list on load and on every
  // auto-advance while the learner was watching the diagram above. When the
  // current row is out of view it is re-centred so neighbours stay visible.
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
    if (top < list.scrollTop || bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = Math.max(0, top - (list.clientHeight - el.offsetHeight) / 2);
    }
  }, [step, expanded]);

  const remaining = steps.length - 1 - step;
  const canExpand = steps.length > COMPACT_ROWS;

  return (
    <div className="flex min-h-0 flex-col rounded" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex items-center px-3 py-1.5" style={{ borderBottom: `1px solid ${EDGE}`, fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: FAINT }}>
        <span>STEPS · CLICK TO JUMP</span>
        <span className="ml-auto" style={{ letterSpacing: 0 }}>
          {remaining === 0 ? 'last step' : `${remaining} to go`}
        </span>
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="ml-3 rounded px-1.5 py-0.5"
            style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 0, color: MUTED, border: `1px solid ${EDGE}`, background: 'transparent' }}
          >
            {expanded ? 'compact' : `show all ${steps.length}`}
          </button>
        )}
      </div>
      <div ref={listRef} className="relative min-h-0 overflow-y-auto p-1" style={{ maxHeight: expanded ? '26rem' : COMPACT_ROWS * ROW_PX + 8 }}>
        {steps.map((s, i) => {
          const on = i === step;
          return (
            <button
              key={s.id}
              data-step={i}
              onClick={() => onGo(i)}
              aria-current={on ? 'step' : undefined}
              className="flex w-full items-start gap-2 rounded px-2 py-1.5 text-left"
              style={{ background: on ? ACTIVE_BG : 'transparent', opacity: i <= step ? 1 : 0.6 }}
            >
              <span style={{ fontFamily: MONO, fontSize: 10, color: on ? K[s.k].c : FAINT, paddingTop: 2, minWidth: 16 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-xs leading-snug" style={{ color: on ? '#ffffff' : MUTED }}>
                {s.t}
                {s.tag && (
                  <span
                    className="ml-1.5 rounded px-1 align-middle"
                    style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.08em', color: K[s.k].c, border: `1px solid ${K[s.k].c}55` }}
                    title={`Specific to this variant (${s.tag})`}
                  >
                    {s.tag.toUpperCase()}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(StepList);
