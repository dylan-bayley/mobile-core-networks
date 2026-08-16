import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { K, PANEL, EDGE, MONO, SANS } from '../theme.js';

const MARGIN = 8;
const WIDTH = 280;

export default function GlossaryPopover({ target, glossary, onClose }) {
  const cardRef = useRef(null);
  const [pos, setPos] = useState(null);

  const entry = target ? glossary[target.key] : null;

  useLayoutEffect(() => {
    if (!entry || !target.anchorEl) {
      setPos(null);
      return;
    }
    const r = target.anchorEl.getBoundingClientRect();
    const cardHeight = cardRef.current?.offsetHeight ?? 120;
    const left = Math.min(Math.max(r.left, MARGIN), window.innerWidth - WIDTH - MARGIN);
    const fitsBelow = r.bottom + MARGIN + cardHeight <= window.innerHeight;
    const top = fitsBelow ? r.bottom + MARGIN : Math.max(MARGIN, r.top - MARGIN - cardHeight);
    setPos({ top, left });
  }, [target, entry]);

  useLayoutEffect(() => {
    if (!entry) return undefined;

    const handlePointerDown = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target) && e.target !== target.anchorEl) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const handleDismiss = () => onClose();

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    // Opening a trigger can itself cause a scroll (e.g. focus-into-view on
    // the clicked element) — attach the scroll/resize dismissal a frame
    // later so that doesn't immediately close the popover it just opened.
    let raf = requestAnimationFrame(() => {
      window.addEventListener('scroll', handleDismiss, true);
      window.addEventListener('resize', handleDismiss);
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, target, onClose]);

  if (!entry || !pos) return null;

  return createPortal(
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="glossary-popover-term"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: WIDTH,
        zIndex: 1000,
        background: PANEL,
        border: `1px solid ${EDGE}`,
        borderRadius: 8,
        padding: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        fontFamily: SANS,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span id="glossary-popover-term" style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
            {target.key}
          </span>
          {entry.kind && K[entry.kind] && (
            <span
              className="rounded px-1.5 py-0.5"
              style={{ fontFamily: MONO, fontSize: 9, color: K[entry.kind].c, border: `1px solid ${K[entry.kind].c}55` }}
            >
              {K[entry.kind].n}
            </span>
          )}
        </div>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Close definition"
          className="rounded"
          style={{ color: '#63799c', background: 'none', border: 0, fontSize: 14, lineHeight: 1, padding: 2 }}
        >
          ×
        </button>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed" style={{ color: '#e6edfa' }}>
        {entry.expansion}
      </p>
      {entry.note && (
        <p className="mt-1 text-xs leading-relaxed" style={{ color: '#8ea1bf' }}>
          {entry.note}
        </p>
      )}
    </div>,
    document.body,
  );
}
