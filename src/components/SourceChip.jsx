import { SOURCES, citeLabel } from '../data/reference/sources.js';
import { EDGE, MONO, FAINT, MUTED } from '../theme.js';

/** One citation, linking to the official document. */
export function SourceChip({ cite }) {
  const s = SOURCES[cite.src];
  if (!s) return null;
  const label = citeLabel(cite);
  const pdf = s.url.endsWith('.pdf');
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noreferrer"
      title={`${s.doc} ${s.version}: ${s.title}${cite.clause ? `, clause ${cite.clause}` : ''} (opens the official ${pdf ? 'PDF' : 'document'})`}
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:underline"
      style={{ border: `1px solid ${EDGE}`, fontFamily: MONO, fontSize: 12, color: MUTED, whiteSpace: 'nowrap' }}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2 1.5h5.5L10 4v6.5H2z M7.5 1.5V4H10" fill="none" stroke="currentColor" strokeWidth="1.1" />
      </svg>
      {label}
      <span className="sr-only">
        {' '}
        ({s.doc} {s.version}, {s.title}{pdf ? ', PDF' : ''}, opens in a new tab)
      </span>
    </a>
  );
}

/** A labelled row of citations. */
export default function Sources({ cites, label = 'Sources', className = '' }) {
  if (!cites?.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: FAINT }}>{label.toUpperCase()}</span>
      {cites.map((c, i) => (
        <SourceChip key={`${c.src}-${c.clause ?? ''}-${i}`} cite={c} />
      ))}
    </div>
  );
}
