/**
 * True when a page-level shortcut (Space, arrows, Home/End) should leave a
 * key event alone: it was already handled, a modifier is held (Alt/Cmd+← is
 * the browser's Back), the learner is typing, focus is inside a dialog or
 * popover, or a modal dialog is open.
 */
export function ignoreShortcut(e) {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return true;
  if (typeof document !== 'undefined' && document.querySelector('[aria-modal="true"]')) return true;
  const t = e.target;
  if (!(t instanceof HTMLElement)) return false;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable) return true;
  return !!t.closest('[role="dialog"]');
}

