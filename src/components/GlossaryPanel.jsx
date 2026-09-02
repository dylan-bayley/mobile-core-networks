import { memo, useMemo, useState } from 'react';
import { PANEL, EDGE, MONO, MUTED, FAINT } from '../theme.js';
import { filterGlossary, glossaryEntries } from '../lib/filterGlossary.js';

function GlossaryPanel({ glossary }) {
  const [query, setQuery] = useState('');
  const entries = useMemo(() => glossaryEntries(glossary), [glossary]);
  const filtered = useMemo(() => filterGlossary(entries, query), [entries, query]);

  return (
    <div className="mt-3 rounded p-3" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex items-center justify-between gap-3">
        <h3 style={{ fontFamily: MONO, fontSize: 11, color: FAINT, letterSpacing: '0.12em' }}>
          ACRONYM GLOSSARY ({entries.length})
        </h3>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search acronyms…"
          aria-label="Search the glossary"
          className="rounded px-2 py-1 text-xs"
          style={{ background: '#0a1120', border: `1px solid ${EDGE}`, color: '#e6edfa', fontFamily: MONO, width: 180 }}
        />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" style={{ maxHeight: 384, overflowY: 'auto' }}>
        {filtered.map(([key, e]) => (
          <div key={key} className="text-xs" style={{ borderBottom: '1px solid #131d33', paddingBottom: 6 }}>
            <span style={{ fontFamily: MONO, color: '#e6edfa', fontWeight: 700 }}>{key}</span>
            <span style={{ color: MUTED }}> — {e.expansion}</span>
            {e.note && <div style={{ color: MUTED, fontSize: 11 }}>{e.note}</div>}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs" style={{ color: MUTED }}>
            No acronyms match "{query}".
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(GlossaryPanel);
