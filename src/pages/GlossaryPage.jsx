import { useEffect, useMemo, useRef, useState } from 'react';
import { GLOSSARY } from '../data/reference/glossary.js';
import { componentForTerm } from '../data/components/index.js';
import { filterGlossary, glossaryEntries } from '../lib/filterGlossary.js';
import { PANEL, EDGE, MONO, FAINT, MUTED, TEXT, TEXT_2, K, ACTIVE_EDGE } from '../theme.js';

const idFor = (key) => `term-${key.replace(/[^A-Za-z0-9]+/g, '-')}`;

/** The whole acronym glossary on one page; `#/glossary/<TERM>` jumps to and highlights a term. */
export default function GlossaryPage({ term }) {
  const [query, setQuery] = useState('');
  const entries = useMemo(() => glossaryEntries(GLOSSARY), []);
  const filtered = useMemo(() => filterGlossary(entries, query), [entries, query]);
  const listRef = useRef(null);

  useEffect(() => {
    if (!term) return;
    const el = document.getElementById(idFor(term));
    el?.scrollIntoView({ block: 'center' });
  }, [term]);

  const letters = useMemo(() => [...new Set(filtered.map(([k]) => k[0].toUpperCase()))], [filtered]);

  return (
    <div className="mx-auto max-w-[1100px] px-3 py-5 sm:px-4 sm:py-6">
      <header>
        <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', color: FAINT }}>REFERENCE</p>
        <h1 tabIndex={-1} className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: TEXT }}>
          Acronym glossary
        </h1>
        <p className="mt-1 max-w-[70ch] text-sm sm:text-base" style={{ color: TEXT_2 }}>
          {entries.length} terms used across the lessons and call flows. Every term has its own link.
        </p>
      </header>
      <div className="sticky top-[53px] z-10 mt-4 py-2" style={{ background: '#070b14ee' }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by acronym, name or description…"
          aria-label="Filter the glossary"
          className="w-full rounded px-3 py-2 text-sm"
          style={{ background: '#0a1120', border: `1px solid ${EDGE}`, color: TEXT, fontFamily: MONO }}
        />
        {!query && (
          <nav aria-label="Jump to letter" className="mt-2 flex flex-wrap gap-1">
            {letters.map((l) => (
              <a key={l} href={`#/glossary/${encodeURIComponent(filtered.find(([k]) => k[0].toUpperCase() === l)[0])}`} className="rounded px-1.5 py-0.5 text-xs" style={{ fontFamily: MONO, color: MUTED, border: `1px solid ${EDGE}` }}>
                {l}
              </a>
            ))}
          </nav>
        )}
      </div>
      <dl ref={listRef} className="mt-2 grid gap-2">
        {filtered.map(([key, e]) => {
          const on = key === term;
          const comp = componentForTerm(key);
          return (
            <div
              key={key}
              id={idFor(key)}
              className="scroll-mt-32 rounded px-3 py-2.5"
              style={{ background: PANEL, border: `1px solid ${on ? ACTIVE_EDGE : EDGE}`, boxShadow: on ? `0 0 0 1px ${ACTIVE_EDGE}` : 'none' }}
            >
              <dt className="flex flex-wrap items-baseline gap-x-2">
                <a href={`#/glossary/${encodeURIComponent(key)}`} className="hover:underline" style={{ fontFamily: MONO, fontWeight: 700, color: TEXT }}>
                  {key}
                </a>
                <span className="text-sm" style={{ color: TEXT_2 }}>
                  {e.expansion}
                </span>
                {e.kind && K[e.kind] && (
                  <span className="rounded px-1.5" style={{ fontFamily: MONO, fontSize: 10, color: K[e.kind].c, border: `1px solid ${K[e.kind].c}55` }}>
                    {K[e.kind].n}
                  </span>
                )}
                {comp && (
                  <a href={`#/components/${comp}`} className="ml-auto text-xs underline" style={{ color: MUTED }}>
                    component page →
                  </a>
                )}
              </dt>
              {e.note && (
                <dd className="mt-0.5 text-sm" style={{ color: MUTED }}>
                  {e.note}
                </dd>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm" style={{ color: MUTED }}>
            Nothing matches “{query}”.
          </p>
        )}
      </dl>
    </div>
  );
}
