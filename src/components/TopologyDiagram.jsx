import { useEffect, useMemo, useRef, useState } from 'react';
import { K, MONO, SANS, PANEL, EDGE, MUTED, FAINT } from '../theme.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { resolveGlossaryKey } from '../lib/resolveGlossaryKey.js';
import { svgTermProps } from '../lib/svgTermProps.js';
import { DOT_PHASE } from '../engine/useStepPlayer.js';
import { nodeAt } from '../engine/geometry.js';

const BUBBLE_MARGIN = 6;
const BUBBLE_H = 20;
const CHAR_W = 6.8;
const NODE_PAD = 4;

/** Splits a message label into tokens, keeping delimiters, so glossary-known tokens can be made clickable. */
const tokenise = (m) => m.split(/(\s+|\/|→|\(|\))/).filter((t) => t !== '');

export default function TopologyDiagram({
  topology,
  geo,
  steps,
  step,
  progress,
  ambient,
  focus,
  reducedMotion,
  onGlossaryOpen,
  activeGlossaryKey,
  highlightNode,
  maxHeight,
}) {
  const cur = steps[step];
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [clock, setClock] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [, , vbW] = useMemo(() => topology.viewBox.split(/\s+/).map(Number), [topology.viewBox]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      setClock((c) => c + dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  // Does the diagram overflow its container (phones, narrow windows)? If so
  // the step-follow scroll below and the swipe hint are relevant.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const check = () => setOverflowing(wrap.scrollWidth > wrap.clientWidth + 2);
    check();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
    ro?.observe(wrap);
    return () => ro?.disconnect();
  }, [topology]);

  // Follow the action: keep the current step's route centred horizontally
  // when the diagram is wider than the viewport.
  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg || !overflowing) return;
    const xs = cur.p.map((id) => topology.nodes[id].cx);
    const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
    const scale = svg.clientWidth / vbW;
    const left = Math.max(0, mid * scale - wrap.clientWidth / 2);
    wrap.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [cur, overflowing, topology, vbW, reducedMotion]);

  const activeLinks = useMemo(() => new Set(geo.routeLinks(cur.p)), [geo, cur]);
  const activeNodes = useMemo(() => new Set(cur.p), [cur]);
  const litNodes = useMemo(() => {
    const s = new Set();
    for (let i = 0; i <= step; i++) steps[i].p.forEach((n) => s.add(n));
    return s;
  }, [step, steps]);

  // The dot travels during the first DOT_PHASE of the step, then holds at its
  // destination while the learner reads.
  const travel = Math.min(progress / DOT_PHASE, 1);
  const t = cur.rt ? (travel < 0.5 ? travel * 2 : (1 - travel) * 2) : travel;
  const pos = geo.pointOnRoute(cur.p, t);
  const accent = K[cur.k].c;
  const flows = reducedMotion ? [] : ambient.filter((f) => step >= f.after);

  // Message bubble. While the dot rests inside a node box the bubble lifts
  // above that node so it never covers the node's title; in flight it sits
  // just above the dot. Either way it is clamped inside the viewBox so long
  // labels near the edge stay legible.
  const bubbleW = cur.m.length * CHAR_W + 24;
  const restingOn = nodeAt(pos, topology.nodes, NODE_PAD);
  let anchorX = pos.x;
  let bubbleY;
  if (restingOn) {
    const n = topology.nodes[restingOn];
    anchorX = n.cx;
    const top = n.cy - n.h / 2 - 10 - BUBBLE_H;
    bubbleY = top >= BUBBLE_MARGIN ? top : n.cy + n.h / 2 + 10;
  } else {
    const above = pos.y - 34 >= BUBBLE_MARGIN;
    bubbleY = above ? pos.y - 34 : pos.y + 16;
  }
  const bubbleX = Math.min(Math.max(anchorX - bubbleW / 2, BUBBLE_MARGIN), vbW - bubbleW - BUBBLE_MARGIN);
  const tokens = tokenise(cur.m);

  const describe = `${topology.label} topology. Step ${step + 1} of ${steps.length}: ${cur.t}, ${cur.m}, path ${cur.p
    .map((n) => topology.nodes[n].t)
    .join(cur.rt ? ' and back from ' : ' to ')}.`;

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        onScroll={() => setHintDismissed(true)}
        className="overflow-x-auto rounded"
        style={{ background: PANEL, border: `1px solid ${EDGE}`, touchAction: 'pan-x pan-y' }}
      >
        <svg
          ref={svgRef}
          viewBox={topology.viewBox}
          role="img"
          aria-label={describe}
          style={{ minWidth: topology.minWidth, width: '100%', height: 'auto', maxHeight, display: 'block', margin: '0 auto' }}
        >
          <defs>
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g opacity="0.55">
            {topology.zones.map((z, i) => (
              <rect key={i} x={z.x} y={z.y} width={z.w} height={z.h} rx={z.rx} fill={z.fill} />
            ))}
          </g>
          <g style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em' }}>
            {topology.zones.map((z, i) => (
              <text key={i} x={z.labelX} y={z.labelY} fill={z.labelColor}>
                {z.label}
              </text>
            ))}
          </g>

          {topology.links.map((l, i) => {
            const on = activeLinks.has(l);
            const col = on ? accent : K[l.k].c;
            const op = on ? 0.95 : focus ? 0.26 : 0.4;
            const lp = geo.labelPos(l);
            const linkKey = resolveGlossaryKey(l.l, GLOSSARY);
            const linkTermProps = svgTermProps(linkKey, activeGlossaryKey, onGlossaryOpen);
            return (
              <g key={i}>
                <path
                  d={geo.linkPathD(l)}
                  fill="none"
                  stroke={col}
                  strokeWidth={on ? 2.4 : 1.2}
                  strokeDasharray={l.dash || undefined}
                  opacity={op}
                  filter={on ? 'url(#glow)' : undefined}
                />
                <text
                  x={lp.x}
                  y={lp.y - 5}
                  textAnchor="middle"
                  style={{ fontFamily: MONO, fontSize: 11.5, cursor: linkTermProps ? 'help' : 'default' }}
                  fill={on ? '#ffffff' : MUTED}
                  opacity={on ? 1 : focus ? 0.55 : 0.8}
                  {...(linkTermProps ?? {})}
                >
                  {l.l}
                </text>
              </g>
            );
          })}

          {flows.map((f, fi) => (
            <g key={`f${fi}`}>
              {[0, 1, 2, 3].map((d) => {
                const tt = (clock * 0.28 + d / 4) % 1;
                const p = geo.pointOnRoute(f.p, tt);
                return <circle key={d} cx={p.x} cy={p.y} r={3.5} fill={K[f.k].c} opacity={0.75} />;
              })}
            </g>
          ))}

          {Object.keys(topology.nodes).map((id) => {
            const n = topology.nodes[id];
            const on = activeNodes.has(id);
            const lit = litNodes.has(id);
            const flash = highlightNode === id;
            const stroke = on ? accent : flash ? '#ffffff' : lit ? '#3d5a8a' : EDGE;
            const dim = focus && !on && !lit && !flash ? 0.6 : 1;
            const nodeKey = resolveGlossaryKey(n.t, GLOSSARY);
            const nodeTermProps = svgTermProps(nodeKey, activeGlossaryKey, onGlossaryOpen);
            const expansion = nodeKey ? GLOSSARY[nodeKey].expansion : null;
            return (
              <g key={id} opacity={dim}>
                {(on || flash) && (
                  <rect
                    x={n.cx - n.w / 2 - 5}
                    y={n.cy - n.h / 2 - 5}
                    width={n.w + 10}
                    height={n.h + 10}
                    rx={12}
                    fill="none"
                    stroke={on ? accent : '#ffffff'}
                    strokeWidth={flash ? 2 : 1}
                    opacity={flash ? 0.9 : 0.45}
                    filter="url(#glow)"
                  />
                )}
                <rect
                  x={n.cx - n.w / 2}
                  y={n.cy - n.h / 2}
                  width={n.w}
                  height={n.h}
                  rx={9}
                  fill={on ? '#16233d' : '#0f1830'}
                  stroke={stroke}
                  strokeWidth={on ? 1.8 : 1}
                >
                  {expansion && <title>{`${n.t} — ${expansion}`}</title>}
                </rect>
                <text
                  x={n.cx}
                  y={n.cy - 5}
                  textAnchor="middle"
                  style={{ fontSize: 13, fontWeight: 600, fontFamily: SANS, cursor: nodeTermProps ? 'help' : 'default' }}
                  fill={on ? '#ffffff' : lit ? '#c6d4ea' : '#a3b3cf'}
                  {...(nodeTermProps ?? {})}
                >
                  {expansion && <title>{`${n.t} — ${expansion}. Click for the definition.`}</title>}
                  {n.t}
                </text>
                <text x={n.cx} y={n.cy + 12} textAnchor="middle" style={{ fontSize: 10.5, fontFamily: MONO }} fill={on ? accent : FAINT}>
                  {n.s}
                </text>
              </g>
            );
          })}

          <g>
            <circle cx={pos.x} cy={pos.y} r={7} fill={accent} filter="url(#glow)" />
            <circle cx={pos.x} cy={pos.y} r={13} fill="none" stroke={accent} strokeWidth="1" opacity={0.35} />
            <rect x={bubbleX} y={bubbleY} width={bubbleW} height={BUBBLE_H} rx={5} fill="#0a1324" stroke={accent} strokeWidth="1" />
            <text x={bubbleX + bubbleW / 2} y={bubbleY + 14} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 11 }} fill="#ffffff">
              {tokens.map((tok, i) => {
                const key = GLOSSARY[tok] ? tok : null;
                const props = svgTermProps(key, activeGlossaryKey, onGlossaryOpen);
                return props ? (
                  <tspan key={i} {...props} style={{ cursor: 'help', textDecoration: 'underline dotted' }}>
                    {tok}
                  </tspan>
                ) : (
                  <tspan key={i}>{tok}</tspan>
                );
              })}
            </text>
          </g>
        </svg>
      </div>
      {overflowing && !hintDismissed && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-2 bottom-2 rounded px-2 py-1"
          style={{ background: '#0a1324ee', border: `1px solid ${EDGE}`, color: MUTED, fontFamily: MONO, fontSize: 10 }}
        >
          ↔ swipe to see the whole network · the view follows each step
        </div>
      )}
    </div>
  );
}
