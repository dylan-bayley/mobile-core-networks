const END_GAP = 9; // keep arrowheads off the lifelines

/** One horizontal message arrow on a ladder diagram, stopping short of the lifelines at either end. */
export default function Arrow({ x1, x2, y, colour, dashed, opacity, width = 1.6, gap = END_GAP, both = false }) {
  const dir = x2 >= x1 ? 1 : -1;
  const xs = x1 + dir * gap;
  const xe = x2 - dir * gap;
  return (
    <g opacity={opacity}>
      <line x1={xs} y1={y} x2={xe} y2={y} stroke={colour} strokeWidth={width} strokeDasharray={dashed === true ? '4 3' : dashed || undefined} />
      <polygon points={`${xe},${y} ${xe - dir * 7},${y - 3.5} ${xe - dir * 7},${y + 3.5}`} fill={colour} />
      {both && <polygon points={`${xs},${y} ${xs + dir * 7},${y - 3.5} ${xs + dir * 7},${y + 3.5}`} fill={colour} />}
    </g>
  );
}
