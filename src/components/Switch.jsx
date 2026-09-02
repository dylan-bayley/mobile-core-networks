import { ACTIVE_EDGE, EDGE, MONO, MUTED, PANEL, TEXT } from '../theme.js';

/** A labelled on/off control that reads as a switch, not a mystery glyph. */
export default function Switch({ on, onChange, children, title, size = 'md' }) {
  const pad = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      title={title}
      onClick={onChange}
      className={`inline-flex min-h-10 items-center gap-2 rounded sm:min-h-0 ${pad}`}
      style={{ background: PANEL, border: `1px solid ${on ? ACTIVE_EDGE : EDGE}`, color: on ? TEXT : MUTED, fontFamily: MONO }}
    >
      <span
        aria-hidden="true"
        className="relative inline-block h-3.5 w-6 rounded-full transition-colors"
        style={{ background: on ? ACTIVE_EDGE : '#26334f' }}
      >
        <span
          className="absolute top-0.5 h-2.5 w-2.5 rounded-full transition-all"
          style={{ left: on ? 12 : 2, background: on ? '#ffffff' : MUTED }}
        />
      </span>
      {children}
    </button>
  );
}
