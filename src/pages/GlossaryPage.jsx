import { useEffect, useMemo, useState } from 'react';
import { GLOSSARY } from '../data/reference/glossary.js';
import { componentForTerm } from '../data/components/index.js';
import { filterGlossary, glossaryEntries } from '../lib/filterGlossary.js';
import { EDGE, DIVIDER, MONO, MUTED, TEXT, TEXT_2, K, ACTIVE_BG, ACTIVE_EDGE, BG, SURFACE } from '../theme.js';

const idFor = (key) => `term-${key.replace(/[^A-Za-z0-9]+/g, '-')}`;

/** The whole acronym glossary on one page; `#/glossary/<TERM>` jumps to and highlights a term. */
export default function GlossaryPage({ term }) {
  const [query, setQuery] = useState('');
  const entries = useMemo(() => glossaryEntries(GLOSSARY), []);
  const filtered = useMemo(() => filterGlossary(entries, query), [entries, query]);

  // Deferred, so it runs after the app's scroll-to-top for a new page
  // (parent effects run after this child's) rather than being undone by it.
  useEffect(() => {
    if (!term) return undefined;
    const t = setTimeout(() => document.getElementById(idFor(term))?.scrollIntoView({ block: 'center' }));
    return () => clearTimeout(t);
  }, [term]);

  const letters = useMemo(() => [...new Set(filtered.map(([k]) => k[0].toUpperCase()))], [filtered]);
  // Browsing groups the list under letter headings; a search shows one flat result list.
  const groups = useMemo(() => {
    if (query.trim()) return [[null, filtered]];
    const byLetter = new Map();
    for (const item of filtered) {
      const l = item[0][0].toUpperCase();
      if (!byLetter.has(l)) byLetter.set(l, []);
      byLetter.get(l).push(item);
    }
    return [...byLetter];
  }, [filtered, query]);

  return (
    <div className="mx-auto max-w-[1100px] px-3 py-5 sm:px-4 sm:py-6">
      <header>
        <h1 tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: TEXT }}>
          Acronym glossary
        </h1>
        <p className="mt-1 max-w-[70ch] text-sm sm:text-base" style={{ color: TEXT_2 }}>
          {entries.length} terms used across the lessons and call flows. Every term has its own link.
        </p>
      </header>
      <div className="sticky z-10 mt-4 py-2" style={{ top: 'var(--header-h, 53px)', background: `${BG}ee` }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by acronym, name or description…"
          aria-label="Filter the glossary"
          className="w-full rounded px-3 py-2 text-sm"
          style={{ background: SURFACE, border: `1px solid ${EDGE}`, color: TEXT }}
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
      {groups.map(([letter, items]) => (
        <section key={letter ?? 'results'} aria-label={letter ? `Terms starting with ${letter}` : 'Matching terms'} className="mt-4">
          {letter && (
            <h2 className="pb-1 text-lg font-semibold tabular-nums" style={{ color: TEXT, borderBottom: `1px solid ${EDGE}` }}>
              {letter}
            </h2>
          )}
          <dl>
            {items.map(([key, e]) => {
              const on = key === term;
              const comp = componentForTerm(key);
              return (
                <div
                  key={key}
                  id={idFor(key)}
                  className="scroll-mt-32 rounded px-3 py-2.5"
                  style={{
                    borderBottom: `1px solid ${DIVIDER}`,
                    background: on ? ACTIVE_BG : 'transparent',
                    boxShadow: on ? `0 0 0 1px ${ACTIVE_EDGE}` : 'none',
                    // Rows far off screen aren't painted until scrolled near, but stay in the page for links and find.
                    contentVisibility: 'auto',
                    containIntrinsicSize: 'auto 64px',
                  }}
                >
                  <dt className="flex flex-wrap items-baseline gap-x-2">
                    <a href={`#/glossary/${encodeURIComponent(key)}`} className="hover:underline" style={{ fontFamily: MONO, fontWeight: 700, color: TEXT }}>
                      {key}
                    </a>
                    <span className="text-sm" style={{ color: TEXT_2 }}>
                      {e.expansion}
                    </span>
                    {e.kind && K[e.kind] && (
                      <span className="rounded px-1.5 text-xs" style={{ color: K[e.kind].c, border: `1px solid ${K[e.kind].c}55` }}>
                        {K[e.kind].n}
                      </span>
                    )}
                    {comp && (
                      <a href={`#/components/${comp}`} className="ml-auto text-xs underline" style={{ color: MUTED }}>
                        Component page
                      </a>
                    )}
                  </dt>
                  {e.note && (
                    <dd className="mt-0.5 max-w-[80ch] text-sm" style={{ color: MUTED }}>
                      {e.note}
                    </dd>
                  )}
                  {e.inPractice && (
                    <dd className="mt-0.5 max-w-[80ch] text-sm" style={{ color: MUTED }}>
                      <span style={{ color: TEXT_2 }}>In practice: </span>
                      {e.inPractice}
                    </dd>
                  )}
                </div>
              );
            })}
          </dl>
        </section>
      ))}
      {filtered.length === 0 && (
        <p className="mt-4 text-sm" style={{ color: MUTED }} role="status">
          Nothing matches “{query}”.
        </p>
      )}
    </div>
  );
}
