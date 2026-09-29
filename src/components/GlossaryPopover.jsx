import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { K, PANEL, EDGE, MONO, SANS, MUTED } from '../theme.js';
import { resolveGlossaryKey } from '../lib/resolveGlossaryKey.js';
import { componentForTerm } from '../data/components/index.js';

const MARGIN = 8;
const WIDTH = 280;

export default function GlossaryPopover({ target, glossary, onClose, topology, onShowNode }) {
  const cardRef = useRef(null);
  const [pos, setPos] = useState(null);

  const entry = target ? glossary[target.key] : null;
  // If the term is a node on the current diagram, offer to point at it.
  const nodeId =
    entry && topology && onShowNode
      ? Object.keys(topology.nodes).find((id) => resolveGlossaryKey(topology.nodes[id].t, glossary) === target.key)
      : null;

  useLayoutEffect(() => {
    if (!entry || !target.anchorEl) {
      setPos(null);
      return;
    }
    const r = target.anchorEl.getBoundingClientRect();
    const cardHeight = cardRef.current?.offsetHeight ?? 120;
    const width = Math.min(WIDTH, window.innerWidth - MARGIN * 2);
    const left = Math.min(Math.max(r.left, MARGIN), window.innerWidth - width - MARGIN);
    const fitsBelow = r.bottom + MARGIN + cardHeight <= window.innerHeight;
    const top = fitsBelow ? r.bottom + MARGIN : Math.max(MARGIN, r.top - MARGIN - cardHeight);
    setPos({ top, left, width });
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
        width: pos.width,
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
          style={{ color: MUTED, background: 'none', border: 0, fontSize: 14, lineHeight: 1, padding: 2 }}
        >
          ×
        </button>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed" style={{ color: '#e6edfa' }}>
        {entry.expansion}
      </p>
      {entry.note && (
        <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>
          {entry.note}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ fontFamily: MONO }}>
        {componentForTerm(target.key) && (
          <a href={`#/components/${componentForTerm(target.key)}`} onClick={onClose} className="underline" style={{ color: '#dbe4f3' }}>
            read the full page →
          </a>
        )}
        <a href={`#/glossary/${encodeURIComponent(target.key)}`} onClick={onClose} className="underline" style={{ color: MUTED }}>
          glossary
        </a>
      </div>
      {nodeId && (
        <button
          type="button"
          onClick={() => onShowNode(nodeId)}
          className="mt-2 rounded px-2 py-1 text-xs"
          style={{ background: 'transparent', border: `1px solid ${EDGE}`, color: '#dbe4f3', fontFamily: MONO }}
        >
          show on diagram →
        </button>
      )}
    </div>,
    document.body,
  );
}
