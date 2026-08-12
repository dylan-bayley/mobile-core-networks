import { memo, useEffect, useRef } from 'react';
import { K, PANEL, EDGE, MONO } from '../theme.js';

function StepList({ steps, step, blurb, onGo }) {
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current && listRef.current.querySelector(`[data-step="${step}"]`);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [step]);

  return (
    <div className="lg:col-span-2 rounded" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="px-3 py-2" style={{ borderBottom: `1px solid ${EDGE}`, fontFamily: MONO, fontSize: 11, color: '#63799c' }}>
        {blurb}
      </div>
      <div ref={listRef} className="max-h-64 overflow-y-auto p-1">
        {steps.map((s, i) => {
          const on = i === step;
          return (
            <button
              key={s.id}
              data-step={i}
              onClick={() => onGo(i)}
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
