import { useEffect, useState } from 'react';
import { COMPONENTS, componentById } from '../data/components/index.js';
import { BEST_MAX_TIER, rankComponents } from '../lib/filterComponents.js';
import { hashQuery, urlWithHashQuery } from '../lib/route.js';
import GroupIcon from '../components/GroupIcon.jsx';
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

/** The 5G section also holds the external functions (AF), so that filter includes them. */
const inFilter = (c, filter) => filter === 'all' || c.gen === filter || (filter === '5g' && c.gen === 'ext');

function Card({ c, showGen = false }) {
  const peers = (c.analog?.ids ?? []).map(componentById).filter(Boolean);
  return (
    <a
      href={`#/components/${c.id}`}
      className="group flex h-full flex-col rounded p-3.5 hover:brightness-125"
      style={{ background: PANEL, border: `1px solid ${EDGE}` }}
    >
      <span className="flex items-baseline gap-2">
        <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, color: TEXT }}>{c.label}</span>
        <span className="ml-auto text-xs" style={{ color: FAINT }}>
          {showGen ? `${(GEN[c.gen] ?? GEN.ext).n} · ` : ''}
          {PLANE[c.plane] ?? ''}
        </span>
      </span>
      <span className="mt-0.5 text-xs" style={{ color: MUTED }}>
        {c.expansion}
      </span>
      <span className="mt-2 line-clamp-2 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
        {c.plain?.job ?? c.summary}
      </span>
      {peers.length > 0 && (
        <span className="mt-auto pt-2.5 text-xs" style={{ color: MUTED }}>
          {c.gen === 'ims' ? 'with ' : c.gen === '5g' || c.id === 'gnb' ? 'was ' : 'becomes '}
          {peers.map((p) => p.label).join(' + ')}
        </span>
      )}
    </a>
  );
}

/** Flat list of ranked results; each card keeps its own generation tag in its subtitle. */
function ResultList({ title, items }) {
  return (
    <section aria-label={title} className="mt-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: TEXT }}>
        {title}
        <span className="text-sm tabular-nums" style={{ color: FAINT, fontWeight: 400 }}>{items.length}</span>
      </h2>
      <ul className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(({ component: c }) => (
          <li key={c.id}>
            <Card c={c} showGen />
          </li>
        ))}
      </ul>
    </section>
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
  // With a query, show matches best first in one list. The generation sections
  // would scatter the best match under whichever heading it happens to belong to.
  const ranked = q ? rankComponents(COMPONENTS.filter((c) => inFilter(c, filter)), q) : null;
  const best = ranked?.filter((r) => r.tier <= BEST_MAX_TIER) ?? [];
  const also = ranked?.filter((r) => r.tier > BEST_MAX_TIER) ?? [];
  const sections = ranked
    ? []
    : SECTIONS.filter((s) => filter === 'all' || s.gen === filter)
        .map((s) => ({ ...s, items: COMPONENTS.filter((c) => (s.gen === '5g' ? c.gen === '5g' || c.gen === 'ext' : c.gen === s.gen)) }))
        .filter((s) => s.items.length > 0);
  const openTopResult = (e) => {
    if (e.key === 'Enter' && ranked?.length) window.location.hash = `#/components/${ranked[0].component.id}`;
  };
  return (
    <div className="mx-auto max-w-[1500px] px-3 py-5 sm:px-4 sm:py-6">
      <header>
        <h1 tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: TEXT }}>
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
          onKeyDown={openTopResult}
          placeholder="Search components…"
          aria-label="Search components by name or description"
          className="min-h-10 w-full rounded px-3 py-1.5 text-sm sm:ml-auto sm:min-h-0 sm:w-64"
          style={{ background: SURFACE, border: `1px solid ${EDGE}`, color: TEXT }}
        />
      </div>
      {ranked && (
        <p className="mt-4 text-sm" style={{ color: MUTED }} role="status">
          {ranked.length === 0
            ? `No component matches “${query.trim()}”.`
            : `${ranked.length} ${ranked.length === 1 ? 'component matches' : 'components match'} “${query.trim()}”. Press Enter to open the first.`}
        </p>
      )}
      {best.length > 0 && <ResultList title="Best matches" items={best} />}
      {also.length > 0 && <ResultList title={best.length > 0 ? 'Also mentions it' : 'Mentions it'} items={also} />}
      {sections.map((s) => {
        const { items } = s;
        const groups = [...new Set(items.map((c) => c.group))];
        return (
          <section key={s.gen} aria-labelledby={`sec-${s.gen}`} className="mt-7">
            <h2 id={`sec-${s.gen}`} className="flex items-center gap-2 text-lg font-semibold" style={{ color: TEXT }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 2, background: GEN[s.gen].c, display: 'inline-block' }} />
              {s.title}
              <span className="text-sm tabular-nums" style={{ color: FAINT, fontWeight: 400 }}>{items.length}</span>
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: MUTED }}>
              {s.blurb}
            </p>
            {/* Columns, not grid rows: a short group beside a tall one would leave a gap under it. A group's odd last card spans the row so it leaves no empty slot. */}
            <div className={`mt-3 ${groups.length > 1 ? 'lg:columns-2 lg:gap-x-6' : ''}`}>
              {groups.map((g) => (
                <div key={g} className={`min-w-0 ${groups.length > 1 ? 'mb-4 break-inside-avoid' : ''}`}>
                  {groups.length > 1 && (
                    <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-medium" style={{ color: MUTED }}>
                      <GroupIcon group={g} />
                      {g}
                    </h3>
                  )}
                  <ul
                    className={`grid gap-2.5 sm:grid-cols-2 ${
                      groups.length > 1 ? 'sm:[&>li:last-child:nth-child(odd)]:col-span-2' : 'lg:grid-cols-3 xl:grid-cols-4'
                    }`}
                  >
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
            </div>
          </section>
        );
      })}
    </div>
  );
}
