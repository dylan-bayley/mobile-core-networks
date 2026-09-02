import { useEffect, useMemo, useRef, useState } from 'react';
import { PANEL, EDGE, MONO, MUTED, FAINT, ACTIVE_BG } from '../theme.js';
import { filterGlossary, glossaryEntries } from '../lib/filterGlossary.js';

const LIMIT = 8;

/**
 * Header search over the glossary. Picking a result opens the same
 * GlossaryPopover the inline acronyms use, anchored to the input. `ref` is
 * the input, so the "/" shortcut can focus it.
 */
export default function GlossarySearch({ glossary, onPick, ref }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const wrapRef = useRef(null);
  const entries = useMemo(() => glossaryEntries(glossary), [glossary]);
  const results = useMemo(() => (query.trim() ? filterGlossary(entries, query, LIMIT) : []), [entries, query]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open]);

  const pick = (key) => {
    onPick(key, ref?.current);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      e.currentTarget.blur();
      return;
    }
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(results[cursor][0]);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        ref={ref}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setCursor(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Look up an acronym…  /"
        aria-label="Look up an acronym"
        aria-expanded={open && results.length > 0}
        aria-controls="glossary-search-results"
        role="combobox"
        autoComplete="off"
        className="w-44 rounded px-2 py-1.5 text-xs sm:w-52"
        style={{ background: '#0a1120', border: `1px solid ${EDGE}`, color: '#e6edfa', fontFamily: MONO }}
      />
      {open && results.length > 0 && (
        <ul
          id="glossary-search-results"
          role="listbox"
          className="absolute right-0 z-50 mt-1 w-80 max-w-[90vw] overflow-hidden rounded"
          style={{ background: PANEL, border: `1px solid ${EDGE}`, boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}
        >
          {results.map(([key, e], i) => (
            <li key={key} role="option" aria-selected={i === cursor}>
              <button
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => pick(key)}
                className="flex w-full items-baseline gap-2 px-3 py-1.5 text-left text-xs"
                style={{ background: i === cursor ? ACTIVE_BG : 'transparent', border: 0 }}
              >
                <span style={{ fontFamily: MONO, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>{key}</span>
                <span className="truncate" style={{ color: MUTED }}>
                  {e.expansion}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && results.length === 0 && (
        <div className="absolute right-0 z-50 mt-1 rounded px-3 py-1.5 text-xs" style={{ background: PANEL, border: `1px solid ${EDGE}`, color: FAINT }}>
          No acronym matches "{query}".
        </div>
      )}
    </div>
  );
}
