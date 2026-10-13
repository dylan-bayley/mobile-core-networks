import { K, PANEL, EDGE, MONO, MUTED } from '../theme.js';

/** Line colours for the protocol families the current flow actually uses. */
export default function Legend({ kinds }) {
  const keys = kinds ?? Object.keys(K);
  return (
    <ul
      aria-label="Line colours"
      className="mt-3 flex list-none flex-wrap items-center gap-x-4 gap-y-1.5 rounded px-3 py-2"
      style={{ background: PANEL, border: `1px solid ${EDGE}` }}
    >
      {keys.map((k) => (
        <li key={k} className="flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 12, color: MUTED }}>
          <span style={{ width: 10, height: 3, background: K[k].c, display: 'inline-block', borderRadius: 2 }} />
          {K[k].n}
        </li>
      ))}
    </ul>
  );
}
