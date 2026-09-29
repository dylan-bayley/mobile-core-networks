import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRoute } from './lib/useRoute.js';
import { GlossaryContext } from './lib/glossaryContext.js';
import { GLOSSARY } from './data/reference/glossary.js';
import { lessonMeta } from './data/arch/lessons.js';
import { componentById } from './data/components/index.js';
import { BG, SANS } from './theme.js';
import SiteHeader, { MobileTabBar } from './components/shell/SiteHeader.jsx';
import GlossaryPopover from './components/GlossaryPopover.jsx';
import ShortcutsHelp from './components/ShortcutsHelp.jsx';
import Home from './pages/Home.jsx';
import LessonPage from './pages/LessonPage.jsx';
import ComponentsIndex from './pages/ComponentsIndex.jsx';
import ComponentPage from './pages/ComponentPage.jsx';
import GlossaryPage from './pages/GlossaryPage.jsx';
import NotFound from './pages/NotFound.jsx';
import Explorer from './components/Explorer.jsx';

const SITE = 'Mobile Core';

/** Resolves the hash route to a page element, its section (for the nav) and a document title. */
function resolvePage(segments) {
  const [section, id] = segments;
  if (!section) return { key: 'home', section: 'learn', title: `${SITE} — learn the 4G and 5G core`, el: <Home /> };
  if (section === 'learn') {
    const meta = id && lessonMeta(id);
    if (meta) return { key: `learn/${id}`, section: 'learn', title: `${meta.title} · ${SITE}`, el: <LessonPage lessonId={id} /> };
    return { key: 'home', section: 'learn', title: SITE, el: <Home /> };
  }
  if (section === 'components') {
    if (!id) return { key: 'components', section: 'components', title: `Components · ${SITE}`, el: <ComponentsIndex /> };
    const c = componentById(id);
    if (c) return { key: `components/${id}`, section: 'components', title: `${c.label} · ${SITE}`, el: <ComponentPage component={c} /> };
  }
  if (section === 'flows') return { key: 'flows', section: 'flows', title: `Call flows · ${SITE}`, el: <Explorer /> };
  if (section === 'glossary') return { key: 'glossary', section: 'glossary', title: `Glossary · ${SITE}`, el: <GlossaryPage term={id ?? null} /> };
  return { key: 'missing', section: null, title: `Not found · ${SITE}`, el: <NotFound /> };
}

export default function App() {
  const route = useRoute();
  const page = useMemo(() => resolvePage(route.segments), [route.segments]);
  const mainRef = useRef(null);
  const searchRef = useRef(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [glossaryTarget, setGlossaryTarget] = useState(null);
  const [diagram, setDiagram] = useState(null);

  const openTerm = useCallback((key, anchorEl) => setGlossaryTarget({ key, anchorEl }), []);
  const closeTerm = useCallback(() => setGlossaryTarget(null), []);
  const glossaryApi = useMemo(
    () => ({ openTerm, closeTerm, activeKey: glossaryTarget?.key ?? null, setDiagram }),
    [openTerm, closeTerm, glossaryTarget],
  );

  // New page: title, scroll to top, and move focus to its heading so screen
  // readers announce where they landed. Skipped on first load so the
  // browser's own focus handling is left alone.
  const firstPage = useRef(true);
  useEffect(() => {
    document.title = page.title;
    setGlossaryTarget(null);
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.querySelector('h1')?.focus({ preventScroll: true });
  }, [page.key, page.title]);

  // Site-wide keys: "/" search, "?" help, and "g" then a letter to jump sections.
  const chord = useRef(0);
  useEffect(() => {
    const isTyping = (e) => e.target instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable);
    const JUMPS = { h: '#/', l: '#/', c: '#/components', f: '#/flows', g: '#/glossary' };
    const onKeyDown = (e) => {
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (chord.current && Date.now() - chord.current < 1200 && JUMPS[e.key]) {
        e.preventDefault();
        chord.current = 0;
        route.navigate(JUMPS[e.key]);
        return;
      }
      chord.current = 0;
      if (e.key === 'g') chord.current = Date.now();
      else if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [route]);

  return (
    <GlossaryContext.Provider value={glossaryApi}>
      <div style={{ background: BG, fontFamily: SANS, color: '#dbe4f3', minHeight: '100%' }} className="flex min-h-full flex-col">
        <a href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.querySelector('h1')?.focus(); }} className="skip-link">
          Skip to content
        </a>
        <SiteHeader section={page.section} searchRef={searchRef} onPickTerm={openTerm} onShortcuts={() => setShortcutsOpen(true)} />
        <main id="main" ref={mainRef} className="flex-1 pb-20 sm:pb-6">
          {page.el}
        </main>
        <MobileTabBar section={page.section} />
      </div>
      <GlossaryPopover
        target={glossaryTarget}
        glossary={GLOSSARY}
        onClose={closeTerm}
        topology={diagram?.topology ?? null}
        onShowNode={diagram?.onShowNode ?? null}
      />
      <ShortcutsHelp open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </GlossaryContext.Provider>
  );
}
