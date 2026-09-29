import { GLOSSARY } from '../../data/reference/glossary.js';
import { PANEL, EDGE, MONO, MUTED, FAINT, TEXT, BG, GEN } from '../../theme.js';
import GlossarySearch from '../GlossarySearch.jsx';

const NAV = [
  { id: 'learn', href: '#/', label: 'Learn', icon: 'M4 5h7v14H4zM13 5h7v14h-7z' },
  { id: 'components', href: '#/components', label: 'Components', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
  { id: 'flows', href: '#/flows', label: 'Flows', icon: 'M4 7h12M12 3l4 4-4 4M20 17H8M12 13l-4 4 4 4' },
  { id: 'glossary', href: '#/glossary', label: 'Glossary', icon: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11' },
];

/** Three linked nodes: the site mark. */
function Mark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <path d="M6 19 L13 7 L20 19 Z" fill="none" stroke={EDGE} strokeWidth="1.6" />
      <circle cx="13" cy="7" r="3.4" fill={GEN['5g'].c} />
      <circle cx="6" cy="19" r="3.4" fill={GEN['4g'].c} />
      <circle cx="20" cy="19" r="3.4" fill="#3fd6a0" />
    </svg>
  );
}

export default function SiteHeader({ section, searchRef, onPickTerm, onShortcuts }) {
  return (
    <header className="sticky top-0 z-40" style={{ background: `${BG}f2`, borderBottom: `1px solid ${EDGE}`, backdropFilter: 'blur(6px)' }}>
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-2 sm:px-4">
        <a href="#/" className="flex items-center gap-2 rounded" aria-label="Mobile Core — home">
          <Mark />
          <span className="hidden flex-col leading-tight min-[400px]:flex">
            <span className="text-sm font-semibold tracking-tight" style={{ color: TEXT }}>
              Mobile Core
            </span>
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', color: FAINT }}>EPC · 5GC · SA/NSA</span>
          </span>
        </a>

        <nav aria-label="Sections" className="ml-4 hidden sm:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => {
              const on = section === n.id;
              return (
                <li key={n.id}>
                  <a
                    href={n.href}
                    aria-current={on ? 'page' : undefined}
                    className="block rounded px-3 py-1.5 text-sm"
                    style={{
                      color: on ? TEXT : MUTED,
                      background: on ? PANEL : 'transparent',
                      boxShadow: on ? `inset 0 -2px 0 ${GEN['5g'].c}` : 'none',
                    }}
                  >
                    {n.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <GlossarySearch glossary={GLOSSARY} onPick={onPickTerm} ref={searchRef} />
          <button
            type="button"
            onClick={onShortcuts}
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
            className="hidden rounded px-2 py-1.5 text-xs md:block"
            style={{ background: PANEL, border: `1px solid ${EDGE}`, color: MUTED, fontFamily: MONO }}
          >
            ⌨ keys
          </button>
        </div>
      </div>
    </header>
  );
}

/** Phone navigation: a bottom tab bar within thumb reach. */
export function MobileTabBar({ section }) {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 sm:hidden"
      style={{ background: `${BG}f7`, borderTop: `1px solid ${EDGE}`, paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-4">
        {NAV.map((n) => {
          const on = section === n.id;
          return (
            <li key={n.id}>
              <a
                href={n.href}
                aria-current={on ? 'page' : undefined}
                className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px]"
                style={{ color: on ? TEXT : MUTED }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke={on ? GEN['5g'].c : 'currentColor'} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
                  <path d={n.icon} />
                </svg>
                {n.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
