import { LESSONS } from '../data/arch/index.js';
import { LESSON_META } from '../data/arch/lessons.js';
import { SOURCES } from '../data/reference/sources.js';
import { COMPONENTS } from '../data/components/index.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { glossaryEntries } from '../lib/filterGlossary.js';
import { NETWORKS, SESSIONS } from '../data/index.js';
import { readProgress, flowProgress } from '../lib/progress.js';
import { useGlossary } from '../lib/glossaryContext.js';
import { useReducedMotion } from '../lib/useMediaQuery.js';
import { useElementWidth } from '../lib/useElementWidth.js';
import { PANEL, EDGE, MONO, FAINT, MUTED, TEXT, TEXT_2, GEN, K } from '../theme.js';
import ArchDiagram from '../components/arch/ArchDiagram.jsx';

const HERO_SCENE = 'sba';

// The hero shows the whole service-based core with user traffic flowing too.
// Built once: ArchDiagram re-animates whenever this object changes identity.
const HERO = (() => {
  const lesson = LESSONS['5gc'];
  const base = lesson.resolved[lesson.scenes.findIndex((s) => s.id === HERO_SCENE)];
  const traffic = [...(base.scene.traffic ?? []), { p: ['ue', 'gnb', 'upf', 'dn'], k: 'user', n: 4 }];
  return { ...base, scene: { ...base.scene, traffic } };
})();

function HeroDiagram() {
  const [ref, width] = useElementWidth();
  const reducedMotion = useReducedMotion();
  const { openTerm, activeKey } = useGlossary();
  // Hidden on phones, where it would push the learning path off the first screen.
  return (
    <div ref={ref} className="hidden rounded sm:block" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      {width > 0 && (
        <ArchDiagram
          diagram={LESSONS['5gc'].diagram}
          current={HERO}
          first
          mode={width >= 720 ? 'wide' : 'narrow'}
          width={width}
          maxHeight={width >= 720 ? 460 : 520}
          reducedMotion={reducedMotion}
          onOpenTerm={openTerm}
          activeKey={activeKey}
          label="The 5G core, service-based view"
        />
      )}
    </div>
  );
}

const TOTAL_MINUTES = LESSON_META.reduce((sum, l) => sum + l.minutes, 0);
const GLOSSARY_COUNT = glossaryEntries(GLOSSARY).length;

function SectionCard({ href, label, title, line, stat }) {
  return (
    <li>
      <a
        href={href}
        className="flex h-full flex-col rounded p-4 transition-colors hover:brightness-125"
        style={{ background: PANEL, border: `1px solid ${EDGE}` }}
      >
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: FAINT }}>{label}</span>
        <span className="mt-1.5 text-base font-semibold" style={{ color: TEXT }}>
          {title}
        </span>
        <span className="mt-1 text-sm leading-snug" style={{ color: TEXT_2 }}>
          {line}
        </span>
        <span className="mt-auto pt-3 text-xs" style={{ fontFamily: MONO, color: MUTED }}>
          {stat}
        </span>
      </a>
    </li>
  );
}

export default function Home() {
  const progress = readProgress();
  const status = (id) => {
    const p = flowProgress(progress, 'lesson', id);
    if (!p) return null;
    if (p.completed) return 'done';
    return `${p.maxStep + 1}/${p.total}`;
  };
  const next = LESSON_META.find((l) => status(l.id) !== 'done') ?? LESSON_META[0];
  const started = LESSON_META.some((l) => status(l.id));

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-5 sm:px-4 sm:py-8">
      <section className="grid items-center gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', color: FAINT }}>MOBILE CORE NETWORKS, ANIMATED</p>
          <h1 tabIndex={-1} className="mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl" style={{ color: TEXT }}>
            See how the 4G and 5G core actually fit together.
          </h1>
          <p className="mt-3 max-w-[48ch] text-base leading-relaxed" style={{ color: TEXT_2 }}>
            Short animated lessons, then real call flows one message at a time. Every fact cites the 3GPP specification it comes from.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={`#/learn/${next.id}`} className="rounded px-4 py-2.5 text-sm font-semibold" style={{ background: GEN['5g'].c, color: '#0b0717' }}>
              {started ? `Continue: ${next.title}` : 'Start with lesson 1'} →
            </a>
            <a href="#/flows" className="rounded px-4 py-2.5 text-sm" style={{ border: `1px solid ${EDGE}`, color: TEXT }}>
              Jump to call flows
            </a>
          </div>
        </div>
        <HeroDiagram />
      </section>

      <section aria-labelledby="whats-here-title" className="mt-10">
        <h2 id="whats-here-title" className="text-lg font-semibold" style={{ color: TEXT }}>
          What’s here
        </h2>
        <ul className="mt-3 grid list-none gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SectionCard
            href={`#/learn/${LESSON_META[0].id}`}
            label="LEARN"
            title="Animated lessons"
            line="Build up the 4G and 5G core, step by step. No telecoms background needed."
            stat={`${LESSON_META.length} lessons · about ${TOTAL_MINUTES} min`}
          />
          <SectionCard
            href="#/components"
            label="COMPONENTS"
            title="Every network function"
            line="What each box does, its interfaces, and where it shows up."
            stat={`${COMPONENTS.length} pages`}
          />
          <SectionCard
            href="#/flows"
            label="CALL FLOWS"
            title="Real procedures"
            line="Attach, calls, SMS and more, played message by message with quizzes."
            stat={`${SESSIONS.length} session types · ${NETWORKS.map((n) => n.short).join(' / ')}`}
          />
          <SectionCard
            href="#/glossary"
            label="GLOSSARY"
            title="Acronyms, explained"
            line="Click any underlined acronym or diagram box for a definition."
            stat={`${GLOSSARY_COUNT} terms`}
          />
        </ul>
      </section>

      <section aria-labelledby="path-title" className="mt-10">
        <h2 id="path-title" className="text-lg font-semibold" style={{ color: TEXT }}>
          The learning path
        </h2>
        <ol className="mt-3 grid list-none gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {LESSON_META.map((l) => {
            const s = status(l.id);
            return (
              <li key={l.id}>
                <a
                  href={`#/learn/${l.id}`}
                  title={l.blurb}
                  className="flex h-full flex-col rounded px-3 py-2.5 transition-colors hover:brightness-125"
                  style={{ background: PANEL, border: `1px solid ${s === 'done' ? `${K.user.c}66` : EDGE}` }}
                >
                  <span className="flex items-center gap-2" style={{ fontFamily: MONO, fontSize: 12, color: FAINT }}>
                    {l.n} · {l.minutes} MIN
                    {s && (
                      <span className="ml-auto" style={{ color: s === 'done' ? K.user.c : MUTED }}>
                        {s === 'done' ? '✓ done' : `scene ${s}`}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 text-sm font-semibold" style={{ color: TEXT }}>
                    {l.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-xs" style={{ color: FAINT }}>
          Then practise with the <a href="#/flows" className="underline">call flows</a>.
        </p>
      </section>

      <details className="mt-10 rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
        <summary className="cursor-pointer text-sm font-semibold" style={{ color: TEXT }}>
          Sources and further reading
        </summary>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
          Lessons and component pages cite the 3GPP specifications (the free ETSI copies) and the GSMA migration white paper,
          down to the clause. Vendor product names only appear in labelled “in practice” notes.
        </p>
        <ul className="mt-3 grid list-none gap-1 text-sm sm:grid-cols-2">
          {Object.values(SOURCES).map((s) => (
            <li key={s.doc + s.title}>
              <a href={s.url} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: MUTED }}>
                <span style={{ fontFamily: MONO, color: TEXT }}>{s.doc}</span> {s.title}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
          For a deeper, book-length treatment of the same material, the Architecture Overview chapter of{' '}
          <cite>The Core Network for 5G Advanced</cite> by Stefan Rommer et al. (Academic Press, 2nd edition, 2025) is an
          excellent companion. The diagrams here are original; the specifications above are the primary source.
        </p>
      </details>
    </div>
  );
}
