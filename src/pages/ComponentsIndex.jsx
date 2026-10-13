import { useEffect, useState } from 'react';
import { COMPONENTS, componentById } from '../data/components/index.js';
import { hashQuery, urlWithHashQuery } from '../lib/route.js';
import { PANEL, EDGE, MONO, FAINT, MUTED, TEXT, TEXT_2, GEN, ACTIVE_BG, ACTIVE_EDGE, SURFACE } from '../theme.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: '4g', label: '4G EPC' },
  { id: '5g', label: '5G core' },
  { id: 'ims', label: 'IMS' },
  { id: 'ran', label: 'Radio' },
];
const SECTIONS = [
  { gen: 'ran', title: 'Radio access', blurb: 'The base stations the core connects to.' },
  { gen: '4g', title: '4G Evolved Packet Core', blurb: 'TS 23.401: a handful of large nodes, most speaking Diameter or GTP.' },
  { gen: '5g', title: '5G core network functions', blurb: 'TS 23.501: smaller functions offering services to each other over HTTP/2.' },
  { gen: 'ims', title: 'IP Multimedia Subsystem', blurb: 'TS 23.228: the SIP servers that carry voice over 4G and 5G alike.' },
];
const PLANE = { control: 'control plane', user: 'user plane', both: 'control + user' };

const validFilter = (id) => (FILTERS.some((f) => f.id === id) ? id : 'all');

/** Matches a component on its label, expansion or summary, ignoring case. */
const matches = (c, q) => !q || [c.label, c.expansion, c.summary].some((t) => t?.toLowerCase().includes(q));

function Card({ c }) {
  const gen = GEN[c.gen] ?? GEN.ext;
  const peers = (c.analog?.ids ?? []).map(componentById).filter(Boolean);
  return (
    <a
      href={`#/components/${c.id}`}
      className="group flex h-full flex-col rounded p-3.5 hover:brightness-125"
      style={{ background: PANEL, border: `1px solid ${EDGE}`, borderTop: `2px solid ${gen.c}` }}
    >
      <span className="flex items-baseline gap-2">
        <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, color: TEXT }}>{c.label}</span>
        <span className="ml-auto" style={{ fontFamily: MONO, fontSize: 12, color: FAINT }}>
          {PLANE[c.plane] ?? ''}
        </span>
      </span>
      <span className="mt-0.5 text-xs" style={{ color: MUTED }}>
        {c.expansion}
      </span>
      <span className="mt-2 line-clamp-3 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
        {c.summary}
      </span>
      {peers.length > 0 && (
        <span className="mt-auto pt-2.5 text-xs" style={{ fontFamily: MONO, color: FAINT }}>
          {c.gen === 'ims' ? 'with ' : c.gen === '5g' || c.id === 'gnb' ? 'was ' : 'becomes '}
          {peers.map((p) => p.label).join(' + ')}
        </span>
      )}
    </a>
  );
}

export default function ComponentsIndex() {
  // The generation filter lives in the URL (?gen=), so Back from a component
  // page returns to the same filtered list.
  const [filter, setFilter] = useState(() => validFilter(hashQuery().get('gen')));
  const [query, setQuery] = useState('');
  useEffect(() => {
    const url = urlWithHashQuery('/components', filter === 'all' ? null : { gen: filter });
    if (window.location.href !== url) window.history.replaceState(null, '', url);
  }, [filter]);

  const q = query.trim().toLowerCase();
  const sections = SECTIONS.filter((s) => filter === 'all' || s.gen === filter)
    .map((s) => ({ ...s, items: COMPONENTS.filter((c) => (s.gen === '5g' ? c.gen === '5g' || c.gen === 'ext' : c.gen === s.gen) && matches(c, q)) }))
    .filter((s) => s.items.length > 0);
  return (
    <div className="mx-auto max-w-[1500px] px-3 py-5 sm:px-4 sm:py-6">
      <header>
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em', color: FAINT }}>REFERENCE</p>
        <h1 tabIndex={-1} className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: TEXT }}>
          Core network components
        </h1>
        <p className="mt-1 max-w-[70ch] text-sm sm:text-base" style={{ color: TEXT_2 }}>
          One page per network element: what it does according to the specifications, which interfaces it has, what it
          replaced or became, and where to watch it work in the call flows.
        </p>
      </header>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <div role="group" aria-label="Filter components" className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className="min-h-10 rounded px-3 py-1 text-sm sm:min-h-0"
              style={{ background: filter === f.id ? ACTIVE_BG : 'transparent', border: `1px solid ${filter === f.id ? ACTIVE_EDGE : EDGE}`, color: filter === f.id ? TEXT : MUTED }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components…"
          aria-label="Search components by name or description"
          className="min-h-10 w-full rounded px-3 py-1.5 text-sm sm:ml-auto sm:min-h-0 sm:w-64"
          style={{ background: SURFACE, border: `1px solid ${EDGE}`, color: TEXT, fontFamily: MONO }}
        />
      </div>
      {sections.length === 0 && (
        <p className="mt-6 text-sm" style={{ color: MUTED }} role="status">
          No component matches “{query}”.
        </p>
      )}
      {sections.map((s) => {
        const { items } = s;
        const groups = [...new Set(items.map((c) => c.group))];
        return (
          <section key={s.gen} aria-labelledby={`sec-${s.gen}`} className="mt-7">
            <h2 id={`sec-${s.gen}`} className="flex items-center gap-2 text-lg font-semibold" style={{ color: TEXT }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 2, background: GEN[s.gen].c, display: 'inline-block' }} />
              {s.title}
              <span style={{ fontFamily: MONO, fontSize: 12, color: FAINT, fontWeight: 400 }}>{items.length}</span>
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: MUTED }}>
              {s.blurb}
            </p>
            {groups.map((g) => (
              <div key={g} className="mt-3">
                {groups.length > 1 && (
                  <h3 className="mb-1.5" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.1em', color: FAINT }}>
                    {g.toUpperCase()}
                  </h3>
                )}
                <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items
                    .filter((c) => c.group === g)
                    .map((c) => (
                      <li key={c.id}>
                        <Card c={c} />
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
