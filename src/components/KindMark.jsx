import { K, PANEL } from '../theme.js';

/*
 * A small shape per protocol family, drawn beside each link label and in the
 * legends, so a link's family never depends on its colour alone (WCAG 1.4.1).
 * Dashes are already used for optional or overlay links, so shape carries the
 * family instead.
 */
const SHAPES = {
  user: (r) => ({ el: 'circle', p: { r } }), // filled circle
  radio: (r) => ({ el: 'circle', p: { r: r - 0.6 }, hollow: true }), // ring
  control: (r) => ({ el: 'path', p: { d: `M ${-r} ${-r} H ${r} V ${r} H ${-r} Z` } }), // square
  diameter: (r) => ({ el: 'path', p: { d: `M 0 ${-r - 1} L ${r + 1} 0 L 0 ${r + 1} L ${-r - 1} 0 Z` } }), // diamond
  sbi: (r) => ({ el: 'path', p: { d: `M 0 ${-r - 0.5} L ${r + 0.8} ${r} H ${-r - 0.8} Z` } }), // triangle up
  ims: (r) => ({ el: 'path', p: { d: `M 0 ${r + 0.5} L ${r + 0.8} ${-r} H ${-r - 0.8} Z` } }), // triangle down
  media: (r) => ({ el: 'path', p: { d: `M ${-r - 1} 0 H ${r + 1} M 0 ${-r - 1} V ${r + 1}` }, stroke: true }), // plus
  tdm: (r) => ({ el: 'path', p: { d: `M ${-r} ${-r} L ${r} ${r} M ${r} ${-r} L ${-r} ${r}` }, stroke: true }), // cross
};

/** The mark for protocol family `kind`, centred on (cx, cy) inside an SVG. */
export function KindMark({ kind, cx, cy, r = 3.2, colour }) {
  const c = colour ?? K[kind]?.c;
  const s = (SHAPES[kind] ?? SHAPES.user)(r);
  const Shape = s.el;
  const paint = s.stroke
    ? { fill: 'none', stroke: c, strokeWidth: 1.6, strokeLinecap: 'round' }
    : s.hollow
      ? { fill: 'none', stroke: c, strokeWidth: 1.4 }
      : { fill: c };
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden="true">
      <Shape {...s.p} {...paint} />
    </g>
  );
}

/** A legend swatch: the family's line with its mark in the middle. */
export function KindSwatch({ kind, width = 22 }) {
  const c = K[kind].c;
  return (
    <svg width={width} height="12" viewBox={`0 0 ${width} 12`} aria-hidden="true" style={{ display: 'inline-block', flex: 'none' }}>
      <line x1="0" y1="6" x2={width} y2="6" stroke={c} strokeWidth="2" />
      <rect x={width / 2 - 5} y="1" width="10" height="10" fill={PANEL} />
      <KindMark kind={kind} cx={width / 2} cy={6} colour={c} />
    </svg>
  );
}
