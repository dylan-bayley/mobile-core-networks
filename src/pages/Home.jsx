import { useEffect, useState } from 'react';
import { LazyMotion, m } from 'motion/react';
import { LESSONS } from '../data/arch/index.js';
import { resolveScenes } from '../engine/arch.js';
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
import { PANEL, EDGE, DIVIDER, RULE, FAINT, MONO, MUTED, TEXT, TEXT_2, GEN, DONE } from '../theme.js';
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

// On first load the hero assembles itself: the edges, the core's user plane,
// then the functions on the service bus. Traffic only starts with the
// finished HERO, so the network "switches on" as the last beat. Same layout
// throughout, so nodes fade and grow in place.
const INTRO = [
  ...resolveScenes(LESSONS['5gc'].diagram, [
    { id: 'i0', layout: 'sba', show: [] },
    { id: 'i1', layout: 'sba', show: ['ue', 'gnb', 'dn'] },
    { id: 'i2', layout: 'sba', add: ['amf', 'smf', 'upf'] },
    { id: 'i3', layout: 'sba', add: ['ausf', 'udm', 'udr', 'pcf', 'chf'] },
    { id: 'i4', layout: 'sba', add: ['nrf', 'nssf', 'scp', 'nef', 'af', 'sepp'] },
  ]),
  HERO,
];
const LAST = INTRO.length - 1;
const INTRO_TWEEN_MS = 700;
const INTRO_STEP_MS = 650;

// Once per page load: coming back to the home page shows the finished core.
let introPlayed = false;

/** The hero's current state. Steps through INTRO while `run`; `skip` jumps to the end. */
function useHeroIntro(run, skip) {
  const [step, setStep] = useState(() => (introPlayed ? LAST : 0));
  useEffect(() => {
    if (step >= LAST) {
      introPlayed = true;
      return undefined;
    }
    if (!run) return undefined;
    const id = setTimeout(() => setStep((s) => s + 1), step === 0 ? 250 : INTRO_STEP_MS);
    return () => clearTimeout(id);
  }, [run, step]);
  return skip ? HERO : INTRO[step];
}

function HeroDiagram() {
  const [ref, width] = useElementWidth();
  const reducedMotion = useReducedMotion();
  const { openTerm, activeKey } = useGlossary();
  // Waits for a measured width, so the intro doesn't run while the diagram is hidden on phones.
  const current = useHeroIntro(width > 0 && !reducedMotion, reducedMotion);
  // Hidden on phones, where it would push the learning path off the first screen.
  return (
    <div ref={ref} className="hidden rounded sm:block" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      {width > 0 && (
        <ArchDiagram
          diagram={LESSONS['5gc'].diagram}
          current={current}
          first
          mode={width >= 720 ? 'wide' : 'narrow'}
          width={width}
          maxHeight={width >= 720 ? 460 : 520}
          reducedMotion={reducedMotion}
          onOpenTerm={openTerm}
          activeKey={activeKey}
          label="The 5G core, service-based view"
          tweenMs={INTRO_TWEEN_MS}
        />
      )}
    </div>
  );
}

const loadMotion = () => import('../lib/motionFeatures.js').then((mod) => mod.default);

const EASE_OUT = [0.22, 1, 0.36, 1];

// The title block: each line rises into place in turn.
const TITLE = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const RISE = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } } };

// The learning-path rail draws itself top to bottom: each node appears, then
// the line grows down to the next one. `custom` is the lesson's index.
const RAIL_STEP = 0.16; // s per lesson
const RAIL_NODE = {
  hidden: { opacity: 0, scale: 0.4 },
  show: (i) => ({ opacity: 1, scale: 1, transition: { delay: i * RAIL_STEP, duration: 0.3, ease: EASE_OUT } }),
};
const RAIL_LINE = {
  hidden: { scaleY: 0 },
  show: (i) => ({ scaleY: 1, transition: { delay: i * RAIL_STEP + 0.12, duration: RAIL_STEP, ease: 'linear' } }),
};
const RAIL_TEXT = {
  hidden: { opacity: 0, x: -8 },
  show: (i) => ({ opacity: 1, x: 0, transition: { delay: i * RAIL_STEP + 0.04, duration: 0.4, ease: EASE_OUT } }),
};

/** Props that play a variant set on entry, or show its end state at once under reduced motion. */
const entrance = (reduced, inView = false) =>
  reduced
    ? { initial: false, animate: 'show' }
    : inView
      ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.25 } }
      : { initial: 'hidden', animate: 'show' };

const TOTAL_MINUTES = LESSON_META.reduce((sum, l) => sum + l.minutes, 0);
const GLOSSARY_COUNT = glossaryEntries(GLOSSARY).length;
const NODE = 22; // px; the rail's node diameter

/** One lesson on the rail: a node, the line down to the next node, and the text. */
function RailItem({ lesson, index, state, scene, isLast }) {
  const done = state === 'done';
  const current = state === 'current';
  const sceneCount = LESSONS[lesson.id].scenes.length;
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center" aria-hidden="true">
        <m.span
          variants={RAIL_NODE}
          custom={index}
          className="flex shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
          style={{
            width: NODE,
            height: NODE,
            background: done ? DONE : current ? GEN['5g'].c : 'transparent',
            border: `2px solid ${done ? DONE : current ? GEN['5g'].c : FAINT}`,
            color: '#06101f',
          }}
        >
          {done ? '✓' : ''}
        </m.span>
        {!isLast && (
          <m.span
            variants={RAIL_LINE}
            custom={index}
            className="my-1 w-0.5 flex-1"
            style={{ background: done ? DONE : RULE, minHeight: 20, transformOrigin: 'top' }}
          />
        )}
      </div>
      <m.div variants={RAIL_TEXT} custom={index} className={`min-w-0 flex-1 ${isLast ? '' : 'pb-5'}`}>
        <a
          href={`#/learn/${lesson.id}`}
          aria-current={current ? 'step' : undefined}
          className="group flex flex-wrap items-baseline gap-x-3 rounded"
        >
          <span className={`font-semibold group-hover:underline ${current ? 'text-lg' : 'text-base'}`} style={{ color: TEXT }}>
            <span className="tabular-nums" style={{ color: MUTED }}>{lesson.n}. </span>
            {lesson.title}
          </span>
          <span className="text-sm tabular-nums" style={{ color: MUTED }}>
            {done ? 'Done' : scene ? `Scene ${scene} of ${sceneCount}` : `${lesson.minutes} min`}
          </span>
        </a>
        {current && (
          <p className="mt-1 max-w-[56ch] text-sm leading-relaxed" style={{ color: TEXT_2 }}>
            {lesson.blurb}
          </p>
        )}
      </m.div>
    </li>
  );
}

function LearningPath({ states, scenes, reduced }) {
  return (
    <section aria-labelledby="path-title">
      <h2 id="path-title" className="text-xl font-semibold" style={{ color: TEXT }}>
        Learning path
      </h2>
      <p className="mt-1 text-sm" style={{ color: MUTED }}>
        {LESSON_META.length} lessons, about {TOTAL_MINUTES} minutes. Each builds on the one before.
      </p>
      <m.ol className="mt-5 list-none" {...entrance(reduced, true)}>
        {LESSON_META.map((l, i) => (
          <RailItem key={l.id} lesson={l} index={i} state={states[l.id]} scene={scenes[l.id]} isLast={i === LESSON_META.length - 1} />
        ))}
      </m.ol>
    </section>
  );
}

const TOOLS = [
  {
    href: '#/flows',
    title: 'Call flows',
    line: `Attach, calls, SMS and more, message by message. ${SESSIONS.length} session types on ${NETWORKS.map((n) => n.label).join(', ')}.`,
  },
  {
    href: '#/components',
    title: 'Components',
    line: `What each network function does, its interfaces, and where it shows up. ${COMPONENTS.length} pages.`,
  },
  {
    href: '#/glossary',
    title: 'Glossary',
    line: `${GLOSSARY_COUNT} terms. Press / to look one up from any page.`,
  },
];

function LookThingsUp() {
  return (
    <section aria-labelledby="tools-title">
      <h2 id="tools-title" className="text-xl font-semibold" style={{ color: TEXT }}>
        Look things up
      </h2>
      <p className="mt-1 text-sm" style={{ color: MUTED }}>
        Use these alongside the lessons, or on their own.
      </p>
      <ul className="mt-5 list-none" style={{ borderTop: `1px solid ${DIVIDER}` }}>
        {TOOLS.map((t) => (
          <li key={t.href} style={{ borderBottom: `1px solid ${DIVIDER}` }}>
            <a href={t.href} className="group block rounded py-3">
              <span className="text-base font-semibold group-hover:underline" style={{ color: TEXT }}>
                {t.title}
              </span>
              <span className="mt-0.5 block max-w-[48ch] text-sm leading-snug" style={{ color: TEXT_2 }}>
                {t.line}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Home() {
  const reduced = useReducedMotion();
  const progress = readProgress();
  const detail = (id) => flowProgress(progress, 'lesson', id);
  const next = LESSON_META.find((l) => !detail(l.id)?.completed) ?? LESSON_META[0];
  const started = LESSON_META.some((l) => detail(l.id));
  const allDone = LESSON_META.every((l) => detail(l.id)?.completed);

  const states = Object.fromEntries(
    LESSON_META.map((l) => [l.id, detail(l.id)?.completed ? 'done' : l.id === next.id && !allDone ? 'current' : 'todo']),
  );
  // Scene progress is only worth showing on the lesson you are part-way through.
  const scenes = Object.fromEntries(
    LESSON_META.map((l) => [l.id, states[l.id] === 'current' && detail(l.id) ? detail(l.id).maxStep + 1 : null]),
  );

  return (
    <LazyMotion features={loadMotion} strict>
      <div className="mx-auto max-w-[1500px] px-3 py-5 sm:px-4 sm:py-8">
        <section className="grid items-center gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <m.div variants={TITLE} {...entrance(reduced)}>
            <m.h1
              variants={RISE}
              tabIndex={-1}
              className="text-5xl leading-none font-semibold tracking-tight sm:text-6xl"
              style={{ color: TEXT }}
            >
              The Mobile Core
            </m.h1>
            <m.p variants={RISE} className="mt-4 max-w-[30ch] text-xl leading-snug font-medium sm:text-2xl" style={{ color: TEXT }}>
              See how the 4G and 5G core actually fit together.
            </m.p>
            <m.p variants={RISE} className="mt-3 max-w-[48ch] text-base leading-relaxed" style={{ color: TEXT_2 }}>
              Short animated lessons, then real call flows one message at a time. Every fact cites the 3GPP specification it comes
              from.
            </m.p>
            <m.div variants={RISE} className="mt-6 flex flex-wrap gap-2">
              <a href={`#/learn/${next.id}`} className="rounded px-4 py-2.5 text-sm font-semibold" style={{ background: GEN['5g'].c, color: '#0b0717' }}>
                {started ? `Continue: ${next.title}` : 'Start with lesson 1'}
              </a>
              <a href="#/flows" className="rounded px-4 py-2.5 text-sm" style={{ border: `1px solid ${EDGE}`, color: TEXT }}>
                Open call flows
              </a>
            </m.div>
          </m.div>
          <HeroDiagram />
        </section>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <LearningPath states={states} scenes={scenes} reduced={reduced} />
          <LookThingsUp />
        </div>

        <details className="mt-12 rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
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
    </LazyMotion>
  );
}
