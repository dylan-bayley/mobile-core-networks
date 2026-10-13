import { useEffect, useRef, useState } from 'react';
import { PANEL, EDGE, MONO, MUTED, ACTIVE_EDGE, TEXT } from '../../theme.js';
import { useDialogFocus } from '../../lib/useDialogFocus.js';

/** A button that opens a small anchored panel; closes on Escape or an outside press. */
export default function Popover({ label, ariaLabel, children, width = 'w-64', active = false }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const panelRef = useRef(null);
  useDialogFocus(open, panelRef, { onEscape: () => setOpen(false) });
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="min-h-10 rounded px-3 py-2 text-xs sm:min-h-0"
        style={{
          background: PANEL,
          fontFamily: MONO,
          color: open || active ? TEXT : MUTED,
          border: `1px solid ${open || active ? ACTIVE_EDGE : EDGE}`,
        }}
      >
        {label} ▾
      </button>
      {open && (
        <div
          ref={panelRef}
          role="group"
          aria-label={ariaLabel ?? label}
          className={`absolute right-0 z-20 mt-1 flex flex-col gap-3 rounded p-3 ${width}`}
          style={{ background: PANEL, border: `1px solid ${ACTIVE_EDGE}`, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
        >
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}
