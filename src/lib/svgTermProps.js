/**
 * Builds the props that make an SVG <text> element a clickable/keyboard-
 * operable glossary trigger. Returns null when the label doesn't resolve
 * to a glossary entry, so the caller can render the element unchanged —
 * unresolved labels must degrade gracefully, not throw or dead-end.
 *
 * Deliberately returns no `style` key: callers merge cursor styling into
 * their own existing inline style object rather than have this clobber it.
 */
export function svgTermProps(resolvedKey, activeKey, onOpen) {
  if (!resolvedKey) return null;

  return {
    tabIndex: 0,
    role: 'button',
    'aria-haspopup': 'dialog',
    'aria-expanded': activeKey === resolvedKey,
    onClick: (e) => onOpen(resolvedKey, e.currentTarget),
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpen(resolvedKey, e.currentTarget);
      }
    },
  };
}
