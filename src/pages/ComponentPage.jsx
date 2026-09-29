import { useEffect, useMemo, useState } from 'react';
import { LESSONS } from '../data/arch/index.js';
import { COMPONENTS, VIGNETTES, componentById, flowAppearances } from '../data/components/index.js';
import { sessionForFlow } from '../data/index.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { linksFor } from '../engine/arch.js';
import { hrefFor } from '../lib/route.js';
import { useGlossary } from '../lib/glossaryContext.js';
import { useReducedMotion } from '../lib/useMediaQuery.js';
import { useElementWidth } from '../lib/useElementWidth.js';
import { autolinkAcronyms } from '../lib/autolinkAcronyms.jsx';
import { PANEL, EDGE, MONO, FAINT, MUTED, TEXT, TEXT_2, GEN, K } from '../theme.js';
import ArchDiagram from '../components/arch/ArchDiagram.jsx';
import VignettePlayer from '../components/arch/VignettePlayer.jsx';
import Sources from '../components/SourceChip.jsx';

const PLANE = { control: 'Control plane', user: 'User plane', both: 'Control + user plane' };
const CYCLE_MS = 1800;

/** The component on its lesson diagram, with its reference points lighting up one at a time. */
function ComponentDiagram({ component }) {
  const { lesson: lessonId, scene: sceneId, node } = component.diagram;
  const lesson = LESSONS[lessonId];
  const base = lesson.resolved[lesson.scenes.findIndex((s) => s.id === sceneId)];
  const reducedMotion = useReducedMotion();
  const { openTerm, activeKey } = useGlossary();
  const [ref, width] = useElementWidth();
  const own = useMemo(
    () => linksFor(lesson.diagram, base.layoutName, base.visible).filter((l) => l.a === node || l.b === node),
    [lesson, base, node],
  );
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reducedMotion || own.length < 2) return undefined;
    const t = setInterval(() => setTick((x) => x + 1), CYCLE_MS);
    return () => clearInterval(t);
  }, [reducedMotion, own.length]);

  const lit = own.length ? own[tick % own.length] : null;
  const current = useMemo(() => {
    const focus = { nodes: [node], links: reducedMotion ? own.map((l) => l.l) : lit ? [lit.l] : [] };
    const traffic = !reducedMotion && lit ? [{ p: lit.a === node ? [lit.a, lit.b] : [lit.b, lit.a], k: lit.k, n: 1, speed: 0.5 }] : [];
    return { ...base, added: [], scene: { ...base.scene, focus, traffic } };
  }, [base, node, lit, own, reducedMotion]);

  const mode = width >= 720 ? 'wide' : 'narrow';
  return (
    <figure className="rounded" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div ref={ref} className="px-1 pt-1">
        {width > 0 && (
          <ArchDiagram
            diagram={lesson.diagram}
            current={current}
            first
            mode={mode}
            width={width}
            maxHeight={mode === 'wide' ? 400 : 460}
            reducedMotion={reducedMotion}
            onOpenTerm={openTerm}
            activeKey={activeKey}
            label={`${component.label} in the ${lesson.diagram.title}`}
          />
        )}
      </div>
      <figcaption className="flex flex-wrap items-center gap-2 px-3 pb-2.5 text-xs" style={{ color: MUTED }}>
        <span>
          From lesson {lesson.n}: <a href={hrefFor(`/learn/${lessonId}`, { scene: sceneId })} className="underline" style={{ color: TEXT_2 }}>{lesson.title}</a>
        </span>
        {lit && !reducedMotion && (
          <span className="ml-auto" style={{ fontFamily: MONO, color: K[lit.k].c }}>
            {lit.l}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

function Panel({ title, children, className = '' }) {
  return (
    <section className={`rounded p-4 ${className}`} style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <h2 className="text-base font-semibold" style={{ color: TEXT }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function flowHref(a) {
  const session = sessionForFlow(a.flowId);
  const q = { net: a.net, session: session?.id ?? a.flowId };
  if (session && session.id !== a.flowId) q.variant = a.flowId;
  q.step = a.first.id;
  return hrefFor('/flows', q);
}

export default function ComponentPage({ component: c }) {
  const { openTerm, activeKey } = useGlossary();
  const gen = GEN[c.gen] ?? GEN.ext;
  const peers = (c.analog?.ids ?? []).map(componentById).filter(Boolean);
  const flows = useMemo(() => flowAppearances(c), [c]);
  const vignette = c.vignette ? VIGNETTES[c.vignette] : null;
  const link = (t) => autolinkAcronyms(t, GLOSSARY, { activeKey, onOpen: openTerm });
  const idx = COMPONENTS.findIndex((x) => x.id === c.id);
  const prev = COMPONENTS[idx - 1];
  const next = COMPONENTS[idx + 1];

  return (
    <div className="mx-auto max-w-[1300px] px-3 py-5 sm:px-4 sm:py-6">
      <nav aria-label="Breadcrumb" className="text-xs" style={{ color: MUTED }}>
        <a href="#/components" className="hover:underline">
          Components
        </a>{' '}
        / <span style={{ color: TEXT_2 }}>{c.label}</span>
      </nav>

      <header className="mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded px-2 py-0.5 text-xs" style={{ border: `1px solid ${gen.c}`, color: gen.c, fontFamily: MONO }}>
            {gen.n}
          </span>
          <span className="rounded px-2 py-0.5 text-xs" style={{ border: `1px solid ${EDGE}`, color: MUTED, fontFamily: MONO }}>
            {PLANE[c.plane]}
          </span>
          <span className="rounded px-2 py-0.5 text-xs" style={{ border: `1px solid ${EDGE}`, color: MUTED, fontFamily: MONO }}>
            {c.group}
          </span>
        </div>
        <h1 tabIndex={-1} className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: TEXT, fontFamily: MONO }}>
          {c.label}
        </h1>
        <p className="mt-0.5 text-base" style={{ color: MUTED }}>
          {c.expansion}
        </p>
        <p className="mt-3 max-w-[70ch] text-base leading-relaxed sm:text-lg" style={{ color: TEXT_2 }}>
          {link(c.summary)}
        </p>
      </header>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          {c.diagram ? (
            <ComponentDiagram component={c} />
          ) : (
            <p className="rounded p-3 text-sm" style={{ border: `1px dashed ${EDGE}`, color: MUTED }}>
              The {c.label} isn’t drawn in the architecture lessons, which, like the TS 23.501 overview figures, leave out some
              specialised functions for clarity.
            </p>
          )}

          <Panel title="Interfaces">
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {['Interface', 'Connects to', 'Protocol'].map((h) => (
                      <th key={h} scope="col" className="px-2 py-1.5" style={{ fontFamily: MONO, fontSize: 11, color: FAINT, borderBottom: `1px solid ${EDGE}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.interfaces.map((i) => (
                    <tr key={i.name + i.peer}>
                      <th scope="row" className="px-2 py-1.5 font-medium" style={{ fontFamily: MONO, color: TEXT, borderBottom: '1px solid #131d33' }}>
                        {link(i.name)}
                      </th>
                      <td className="px-2 py-1.5" style={{ color: TEXT_2, borderBottom: '1px solid #131d33' }}>
                        {link(i.peer)}
                      </td>
                      <td className="px-2 py-1.5" style={{ color: MUTED, borderBottom: '1px solid #131d33' }}>
                        {link(i.protocol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {c.services?.length > 0 && (
              <>
                <h3 className="mt-4 text-sm font-semibold" style={{ color: TEXT }}>
                  Services it offers (SBI)
                </h3>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {c.services.map((s) => (
                    <li key={s} className="rounded px-2 py-0.5" style={{ fontFamily: MONO, fontSize: 12, color: K.sbi.c, border: `1px solid ${K.sbi.c}55` }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>

          {vignette && <VignettePlayer vignette={vignette} highlight={c.id} />}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Panel title="What it does">
            <ul className="mt-2 grid gap-2">
              {c.does.map((d) => (
                <li key={d} className="flex gap-2 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
                  <span aria-hidden="true" style={{ color: gen.c }}>▸</span>
                  <span>{link(d)}</span>
                </li>
              ))}
            </ul>
            <Sources cites={c.sources} className="mt-4" />
          </Panel>

          {c.analog && (
            <Panel title={c.gen === '4g' || c.id === 'enb' ? 'In 5G' : 'In 4G'}>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
                {link(c.analog.text)}
              </p>
              {peers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {peers.map((p) => (
                    <a
                      key={p.id}
                      href={`#/components/${p.id}`}
                      className="rounded px-2.5 py-1 text-sm"
                      style={{ fontFamily: MONO, border: `1px solid ${(GEN[p.gen] ?? GEN.ext).c}`, color: TEXT }}
                    >
                      {p.label} →
                    </a>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {flows.length > 0 && (
            <Panel title="Watch it in the call flows">
              <ul className="mt-2 grid gap-1">
                {flows.map((a) => (
                  <li key={`${a.net}/${a.flowId}`}>
                    <a href={flowHref(a)} className="flex items-baseline gap-2 rounded px-1 py-1 text-sm hover:underline" style={{ color: TEXT_2 }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: FAINT, minWidth: 34 }}>{a.network.label.split(' ')[0]}</span>
                      <span className="min-w-0 flex-1">{a.flowLabel}</span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>
                        {a.count} step{a.count > 1 ? 's' : ''}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {c.inPractice && (
            <Panel title="In practice">
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
                {link(c.inPractice)}
              </p>
              <p className="mt-1.5 text-xs" style={{ color: FAINT }}>
                A deployment note, not a specification requirement.
              </p>
            </Panel>
          )}
        </div>
      </div>

      <nav aria-label="Other components" className="mt-6 flex flex-wrap justify-between gap-3">
        {prev ? (
          <a href={`#/components/${prev.id}`} className="rounded px-4 py-2 text-sm" style={{ border: `1px solid ${EDGE}`, color: MUTED }}>
            ← {prev.label}
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a href={`#/components/${next.id}`} className="rounded px-4 py-2 text-sm" style={{ border: `1px solid ${EDGE}`, color: TEXT }}>
            {next.label} →
          </a>
        )}
      </nav>
    </div>
  );
}
