import { useEffect, useMemo, useRef, useState } from 'react';
import { K, MONO, SANS, PANEL, EDGE, FAINT, MUTED, TEXT, TEXT_2, NODE_FILL, NODE_FILL_ON } from '../../theme.js';
import { GLOSSARY } from '../../data/reference/glossary.js';
import { resolveGlossaryKey } from '../../lib/resolveGlossaryKey.js';
import { svgTermProps } from '../../lib/svgTermProps.js';
import { ladderLayout, rowKind, ROW_H, HEAD } from '../../engine/ladder.js';
import Arrow from '../Arrow.jsx';

const ROW_MS = 700; // how long one new message takes to draw across
const STAGGER_MS = 520; // gap between the starts of consecutive new messages

const termKey = (a) => (a.g && GLOSSARY[a.g] ? a.g : resolveGlossaryKey(a.t, GLOSSARY));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** Plain-language summary of one message, for screen readers. */
const describe = (row, byId) => (row.note ? `Note: ${row.note}` : `${row.m}, from ${byId[row.f].t} to ${byId[row.t].t}${row.both ? ' and back' : ''}`);

/**
 * Renders one scene of a ladder lesson: lifelines for each actor, the
 * scene's messages drawn top-down, and its new messages drawing themselves
 * in one after another. Under reduced motion everything snaps to its end
 * state. `current` must keep its identity between renders (it comes from
 * the lesson's pre-resolved scenes); a new object restarts the animation.
 */
export default function LadderDiagram({ ladder, current, width, maxHeight, reducedMotion, onOpenTerm, activeKey, label }) {
  const layout = useMemo(() => ladderLayout(ladder, width), [ladder, width]);
  const byId = useMemo(() => Object.fromEntries(ladder.actors.map((a) => [a.id, a])), [ladder]);
  const proto = ladder.proto ?? 'ims';

  // --- draw the scene's new rows in, one after another --------------------
  // The start time is taken during render when the scene changes, as in
  // ArchDiagram, so the first frame of a new scene is already its start.
  const order = useMemo(() => new Map(current.fresh.map((id, i) => [id, i])), [current]);
  const anim = useRef({ scene: null, start: 0 });
  if (anim.current.scene !== current) anim.current = { scene: current, start: performance.now() };
  const [, setFrame] = useState(0);
  useEffect(() => {
    if (reducedMotion || !current.fresh.length) return undefined;
    const total = (current.fresh.length - 1) * STAGGER_MS + ROW_MS;
    let raf = 0;
    const tick = (now) => {
      setFrame((f) => f + 1);
      if (now - anim.current.start < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [current, reducedMotion]);
  const elapsed = reducedMotion ? Infinity : performance.now() - anim.current.start;
  const progressOf = (id) => {
    const i = order.get(id);
    if (i == null) return 1;
    return ease(Math.max(0, Math.min(1, (elapsed - i * STAGGER_MS) / ROW_MS)));
  };

  // Keep the newest rows in view as they draw (the register ladder is tall).
  const wrapRef = useRef(null);
  const lastFresh = current.fresh[current.fresh.length - 1] ?? current.focus.values().next().value;
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !lastFresh) return;
    const i = ladder.rows.findIndex((r) => r.id === lastFresh);
    const bottom = HEAD + (i + 1) * ROW_H + 8;
    const top = Math.max(0, i - 2) * ROW_H; // the sticky actor strip covers the first HEAD px
    if (bottom > wrap.scrollTop + wrap.clientHeight) wrap.scrollTo({ top: bottom - wrap.clientHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
    else if (top < wrap.scrollTop) wrap.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [current, lastFresh, ladder, reducedMotion]);

  const visibleRows = layout.rows.filter((r) => current.visible.has(r.id));
  const hasFocus = current.focus.size > 0;

  return (
    <div ref={wrapRef} className="overflow-auto" style={{ maxHeight, touchAction: 'pan-x pan-y' }}>
      {/* The actors are a separate strip that sticks to the top while a tall
          ladder scrolls, so each lifeline stays labelled. */}
      <div role="group" aria-label={`${label}: ladder diagram across ${ladder.actors.map((a) => a.t).join(', ')}`} style={{ width: layout.w }}>
        <svg width={layout.w} height={HEAD} viewBox={`0 0 ${layout.w} ${HEAD}`} style={{ display: 'block', maxWidth: 'none', position: 'sticky', top: 0, zIndex: 1, background: PANEL }}>
          {layout.actors.map((a) => {
            const key = termKey(a);
            const termProps = svgTermProps(key, activeKey, onOpenTerm);
            return (
              <g key={a.id}>
                <line x1={a.x} y1={HEAD - 6} x2={a.x} y2={HEAD} stroke={EDGE} strokeWidth={1.2} strokeDasharray="3 4" />
                <rect x={a.x - a.w / 2} y={4} width={a.w} height={HEAD - 14} rx={6} fill={NODE_FILL} stroke={EDGE}>
                  {key && <title>{`${a.t} — ${GLOSSARY[key].expansion}`}</title>}
                </rect>
                <text
                  x={a.x}
                  y={a.s ? 20 : 27}
                  textAnchor="middle"
                  style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: termProps ? 'help' : 'default' }}
                  fill={TEXT}
                  {...(termProps ?? {})}
                >
                  {a.t}
                </text>
                {a.s && (
                  <text x={a.x} y={32} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 10.5 }} fill={FAINT}>
                    {a.s}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <svg width={layout.w} height={layout.h - HEAD} viewBox={`0 ${HEAD} ${layout.w} ${layout.h - HEAD}`} aria-hidden="true" style={{ display: 'block', maxWidth: 'none' }}>
          {layout.actors.map((a) => (
            <line key={a.id} x1={a.x} y1={HEAD} x2={a.x} y2={layout.h - 4} stroke={EDGE} strokeWidth={1.2} strokeDasharray="3 4" />
          ))}
          {visibleRows.map((r) => {
            const p = progressOf(r.id);
            if (p <= 0) return null;
            const on = current.focus.has(r.id) || (!hasFocus && order.has(r.id));
            if (r.note) {
              return (
                <g key={r.id} opacity={p}>
                  <rect x={r.box.x} y={r.y - 15} width={r.box.w} height={24} rx={5} fill={NODE_FILL_ON} stroke={EDGE} />
                  <text x={r.box.x + r.box.w / 2} y={r.y + 1} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 12, fontStyle: 'italic' }} fill={TEXT_2}>
                    {r.note}
                  </text>
                </g>
              );
            }
            const kind = rowKind(r, proto);
            const colour = K[kind].c;
            const xEnd = r.x1 + (r.x2 - r.x1) * p;
            const mid = (r.x1 + r.x2) / 2;
            const textW = r.m.length * 7.3 + 12;
            const media = r.k === 'media';
            return (
              <g key={r.id}>
                {on && <rect x={Math.min(r.x1, r.x2) - 6} y={r.y - ROW_H + 10} width={Math.abs(r.x2 - r.x1) + 12} height={ROW_H - 4} rx={5} fill={`${colour}1a`} stroke={`${colour}66`} />}
                {r.both && !media ? (
                  <>
                    <Arrow x1={r.x1} x2={xEnd} y={r.y - 3} colour={colour} />
                    {p >= 1 && <Arrow x1={r.x2} x2={r.x1} y={r.y + 3} colour={colour} dashed />}
                  </>
                ) : (
                  <Arrow x1={r.x1} x2={xEnd} y={r.y} colour={colour} dashed={media ? '1 5' : r.k === 'res'} width={media ? 3 : 1.6} both={r.both} />
                )}
                <rect x={mid - textW / 2} y={r.y - 21} width={textW} height={15} fill="transparent" />
                <text
                  x={mid}
                  y={r.y - 8}
                  textAnchor="middle"
                  opacity={p}
                  style={{ fontFamily: MONO, fontSize: 12, fontWeight: on ? 600 : 400 }}
                  fill={on ? TEXT : MUTED}
                >
                  {r.m}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <ol className="sr-only">
        {visibleRows.map((r) => (
          <li key={r.id}>{describe(r, byId)}</li>
        ))}
      </ol>
    </div>
  );
}
