import { useEffect, useMemo, useRef } from 'react';
import { K, MONO, SANS, PANEL, EDGE, MUTED, FAINT, TEXT_2 } from '../theme.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { resolveGlossaryKey } from '../lib/resolveGlossaryKey.js';
import { svgTermProps } from '../lib/svgTermProps.js';
import { useElementWidth } from '../lib/useElementWidth.js';
import { KindMark } from './KindMark.jsx';
import Arrow from './Arrow.jsx';

const LANE_W = 104;
const LEFT = 40;
const HEAD = 48;
const ROW_H = 38;
const MIN_LANE_PX = 78; // narrowest a lane renders before the ladder scrolls sideways
const MIN_TEXT_PX = 10.5; // smallest rendered text, whatever the diagram is scaled to

/**
 * Ladder (sequence) view of the same step data the topology animates:
 * lifelines for every node the flow touches, one row per step, arrows per
 * hop coloured by protocol family. Current row is highlighted; future rows
 * dimmed — the same visual grammar as the topology view.
 */
export default function SequenceDiagram({ topology, steps, step, onGo, onGlossaryOpen, activeGlossaryKey, maxHeight, reducedMotion }) {
  const [wrapRef, wrapW] = useElementWidth();
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
  // Rendered scale: the SVG is at least lanes * MIN_LANE_PX wide, then scrolls.
  // Grow small text in viewBox units so it stays readable (same idea as ArchDiagram).
  const scale = Math.max(wrapW, lanes.length * MIN_LANE_PX) / width || 1;
  const fs = (units) => Math.max(units, MIN_TEXT_PX / scale);
  const subFont = fs(9);
  const accent = K[cur.k].c;
  const subMax = Math.max(6, Math.floor((LANE_W - 8) / (subFont * 0.6)));

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
        // A group, not an image: an image's children are presentational, which
        // would hide the clickable node names from screen readers.
        role="group"
        aria-label={`Sequence diagram, ${steps.length} steps across ${lanes.length} nodes. Current step ${step + 1}: ${cur.t}.`}
        style={{ width: '100%', minWidth: lanes.length * MIN_LANE_PX, height: 'auto', display: 'block' }}
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
                fill={touched ? '#ffffff' : TEXT_2}
                {...(termProps ?? {})}
              >
                {n.t}
              </text>
              <text x={x} y={34} textAnchor="middle" style={{ fontFamily: MONO, fontSize: subFont }} fill={FAINT}>
                {n.s.length > subMax ? `${n.s.slice(0, subMax - 1)}…` : n.s}
              </text>
            </g>
          );
        })}

        {/* rows */}
        {steps.map((s, i) => {
          const rowTop = HEAD + i * ROW_H;
          const y = rowTop + ROW_H / 2 + 6;
          const colour = K[s.k].c;
          const msgFont = fs(10.5);
          const isCur = i === step;
          // Steps still to come are dimmed: arrows by opacity, text by a
          // dimmer theme colour (opacity on text would drop it below AA).
          const future = i > step;
          const opacity = future ? 0.4 : 1;
          const xs = s.p.map(laneX);
          const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
          return (
            <g key={s.id}>
              {isCur && <rect x={4} y={rowTop + 1} width={width - 8} height={ROW_H - 2} rx={5} fill={`${accent}14`} stroke={`${accent}88`} />}
              <text x={LEFT / 2} y={y + 3} textAnchor="middle" style={{ fontFamily: MONO, fontSize: fs(10) }} fill={isCur ? colour : FAINT}>
                {String(i + 1).padStart(2, '0')}
              </text>
              {s.tag && (
                <text x={LEFT / 2} y={y - 8} textAnchor="middle" style={{ fontFamily: MONO, fontSize: Math.max(9, Math.min(fs(9), (LEFT - 2) / (s.tag.length * 0.72))), letterSpacing: '0.08em' }} fill={future ? FAINT : colour}>
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
              <KindMark kind={s.k} cx={midX - (s.m.length * msgFont * 0.6) / 2 - msgFont * 0.75} cy={y - 9 - msgFont * 0.33} r={msgFont * 0.28} colour={isCur ? accent : colour} />
              <text x={midX} y={y - 9} textAnchor="middle" style={{ fontFamily: MONO, fontSize: msgFont }} fill={isCur ? '#ffffff' : future ? FAINT : MUTED}>
                {s.m}
              </text>
              <rect
                x={0}
                y={rowTop}
                width={width}
                height={ROW_H}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                // Clickable, but out of the tab order: the step list is the
                // keyboard route to each step.
                aria-hidden="true"
                tabIndex={-1}
                onClick={() => onGo(i)}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
