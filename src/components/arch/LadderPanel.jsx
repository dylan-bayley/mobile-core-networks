import { K, MONO, EDGE, FAINT, MUTED, TEXT, TEXT_2, SURFACE } from '../../theme.js';
import { GLOSSARY } from '../../data/reference/glossary.js';
import { autolinkAcronyms } from '../../lib/autolinkAcronyms.jsx';
import DataTable from '../DataTable.jsx';

/** A SIP message or SDP body, one line per row, with the scene's lines highlighted. */
function MessageBlock({ title, lines, highlight, accent }) {
  return (
    <figure className="min-w-0">
      {title && (
        <figcaption className="mb-1.5" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', color: FAINT }}>
          {title.toUpperCase()}
        </figcaption>
      )}
      <pre className="overflow-x-auto rounded px-3 py-2.5 text-[12.5px] leading-relaxed" style={{ background: SURFACE, border: `1px solid ${EDGE}`, fontFamily: MONO, color: TEXT_2 }}>
        {lines.map((l, i) => {
          const on = l.key && highlight.has(l.key);
          return (
            <span
              key={i}
              className="-mx-1.5 block rounded-sm px-1.5"
              style={{ background: on ? `${accent}24` : 'transparent', color: on ? TEXT : l.dim ? MUTED : TEXT_2, boxShadow: on ? `inset 2px 0 0 ${accent}` : 'none' }}
            >
              {l.text || ' '}
            </span>
          );
        })}
      </pre>
    </figure>
  );
}

/** The notes for the highlighted lines: what each header or SDP line is for. */
function Notes({ lines, highlight, glossary }) {
  // The offer and the answer share keys (c=, m=): note each one once.
  const seen = new Set();
  const notes = lines.filter((l) => l.key && l.note && highlight.has(l.key) && !seen.has(l.key) && seen.add(l.key));
  if (!notes.length) return null;
  return (
    <dl className="mt-3 grid gap-1.5 text-sm leading-relaxed">
      {notes.map((l) => (
        <div key={l.key} className="grid grid-cols-[minmax(0,9.5rem)_1fr] gap-x-3">
          <dt style={{ fontFamily: MONO, fontSize: 12.5, color: TEXT }}>{l.label ?? l.key}</dt>
          <dd style={{ color: TEXT_2 }}>{autolinkAcronyms(l.note, GLOSSARY, glossary)}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The scene's side panel in a ladder lesson: an annotated SIP message, an
 * SDP offer and answer, or a reference table. `highlight` names the lines
 * the scene is about; their notes are listed under the message. `stack`
 * puts an SDP offer above its answer when the panel is a narrow column.
 */
export default function LadderPanel({ panel, highlight = [], kind = 'ims', stack = false, glossary }) {
  const on = new Set(highlight);
  const accent = K[kind]?.c ?? K.ims.c;
  if (panel.type === 'table') {
    return <DataTable title={panel.title} caption={panel.caption} columns={panel.columns} rows={panel.rows} cites={panel.cites} />;
  }
  if (panel.type === 'sdp') {
    return (
      <div className="min-w-0">
        <div className={stack ? 'grid gap-3' : 'grid gap-3 sm:grid-cols-2'}>
          <MessageBlock title={panel.offer.title} lines={panel.offer.lines} highlight={on} accent={accent} />
          <MessageBlock title={panel.answer.title} lines={panel.answer.lines} highlight={on} accent={accent} />
        </div>
        <Notes lines={[...panel.offer.lines, ...panel.answer.lines]} highlight={on} glossary={glossary} />
        {panel.caption && (
          <p className="mt-2 text-sm" style={{ color: MUTED }}>
            {panel.caption}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="min-w-0">
      <MessageBlock title={panel.title} lines={panel.lines} highlight={on} accent={accent} />
      <Notes lines={panel.lines} highlight={on} glossary={glossary} />
      {panel.caption && (
        <p className="mt-2 text-sm" style={{ color: MUTED }}>
          {panel.caption}
        </p>
      )}
    </div>
  );
}
