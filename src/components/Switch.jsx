import { useId } from 'react';
import { ACTIVE_EDGE, EDGE, MONO, MUTED, PANEL, TEXT, TRACK } from '../theme.js';

/**
 * A labelled on/off control that reads as a switch, not a mystery glyph.
 * `hint` is a visible one-line explanation (hover tooltips don't exist on
 * touch screens); `title` stays available for the odd extra.
 */
export default function Switch({ on, onChange, children, title, hint, size = 'md' }) {
  const hintId = useId();
  const pad = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs';
  const button = (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-describedby={hint ? hintId : undefined}
      title={title}
      onClick={onChange}
      className={`inline-flex min-h-10 items-center gap-2 rounded sm:min-h-0 ${pad}`}
      style={{ background: PANEL, border: `1px solid ${on ? ACTIVE_EDGE : EDGE}`, color: on ? TEXT : MUTED, fontFamily: MONO }}
    >
      <span
        aria-hidden="true"
        className="relative inline-block h-3.5 w-6 rounded-full transition-colors"
        style={{ background: on ? ACTIVE_EDGE : TRACK }}
      >
        <span
          className="absolute top-0.5 h-2.5 w-2.5 rounded-full transition-all"
          style={{ left: on ? 12 : 2, background: on ? '#ffffff' : MUTED }}
        />
      </span>
      {children}
    </button>
  );
  if (!hint) return button;
  return (
    <span className="flex flex-col items-start gap-1">
      {button}
      <span id={hintId} className="text-xs leading-snug" style={{ color: MUTED }}>
        {hint}
      </span>
    </span>
  );
}
