import { memo, useMemo, useState } from 'react';
import { PANEL, EDGE, MONO } from '../theme.js';

function GlossaryPanel({ glossary }) {
  const [query, setQuery] = useState('');

  const entries = useMemo(
    () => Object.entries(glossary).sort(([a], [b]) => a.localeCompare(b)),
    [glossary],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      ([key, e]) =>
        key.toLowerCase().includes(q) ||
        e.expansion.toLowerCase().includes(q) ||
        (e.note ?? '').toLowerCase().includes(q),
    );
  }, [entries, query]);

  return (
    <div className="mt-3 rounded p-3" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex items-center justify-between gap-3">
        <h3 style={{ fontFamily: MONO, fontSize: 11, color: '#63799c', letterSpacing: '0.12em' }}>
          ACRONYM GLOSSARY ({entries.length})
        </h3>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search acronyms…"
          className="rounded px-2 py-1 text-xs"
          style={{ background: '#0a1120', border: `1px solid ${EDGE}`, color: '#e6edfa', fontFamily: MONO, width: 180 }}
        />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" style={{ maxHeight: 384, overflowY: 'auto' }}>
        {filtered.map(([key, e]) => (
          <div key={key} className="text-xs" style={{ borderBottom: '1px solid #131d33', paddingBottom: 6 }}>
            <span style={{ fontFamily: MONO, color: '#e6edfa', fontWeight: 700 }}>{key}</span>
            <span style={{ color: '#8ea1bf' }}> — {e.expansion}</span>
            {e.note && <div style={{ color: '#63799c', fontSize: 11 }}>{e.note}</div>}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs" style={{ color: '#63799c' }}>
            No acronyms match "{query}".
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(GlossaryPanel);
