import { useEffect, useMemo, useState } from 'react';
import { K, MONO, SANS, PANEL, EDGE } from '../theme.js';

export default function TopologyDiagram({ topology, geo, steps, step, progress, ambient, focus, reducedMotion }) {
  const cur = steps[step];
  const [clock, setClock] = useState(0);

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

  const t = cur.rt ? (progress < 0.5 ? progress * 2 : (1 - progress) * 2) : progress;
  const pos = geo.pointOnRoute(cur.p, t);
  const accent = K[cur.k].c;
  const flows = reducedMotion ? [] : ambient.filter((f) => step >= f.after);

  return (
    <div className="overflow-x-auto rounded" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <svg viewBox={topology.viewBox} style={{ minWidth: topology.minWidth, width: '100%', display: 'block' }}>
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
          const mid = geo.linkMid(l);
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
                x={mid.x}
                y={mid.y - 5}
                textAnchor="middle"
                style={{ fontFamily: MONO, fontSize: 10 }}
                fill={on ? '#ffffff' : '#6d82a5'}
                opacity={on ? 1 : focus ? 0.3 : 0.6}
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
                style={{ fontSize: 13, fontWeight: 600, fontFamily: SANS }}
                fill={on ? '#ffffff' : lit ? '#c6d4ea' : '#8ea1bf'}
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
          <rect
            x={pos.x - (cur.m.length * 3.4 + 12)}
            y={pos.y - 34}
            width={cur.m.length * 6.8 + 24}
            height={20}
            rx={5}
            fill="#0a1324"
            stroke={accent}
            strokeWidth="1"
          />
          <text x={pos.x} y={pos.y - 20} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 11 }} fill="#ffffff">
            {cur.m}
          </text>
        </g>
      </svg>
    </div>
  );
}
