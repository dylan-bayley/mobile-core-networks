import { useEffect, useMemo, useState } from 'react';
import { K, MONO, SANS, PANEL, EDGE } from '../theme.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { resolveGlossaryKey } from '../lib/resolveGlossaryKey.js';
import { svgTermProps } from '../lib/svgTermProps.js';
import { DOT_PHASE } from '../engine/useStepPlayer.js';

const BUBBLE_MARGIN = 6;
const CHAR_W = 6.8;

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
  maxHeight,
}) {
  const cur = steps[step];
  const [clock, setClock] = useState(0);
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

  // Message bubble, clamped inside the viewBox so long labels near the edge
  // (e.g. "PDU Session Establishment Request" leaving the UE) stay legible.
  const bubbleW = cur.m.length * CHAR_W + 24;
  const bubbleX = Math.min(Math.max(pos.x - bubbleW / 2, BUBBLE_MARGIN), vbW - bubbleW - BUBBLE_MARGIN);
  const above = pos.y - 34 >= BUBBLE_MARGIN;
  const bubbleY = above ? pos.y - 34 : pos.y + 16;
  const tokens = tokenise(cur.m);

  const describe = `${topology.label} topology. Step ${step + 1} of ${steps.length}: ${cur.t}, ${cur.m}, path ${cur.p
    .map((n) => topology.nodes[n].t)
    .join(cur.rt ? ' and back from ' : ' to ')}.`;

  return (
    <div className="overflow-x-auto rounded" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <svg
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
          const op = on ? 0.95 : focus ? 0.16 : 0.34;
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
                style={{ fontFamily: MONO, fontSize: 10, cursor: linkTermProps ? 'help' : 'default' }}
                fill={on ? '#ffffff' : '#6d82a5'}
                opacity={on ? 1 : focus ? 0.3 : 0.6}
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
          const stroke = on ? accent : lit ? '#33507d' : EDGE;
          const dim = focus && !on && !lit ? 0.42 : 1;
          const nodeKey = resolveGlossaryKey(n.t, GLOSSARY);
          const nodeTermProps = svgTermProps(nodeKey, activeGlossaryKey, onGlossaryOpen);
          return (
            <g key={id} opacity={dim}>
              {on && (
                <rect
                  x={n.cx - n.w / 2 - 5}
                  y={n.cy - n.h / 2 - 5}
                  width={n.w + 10}
                  height={n.h + 10}
                  rx={12}
                  fill="none"
                  stroke={accent}
                  strokeWidth="1"
                  opacity="0.45"
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
              />
              <text
                x={n.cx}
                y={n.cy - 5}
                textAnchor="middle"
                style={{ fontSize: 13, fontWeight: 600, fontFamily: SANS, cursor: nodeTermProps ? 'help' : 'default' }}
                fill={on ? '#ffffff' : lit ? '#c6d4ea' : '#8ea1bf'}
                {...(nodeTermProps ?? {})}
              >
                {n.t}
              </text>
              <text x={n.cx} y={n.cy + 12} textAnchor="middle" style={{ fontSize: 10, fontFamily: MONO }} fill={on ? accent : '#63799c'}>
                {n.s}
              </text>
            </g>
          );
        })}

        <g>
          <circle cx={pos.x} cy={pos.y} r={7} fill={accent} filter="url(#glow)" />
          <circle cx={pos.x} cy={pos.y} r={13} fill="none" stroke={accent} strokeWidth="1" opacity={0.35} />
          <rect x={bubbleX} y={bubbleY} width={bubbleW} height={20} rx={5} fill="#0a1324" stroke={accent} strokeWidth="1" />
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
  );
}
