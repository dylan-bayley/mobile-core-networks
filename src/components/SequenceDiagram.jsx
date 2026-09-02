import { useEffect, useMemo, useRef } from 'react';
import { K, MONO, SANS, PANEL, EDGE, MUTED, FAINT } from '../theme.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { resolveGlossaryKey } from '../lib/resolveGlossaryKey.js';
import { svgTermProps } from '../lib/svgTermProps.js';

const LANE_W = 104;
const LEFT = 40;
const HEAD = 48;
const ROW_H = 38;
const END_GAP = 9; // keep arrowheads off the lifelines

function Arrow({ x1, x2, y, colour, dashed, opacity }) {
  const dir = x2 >= x1 ? 1 : -1;
  const xs = x1 + dir * END_GAP;
  const xe = x2 - dir * END_GAP;
  return (
    <g opacity={opacity}>
      <line x1={xs} y1={y} x2={xe} y2={y} stroke={colour} strokeWidth={1.6} strokeDasharray={dashed ? '4 3' : undefined} />
      <polygon points={`${xe},${y} ${xe - dir * 7},${y - 3.5} ${xe - dir * 7},${y + 3.5}`} fill={colour} />
    </g>
  );
}

/**
 * Ladder (sequence) view of the same step data the topology animates:
 * lifelines for every node the flow touches, one row per step, arrows per
 * hop coloured by protocol family. Current row is highlighted; future rows
 * dimmed — the same visual grammar as the topology view.
 */
export default function SequenceDiagram({ topology, steps, step, onGo, onGlossaryOpen, activeGlossaryKey, maxHeight, reducedMotion }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);

  const lanes = useMemo(() => {
    const ids = [...new Set(steps.flatMap((s) => s.p))];
    ids.sort((a, b) => topology.nodes[a].cx - topology.nodes[b].cx || topology.nodes[a].cy - topology.nodes[b].cy);
    return ids;
  }, [steps, topology]);

  const laneX = (id) => LEFT + lanes.indexOf(id) * LANE_W + LANE_W / 2;
  const width = LEFT + lanes.length * LANE_W + 12;
  const height = HEAD + steps.length * ROW_H + 10;
  const cur = steps[step];
  const accent = K[cur.k].c;

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;
    const scale = svg.clientWidth / width;
    const top = (HEAD + step * ROW_H) * scale;
    const bottom = top + ROW_H * scale;
    const headPx = HEAD * scale;
    let scrollTop = wrap.scrollTop;
    if (top - headPx < wrap.scrollTop) scrollTop = Math.max(0, top - headPx - 4);
    else if (bottom > wrap.scrollTop + wrap.clientHeight) scrollTop = bottom - wrap.clientHeight + 4;

    // Horizontal follow on narrow screens: centre the current step's arrows.
    let scrollLeft = wrap.scrollLeft;
    if (wrap.scrollWidth > wrap.clientWidth + 2) {
      const xs = cur.p.map(laneX);
      const mid = ((Math.min(...xs) + Math.max(...xs)) / 2) * scale;
      scrollLeft = Math.max(0, mid - wrap.clientWidth / 2);
    }
    wrap.scrollTo({ top: scrollTop, left: scrollLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, width]);

  return (
    <div
      ref={wrapRef}
      className="overflow-auto rounded"
      style={{ background: PANEL, border: `1px solid ${EDGE}`, maxHeight, touchAction: 'pan-x pan-y' }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Sequence diagram, ${steps.length} steps across ${lanes.length} nodes. Current step ${step + 1}: ${cur.t}.`}
        style={{ width: '100%', minWidth: lanes.length * 78, height: 'auto', display: 'block' }}
      >
        {/* lifelines */}
        {lanes.map((id) => {
          const x = laneX(id);
          const n = topology.nodes[id];
          const key = resolveGlossaryKey(n.t, GLOSSARY);
          const termProps = svgTermProps(key, activeGlossaryKey, onGlossaryOpen);
          const touched = cur.p.includes(id);
          return (
            <g key={id}>
              <line x1={x} y1={HEAD - 4} x2={x} y2={height - 6} stroke={touched ? `${accent}66` : EDGE} strokeWidth={touched ? 1.4 : 1} strokeDasharray="3 4" />
              <rect x={x - LANE_W / 2 + 4} y={6} width={LANE_W - 8} height={HEAD - 14} rx={6} fill={touched ? '#16233d' : '#0f1830'} stroke={touched ? accent : EDGE}>
                {key && <title>{`${n.t} — ${GLOSSARY[key].expansion}`}</title>}
              </rect>
              <text
                x={x}
                y={22}
                textAnchor="middle"
                style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: termProps ? 'help' : 'default' }}
                fill={touched ? '#ffffff' : '#a3b3cf'}
                {...(termProps ?? {})}
              >
                {n.t}
              </text>
              <text x={x} y={34} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 8 }} fill={FAINT}>
                {n.s.length > 18 ? `${n.s.slice(0, 17)}…` : n.s}
              </text>
            </g>
          );
        })}

        {/* rows */}
        {steps.map((s, i) => {
          const rowTop = HEAD + i * ROW_H;
          const y = rowTop + ROW_H / 2 + 6;
          const colour = K[s.k].c;
          const isCur = i === step;
          const opacity = i > step ? 0.4 : 1;
          const xs = s.p.map(laneX);
          const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
          return (
            <g key={s.id}>
              {isCur && <rect x={4} y={rowTop + 1} width={width - 8} height={ROW_H - 2} rx={5} fill={`${accent}14`} stroke={`${accent}88`} />}
              <text x={LEFT / 2} y={y + 3} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 9.5 }} fill={isCur ? colour : FAINT} opacity={opacity}>
                {String(i + 1).padStart(2, '0')}
              </text>
              {s.tag && (
                <text x={LEFT / 2} y={y - 8} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: '0.08em' }} fill={colour} opacity={opacity}>
                  {s.tag.toUpperCase()}
                </text>
              )}
              {s.p.slice(0, -1).map((a, h) => (
                <Arrow key={h} x1={laneX(a)} x2={laneX(s.p[h + 1])} y={s.rt ? y - 3 : y} colour={isCur ? accent : colour} opacity={opacity} />
              ))}
              {s.rt &&
                s.p
                  .slice(0, -1)
                  .map((a, h) => (
                    <Arrow key={`r${h}`} x1={laneX(s.p[h + 1])} x2={laneX(a)} y={y + 5} colour={isCur ? accent : colour} dashed opacity={opacity * 0.8} />
                  ))}
              <text x={midX} y={y - 9} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 10.5 }} fill={isCur ? '#ffffff' : MUTED} opacity={opacity}>
                {s.m}
              </text>
              <rect
                x={0}
                y={rowTop}
                width={width}
                height={ROW_H}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`Go to step ${i + 1}: ${s.t}`}
                onClick={() => onGo(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onGo(i);
                  }
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
