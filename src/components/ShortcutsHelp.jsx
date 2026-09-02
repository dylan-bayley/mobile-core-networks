import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PANEL, EDGE, MONO, MUTED, FAINT, TEXT_2 } from '../theme.js';

const SHORTCUTS = [
  ['Space', 'Play / pause (continues after a held step)'],
  ['← / →', 'Previous / next step'],
  ['Home / End', 'First / last step'],
  ['/', 'Search the acronym glossary'],
  ['?', 'Show this help'],
  ['Esc', 'Close a definition, this help, or the intro'],
];

export default function ShortcutsHelp({ open, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      style={{ background: 'rgba(3, 6, 14, 0.7)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded p-4"
        style={{ background: PANEL, border: `1px solid ${EDGE}`, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center">
          <h2 id="shortcuts-title" className="text-sm font-semibold text-white">
            Keyboard shortcuts
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto rounded px-2 py-1"
            style={{ color: MUTED, background: 'none', border: `1px solid ${EDGE}`, fontSize: 12, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {SHORTCUTS.map(([k, d]) => (
            <div key={k} className="contents">
              <dt>
                <kbd className="rounded px-1.5 py-0.5" style={{ fontFamily: MONO, fontSize: 11, color: '#fff', border: `1px solid ${EDGE}`, background: '#0a1120' }}>
                  {k}
                </kbd>
              </dt>
              <dd style={{ color: TEXT_2 }}>{d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs" style={{ color: FAINT }}>
          Every step has its own link — use "copy link" in the step panel to share exactly what you're looking at.
        </p>
      </div>
    </div>,
    document.body,
  );
}
