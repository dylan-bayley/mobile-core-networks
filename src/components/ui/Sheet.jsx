import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PANEL, EDGE, TEXT, MUTED, ACTIVE_BG, ACTIVE_EDGE } from '../../theme.js';
import { useDialogFocus } from '../../lib/useDialogFocus.js';

/**
 * A modal panel that slides up from the bottom of the screen. Escape and the
 * backdrop close it, Tab stays inside it, and focus returns to the opener
 * (`returnTo`, a ref to its button).
 */
export default function Sheet({ open, onClose, title, returnTo, children }) {
  const ref = useRef(null);
  const titleId = useId();
  // `returnTo` is the opener's ref: touch browsers don't always focus a tapped button, so don't rely on activeElement.
  useDialogFocus(open, ref, { onEscape: onClose, trap: true, returnFocus: returnTo?.current ?? null });

  // Page behind stays put while the sheet is open; focus moves into it.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" style={{ background: 'rgba(3,6,12,0.7)' }} onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[88vh] flex-col rounded-t-lg outline-none"
        style={{ background: PANEL, border: `1px solid ${ACTIVE_EDGE}`, borderBottom: 0, boxShadow: '0 -12px 32px rgba(0,0,0,0.5)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center gap-3 px-4 pt-3 pb-2" style={{ borderBottom: `1px solid ${EDGE}` }}>
          <h2 id={titleId} className="text-base font-semibold" style={{ color: TEXT }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto min-h-10 rounded px-4 py-2 text-sm font-semibold"
            style={{ background: ACTIVE_BG, border: `1px solid ${ACTIVE_EDGE}`, color: TEXT }}
          >
            Done
          </button>
        </div>
        <div className="flex flex-col gap-5 overflow-y-auto px-4 py-4" style={{ color: MUTED }}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
