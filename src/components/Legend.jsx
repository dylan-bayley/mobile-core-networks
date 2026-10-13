import { K, PANEL, EDGE, MONO, MUTED } from '../theme.js';
import { KindSwatch } from './KindMark.jsx';

/** Line colours for the protocol families the current flow actually uses. */
export default function Legend({ kinds }) {
  const keys = kinds ?? Object.keys(K);
  return (
    <ul
      aria-label="Line colours and shapes"
      className="mt-3 flex list-none flex-wrap items-center gap-x-4 gap-y-1.5 rounded px-3 py-2"
      style={{ background: PANEL, border: `1px solid ${EDGE}` }}
    >
      {keys.map((k) => (
        <li key={k} className="flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 12, color: MUTED }}>
          <KindSwatch kind={k} />
          {K[k].n}
        </li>
      ))}
    </ul>
  );
}
