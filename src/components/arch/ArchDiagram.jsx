import { useEffect, useMemo, useRef, useState } from 'react';
import { K, GEN, MONO, SANS, PANEL, EDGE, FAINT, MUTED, TEXT, CONTROL_BAND, USER_BAND, NODE_FILL, NODE_FILL_ON } from '../../theme.js';
import { GLOSSARY } from '../../data/reference/glossary.js';
import { resolveGlossaryKey } from '../../lib/resolveGlossaryKey.js';
import { svgTermProps } from '../../lib/svgTermProps.js';
import { control, bez } from '../../engine/geometry.js';
import { NODE_SIZE, targetState, interpolate, linksFor, linkKey, pointAlong, labelTFor } from '../../engine/arch.js';

const TWEEN_MS = 1100;
const BAND_FILL = { control: CONTROL_BAND, user: USER_BAND };
const BAND_LABEL = { control: 'CONTROL PLANE', user: 'USER PLANE' };

const termKey = (n) => (n.g && GLOSSARY[n.g] ? n.g : resolveGlossaryKey(n.t, GLOSSARY));

/** Points along the drawn curve of a link from `p` to `q`, so traffic dots ride the line. */
function hopPoints(p, q, curve) {
  if (!curve) return [p, q];
  const c = control(p, q, curve);
  const out = [];
  for (let i = 0; i <= 10; i++) out.push(bez(p, c, q, i / 10));
  return out;
}

/**
 * Renders one scene of an architecture diagram and animates between scenes:
 * nodes glide to new positions, fade in (optionally splitting out of an
 * existing node), links draw themselves in, the service bus appears or
 * dissolves, and traffic dots stream along the scene's routes.
 */
export default function ArchDiagram({
  diagram,
  current,
  first = false,
  mode,
  width,
  reducedMotion,
  onOpenTerm,
  activeKey,
  focusNode = null,
  label,
  maxHeight,
}) {
  const scene = current.scene;
  const target = useMemo(() => targetState(diagram, current, mode), [diagram, current, mode]);

  // --- tween between scene states -------------------------------------
  const anim = useRef(null);
  const shown = useRef(target);
  const [, setFrame] = useState(0);
  const lastMode = useRef(mode);

  if (!anim.current) anim.current = { from: target, to: target, start: 0, spawn: {} };
  if (anim.current.to !== target) {
    const instant = reducedMotion || lastMode.current !== mode;
    anim.current = {
      from: instant ? target : shown.current,
      to: target,
      start: typeof performance !== 'undefined' ? performance.now() : 0,
      spawn: scene.spawn ?? {},
      instant,
    };
    lastMode.current = mode;
  }

  const traffic = scene.traffic ?? [];
  const needsClock = !reducedMotion && (traffic.length > 0 || (current.added.length > 0 && !first));
  const clockRef = useRef(0);

  useEffect(() => {
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clockRef.current += dt;
      const tweening = !anim.current.instant && now - anim.current.start < TWEEN_MS;
      // Always render once more after the tween ends, so it lands exactly on its target.
      setFrame((f) => (f + 1) % 1e6);
      if (tweening || needsClock) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, needsClock]);

  const now = typeof performance !== 'undefined' ? performance.now() : 0;
  const t = anim.current.instant ? 1 : Math.min(1, (now - anim.current.start) / TWEEN_MS);
  const state = t >= 1 ? anim.current.to : interpolate(anim.current.from, anim.current.to, t, anim.current.spawn);
  shown.current = state;

  // --- sizing --------------------------------------------------------
  const g = diagram.grid[mode];
  // The rendered scale: limited by width, and by height when a max height is set.
  const scale = width ? Math.min(width / g.w, maxHeight ? maxHeight / g.h : Infinity) : 1;
  const titleFont = Math.max(13, 12 / scale);
  const smallFont = Math.max(10.5, 10 / scale);
  const showSub = mode === 'wide' && scale >= 0.85;
  const base = NODE_SIZE[mode];
  const sizeOf = (n) => {
    const w = Math.max(base.w, n.t.length * titleFont * 0.62 + 18);
    return { w, h: showSub && n.s ? base.h : base.h - 8 };
  };

  // --- focus ----------------------------------------------------------
  const focusLinks = new Set(scene.focus?.links ?? []);
  const focusNodes = new Set(scene.focus?.nodes ?? []);
  if (focusNode) focusNodes.add(focusNode);
  const hasFocus = focusLinks.size > 0 || focusNodes.size > 0;
  const added = new Set(first ? [] : current.added);

  // Links drawn = union of outgoing (fading) and incoming ones.
  const drawn = diagram.links.filter((l) => state.links[linkKey(l)]);
  const liveLinks = new Set(linksFor(diagram, current.layoutName, current.visible).map(linkKey));
  const nodePos = (id) => state.nodes[id];
  const visibleNode = (id) => (state.nodes[id]?.o ?? 0) > 0.02 && state.nodes[id]?.x != null;

  const routeLinks = new Set();
  for (const tr of traffic) {
    for (let i = 0; i < tr.p.length - 1; i++) {
      const a = tr.p[i].replace(/^@/, '');
      const b = tr.p[i + 1].replace(/^@/, '');
      const l = diagram.links.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
      if (l) routeLinks.add(linkKey(l));
    }
  }

  // Bus extent: spans the nodes that have a service interface. Horizontal
  // on wide layouts, vertical on portrait ones.
  const vbus = !!state.bus.vertical;
  const stubNodes = Object.keys(diagram.svc ?? {}).filter((id) => visibleNode(id));
  const along = stubNodes.map((id) => (vbus ? nodePos(id).y : nodePos(id).x));
  const bus0 = along.length ? Math.min(...along) - (vbus ? 30 : 44) : 0;
  const bus1 = along.length ? Math.max(...along) + (vbus ? 30 : 44) : 0;

  const pointFor = (ref) => {
    if (ref.startsWith('@')) {
      const n = nodePos(ref.slice(1));
      return vbus ? { x: state.bus.x ?? n.x, y: n.y } : { x: n.x, y: state.bus.y ?? n.y };
    }
    const n = nodePos(ref);
    return { x: n.x, y: n.y };
  };
  const routePoints = (p) => {
    const pts = [];
    for (let i = 0; i < p.length - 1; i++) {
      const a = pointFor(p[i]);
      const b = pointFor(p[i + 1]);
      const l = diagram.links.find((x) => x.a === p[i] && x.b === p[i + 1]) ?? diagram.links.find((x) => x.b === p[i] && x.a === p[i + 1]);
      const curve = l ? (l.a === p[i] ? l.curve ?? 0 : -(l.curve ?? 0)) : 0;
      const seg = hopPoints(a, b, curve);
      pts.push(...(i === 0 ? seg : seg.slice(1)));
    }
    return pts;
  };

  const visibleTitles = [...current.visible].map((id) => diagram.nodes[id].t).join(', ');
  const aria = `${label ?? diagram.title}. ${scene.title}. Shown: ${visibleTitles}.`;
  const clock = clockRef.current;

  return (
    <svg
      viewBox={`0 0 ${g.w} ${g.h}`}
      role="group"
      aria-label={aria}
      style={{ width: '100%', height: 'auto', maxHeight: maxHeight ?? undefined, display: 'block', margin: '0 auto' }}
    >
      <defs>
        <filter id={`glow-${diagram.id}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Links need a user-space filter region: a perfectly horizontal or
            vertical path has a zero-height (or zero-width) bounding box, and
            a bounding-box filter would make it vanish. */}
        <filter id={`glowline-${diagram.id}`} filterUnits="userSpaceOnUse" x={-40} y={-40} width={g.w + 80} height={g.h + 80}>
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Plane bands */}
      {Object.entries(state.bands).map(([name, b]) => (
        <g key={name} opacity={b.o}>
          <rect x={4} y={b.y} width={g.w - 8} height={b.h} rx={10} fill={BAND_FILL[name]} opacity={0.75} />
          <text x={16} y={b.y + 8 + smallFont} style={{ fontFamily: MONO, fontSize: smallFont * 0.92, letterSpacing: '0.14em' }} fill={FAINT}>
            {BAND_LABEL[name]}
          </text>
        </g>
      ))}

      {/* Service-based interface bus and its stubs */}
      {state.bus.o > 0.01 && along.length > 0 && (
        <g opacity={state.bus.o}>
          {vbus ? (
            <>
              <line x1={state.bus.x} x2={state.bus.x} y1={bus0} y2={bus1} stroke={K.sbi.c} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
              <text x={state.bus.x} y={bus0 - 6} textAnchor="middle" style={{ fontFamily: MONO, fontSize: smallFont }} fill={K.sbi.c}>
                SBI · HTTP/2
              </text>
            </>
          ) : (
            <>
              <line x1={bus0} x2={bus1} y1={state.bus.y} y2={state.bus.y} stroke={K.sbi.c} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
              <text x={bus1} y={state.bus.y + smallFont + 8} textAnchor="end" style={{ fontFamily: MONO, fontSize: smallFont }} fill={K.sbi.c}>
                SBI · HTTP/2
              </text>
            </>
          )}
          {stubNodes.map((id) => {
            const n = nodePos(id);
            const size = sizeOf(diagram.nodes[id]);
            if (vbus) {
              const edgeX = n.x < state.bus.x ? n.x + size.w / 2 : n.x - size.w / 2;
              return (
                <g key={id} opacity={n.o}>
                  <line x1={edgeX} x2={state.bus.x} y1={n.y} y2={n.y} stroke={K.sbi.c} strokeWidth={1.4} opacity={0.8} />
                  {diagram.svc[id] && (
                    <text x={(edgeX + state.bus.x) / 2} y={n.y - 5} textAnchor="middle" style={{ fontFamily: MONO, fontSize: smallFont * 0.9 }} fill={MUTED}>
                      {diagram.svc[id]}
                    </text>
                  )}
                </g>
              );
            }
            const edgeY = n.y < state.bus.y ? n.y + size.h / 2 : n.y - size.h / 2;
            const midY = (edgeY + state.bus.y) / 2;
            return (
              <g key={id} opacity={n.o}>
                <line x1={n.x} x2={n.x} y1={edgeY} y2={state.bus.y} stroke={K.sbi.c} strokeWidth={1.4} opacity={0.8} />
                {diagram.svc[id] && (
                  <text x={n.x + 5} y={midY + smallFont / 3} style={{ fontFamily: MONO, fontSize: smallFont * 0.95 }} fill={MUTED}>
                    {diagram.svc[id]}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* Reference-point links */}
      {drawn.map((l) => {
        const k = linkKey(l);
        const ls = state.links[k];
        if (!visibleNode(l.a) || !visibleNode(l.b)) return null;
        const p0 = nodePos(l.a);
        const p1 = nodePos(l.b);
        const c = control(p0, p1, l.curve ?? 0);
        const on = focusLinks.has(l.l) || routeLinks.has(k) || (focusNode && (l.a === focusNode || l.b === focusNode));
        const dim = hasFocus && !on;
        const col = K[l.k].c;
        const mid = bez(p0, c, p1, labelTFor(l, mode));
        const lw = l.l.length * smallFont * 0.62 + 10;
        const lkey = resolveGlossaryKey(l.l, GLOSSARY);
        const props = liveLinks.has(k) ? svgTermProps(lkey, activeKey, onOpenTerm) : null;
        const drawIn = ls.draw < 1 && !l.dash;
        return (
          <g key={k} opacity={ls.o * Math.min(p0.o, p1.o) * (dim ? 0.35 : 1)}>
            <path
              d={`M ${p0.x} ${p0.y} Q ${c.x} ${c.y} ${p1.x} ${p1.y}`}
              fill="none"
              stroke={col}
              strokeWidth={on ? 2.6 : 1.5}
              pathLength={drawIn ? 1 : undefined}
              strokeDasharray={drawIn ? '1 1' : l.dash || undefined}
              strokeDashoffset={drawIn ? 1 - ls.draw : undefined}
              filter={on ? `url(#glowline-${diagram.id})` : undefined}
            />
            {ls.draw > 0.6 && (
              <g {...(props ?? {})} style={{ cursor: props ? 'help' : 'default' }}>
                <rect x={mid.x - lw / 2} y={mid.y - smallFont * 0.8} width={lw} height={smallFont * 1.6} rx={4} fill={PANEL} stroke={on ? col : EDGE} strokeWidth={1} />
                <text x={mid.x} y={mid.y + smallFont * 0.35} textAnchor="middle" style={{ fontFamily: MONO, fontSize: smallFont }} fill={on ? TEXT : MUTED}>
                  {l.l}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {Object.entries(diagram.nodes).map(([id, n]) => {
        const s = state.nodes[id];
        if (!s || s.x == null || s.o < 0.02) return null;
        const size = sizeOf(n);
        const gen = GEN[n.gen] ?? GEN.ext;
        const on = focusNodes.has(id);
        const isNew = added.has(id);
        // Dim with colour, not opacity, so links never show through a node box.
        const dim = hasFocus && !on && !isNew;
        const key = termKey(n);
        const live = current.visible.has(id);
        const props = live ? svgTermProps(key, activeKey, onOpenTerm) : null;
        const pulse = isNew && !reducedMotion ? 0.5 + 0.5 * Math.sin(clock * 4) : isNew ? 1 : 0;
        return (
          <g
            key={id}
            transform={`translate(${s.x} ${s.y}) scale(${s.s})`}
            opacity={s.o}
            {...(props ?? {})}
            aria-label={props ? `${n.t}${key && GLOSSARY[key] ? ` — ${GLOSSARY[key].expansion}` : ''}` : undefined}
            style={{ cursor: props ? 'pointer' : 'default' }}
          >
            {(on || isNew) && (
              <rect
                x={-size.w / 2 - 5}
                y={-size.h / 2 - 5}
                width={size.w + 10}
                height={size.h + 10}
                rx={12}
                fill="none"
                stroke={gen.c}
                strokeWidth={1.4}
                opacity={on ? 0.7 : 0.25 + pulse * 0.5}
                filter={`url(#glow-${diagram.id})`}
              />
            )}
            <rect
              x={-size.w / 2}
              y={-size.h / 2}
              width={size.w}
              height={size.h}
              rx={9}
              fill={on || isNew ? NODE_FILL_ON : NODE_FILL}
              stroke={gen.c}
              strokeOpacity={on || isNew ? 1 : dim ? 0.3 : 0.55}
              strokeWidth={on || isNew ? 1.8 : 1.2}
            />
            <text
              y={showSub && n.s ? -3 : titleFont * 0.36}
              textAnchor="middle"
              style={{ fontFamily: SANS, fontSize: titleFont, fontWeight: 650 }}
              fill={dim ? MUTED : TEXT}
            >
              {n.t}
            </text>
            {showSub && n.s && (
              <text y={13} textAnchor="middle" style={{ fontFamily: MONO, fontSize: smallFont * 0.95 }} fill={FAINT}>
                {n.s}
              </text>
            )}
          </g>
        );
      })}
      {/* Traffic */}
      {traffic.map((tr, ti) => {
        if (!tr.p.every((ref) => visibleNode(ref.replace(/^@/, '')))) return null;
        const pts = routePoints(tr.p);
        const n = tr.n ?? 3;
        const col = K[tr.k].c;
        const speed = tr.speed ?? 0.22;
        const fade = t >= 1 ? 1 : Math.max(0, (t - 0.6) / 0.4);
        const dots = Array.from({ length: n }, (_, d) => {
          const tt = reducedMotion ? (d + 0.5) / n : (clock * speed + d / n + (tr.phase ?? 0)) % 1;
          return pointAlong(pts, tt);
        });
        const lp = tr.label ? dots[0] : null;
        const lw = tr.label ? tr.label.length * smallFont * 0.62 + 14 : 0;
        const lx = lp ? Math.min(Math.max(lp.x - lw / 2, 4), g.w - lw - 4) : 0;
        return (
          <g key={`t${ti}`} opacity={fade} aria-hidden="true">
            {dots.map((p, d) => (
              <circle key={d} cx={p.x} cy={p.y} r={tr.k === 'user' ? 4.5 : 5.5} fill={col} filter={`url(#glow-${diagram.id})`} opacity={0.95} />
            ))}
            {lp && (
              <g>
                <rect x={lx} y={lp.y - smallFont * 2.6} width={lw} height={smallFont * 1.7} rx={5} fill="#0a1324" stroke={col} strokeWidth={1} />
                <text x={lx + lw / 2} y={lp.y - smallFont * 1.4} textAnchor="middle" style={{ fontFamily: MONO, fontSize: smallFont }} fill={TEXT}>
                  {tr.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

    </svg>
  );
}
