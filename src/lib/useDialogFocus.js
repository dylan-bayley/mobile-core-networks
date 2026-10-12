import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keyboard behaviour for a dialog or popover while `open`:
 *  - Escape calls `onEscape` and marks the event handled (preventDefault),
 *    so page-level handlers that check `defaultPrevented` leave it alone;
 *  - with `trap`, Tab and Shift+Tab cycle inside `ref` (modal dialogs);
 *  - on close, focus goes back to `returnFocus` (or whatever had focus when
 *    it opened), unless the learner has already moved it somewhere else.
 */
export function useDialogFocus(open, ref, { onEscape, trap = false, returnFocus = null } = {}) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;
  const returnRef = useRef(returnFocus);
  returnRef.current = returnFocus;

  useEffect(() => {
    if (!open) return undefined;
    const previous = returnRef.current ?? document.activeElement;
    const container = ref.current;
    const onKey = (e) => {
      if (e.key === 'Escape' && onEscapeRef.current) {
        e.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (!trap || e.key !== 'Tab' || !ref.current) return;
      const items = [...ref.current.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const inside = ref.current.contains(document.activeElement);
      if (!inside || (e.shiftKey && document.activeElement === first)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // The dialog's own elements are gone by now, so focus has fallen to
      // <body>; anywhere else means the learner moved on, so leave it.
      const active = document.activeElement;
      const lost = !active || active === document.body || !!container?.contains(active);
      if (lost && previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
    // Only open/close matter; the latest callbacks are read through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, trap]);
}
