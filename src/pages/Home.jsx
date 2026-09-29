import { LESSONS } from '../data/arch/index.js';
import { LESSON_META } from '../data/arch/lessons.js';
import { SOURCES } from '../data/reference/sources.js';
import { COMPONENTS } from '../data/components/index.js';
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
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', color: FAINT }}>MOBILE CORE NETWORKS, ANIMATED</p>
          <h1 tabIndex={-1} className="mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl" style={{ color: TEXT }}>
            See how the 4G and 5G core actually fit together.
          </h1>
          <p className="mt-3 max-w-[60ch] text-base leading-relaxed" style={{ color: TEXT_2 }}>
            Four short animated lessons build up the 4G Evolved Packet Core, the 5G core, how the two work together, and what
            really differs between 5G standalone and non-standalone. Then watch real procedures, one message at a time. Every
            fact links to the 3GPP specification it comes from.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={`#/learn/${next.id}`} className="rounded px-4 py-2.5 text-sm font-semibold" style={{ background: GEN['5g'].c, color: '#0b0717' }}>
              {started ? `Continue: ${next.title}` : 'Start with lesson 1'} →
            </a>
            <a href="#/components" className="rounded px-4 py-2.5 text-sm" style={{ border: `1px solid ${EDGE}`, color: TEXT }}>
              Browse the {COMPONENTS.length} components
            </a>
          </div>
          <p className="mt-3 text-xs" style={{ color: FAINT }}>
            New to this? No telecoms background needed. Click any underlined acronym or any box on a diagram for a definition.
          </p>
        </div>
        <HeroDiagram />
      </section>

      <section aria-labelledby="path-title" className="mt-10">
        <h2 id="path-title" className="text-lg font-semibold" style={{ color: TEXT }}>
          The learning path
        </h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {LESSON_META.map((l) => {
            const s = status(l.id);
            return (
              <li key={l.id}>
                <a
                  href={`#/learn/${l.id}`}
                  className="flex h-full flex-col rounded p-4 transition-colors hover:brightness-125"
                  style={{ background: PANEL, border: `1px solid ${s === 'done' ? `${K.user.c}66` : EDGE}` }}
                >
                  <span className="flex items-center gap-2" style={{ fontFamily: MONO, fontSize: 11, color: FAINT }}>
                    LESSON {l.n} · {l.minutes} MIN
                    {s && (
                      <span className="ml-auto" style={{ color: s === 'done' ? K.user.c : MUTED }}>
                        {s === 'done' ? '✓ done' : `scene ${s}`}
                      </span>
                    )}
                  </span>
                  <span className="mt-1.5 text-base font-semibold" style={{ color: TEXT }}>
                    {l.title}
                  </span>
                  <span className="mt-1 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
                    {l.blurb}
                  </span>
                  <span className="mt-auto pt-3 text-xs" style={{ color: MUTED }}>
                    {LESSONS[l.id].scenes.length} animated scenes · quick check
                  </span>
                </a>
              </li>
            );
          })}
          <li>
            <a href="#/flows" className="flex h-full flex-col rounded p-4 hover:brightness-125" style={{ background: PANEL, border: `1px dashed ${EDGE}` }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: FAINT }}>THEN · PRACTICE</span>
              <span className="mt-1.5 text-base font-semibold" style={{ color: TEXT }}>
                Call flows
              </span>
              <span className="mt-1 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
                Attach, calls, SMS, idle mode and EPS fallback, played message by message on 4G, NSA and SA.
              </span>
              <span className="mt-auto pt-3 text-xs" style={{ color: MUTED }}>
                Topology and sequence views · quizzes
              </span>
            </a>
          </li>
        </ol>
      </section>

      <section aria-labelledby="sources-title" className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
          <h2 id="sources-title" className="text-base font-semibold" style={{ color: TEXT }}>
            Where the facts come from
          </h2>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
            Lessons and component pages cite the 3GPP specifications (the free ETSI copies) and the GSMA migration white paper,
            down to the clause. Vendor product names only appear in labelled “in practice” notes.
          </p>
          <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
            {Object.values(SOURCES).map((s) => (
              <li key={s.doc + s.title}>
                <a href={s.url} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: MUTED }}>
                  <span style={{ fontFamily: MONO, color: TEXT }}>{s.doc}</span> {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
          <h2 className="text-base font-semibold" style={{ color: TEXT }}>
            Going further
          </h2>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
            For a deeper, book-length treatment of the same material, the Architecture Overview chapter of{' '}
            <cite>The Core Network for 5G Advanced</cite> by Stefan Rommer et al. (Academic Press, 2nd edition, 2025) is an
            excellent companion. The diagrams here are original; the specifications above are the primary source.
          </p>
          <p className="mt-3 text-sm" style={{ color: TEXT_2 }}>
            Shortcuts: <kbd style={{ fontFamily: MONO }}>/</kbd> search acronyms · <kbd style={{ fontFamily: MONO }}>?</kbd> all keys ·{' '}
            <kbd style={{ fontFamily: MONO }}>g</kbd> then <kbd style={{ fontFamily: MONO }}>c</kbd> components.
          </p>
        </div>
      </section>
    </div>
  );
}
