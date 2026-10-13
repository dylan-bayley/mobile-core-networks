import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LESSONS } from '../data/arch/index.js';
import { LESSON_META } from '../data/arch/lessons.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { layoutFor } from '../engine/arch.js';
import { durationFor, useStepPlayer, validSpeed } from '../engine/useStepPlayer.js';
import { useGlossary } from '../lib/glossaryContext.js';
import { useMediaQuery, useReducedMotion } from '../lib/useMediaQuery.js';
import { useElementWidth, useViewportHeight } from '../lib/useElementWidth.js';
import { hashQuery, urlWithHashQuery } from '../lib/route.js';
import { readStored, store } from '../lib/storage.js';
import { readProgress, writeProgress, recordStep, recordQuiz, markCompleted, flowProgress } from '../lib/progress.js';
import { ignoreShortcut } from '../lib/keys.js';
import { autolinkAcronyms } from '../lib/autolinkAcronyms.jsx';
import { K, PANEL, EDGE, MONO, FAINT, MUTED, TEXT, TEXT_2, ACTIVE_BG, ACTIVE_EDGE, GEN } from '../theme.js';
import ArchDiagram from '../components/arch/ArchDiagram.jsx';
import QuickCheck from '../components/arch/QuickCheck.jsx';
import Transport from '../components/Transport.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Sources from '../components/SourceChip.jsx';
import DataTable from '../components/DataTable.jsx';

/** Home/End only drive the player when focus is in it (or nowhere in particular). */
const inPlayer = (e) => !(e.target instanceof HTMLElement) || e.target === document.body || !!e.target.closest('[data-player]');

const WIDE_MIN = 720; // below this container width the portrait layouts are used
const REPS = [
  { id: 'sba', label: 'Service-based' },
  { id: 'refpoint', label: 'Reference points' },
];

/** Lesson n of N, as a row of chips that doubles as navigation. */
export function LessonStepper({ current }) {
  const progress = readProgress();
  return (
    <nav aria-label="Lessons" className="overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1.5">
        {LESSON_META.map((l) => {
          const on = l.id === current;
          const done = flowProgress(progress, 'lesson', l.id)?.completed;
          return (
            <li key={l.id}>
              <a
                href={`#/learn/${l.id}`}
                aria-current={on ? 'page' : undefined}
                className="flex min-h-10 items-center gap-1.5 rounded px-2.5 py-1 text-xs sm:min-h-0"
                style={{ background: on ? ACTIVE_BG : 'transparent', border: `1px solid ${on ? ACTIVE_EDGE : EDGE}`, color: on ? TEXT : MUTED }}
              >
                <span style={{ fontFamily: MONO, color: done ? K.user.c : FAINT }}>{done ? '✓' : l.n}</span>
                {l.short}
              </a>
            </li>
          );
        })}
        <li>
          <a href="#/flows" className="flex min-h-10 items-center gap-1.5 rounded px-2.5 py-1 text-xs sm:min-h-0" style={{ border: `1px dashed ${EDGE}`, color: MUTED }}>
            <span style={{ fontFamily: MONO, color: FAINT }}>→</span>
            Call flows
          </a>
        </li>
      </ol>
    </nav>
  );
}

/** Two diagrams of the same lesson side by side (or a toggle between them on narrow screens). */
function CompareDiagrams({ lesson, scenes, labels, reducedMotion }) {
  const [ref, width] = useElementWidth();
  const [pick, setPick] = useState(0);
  const { openTerm, activeKey } = useGlossary();
  const side = width >= 900;
  const items = scenes.map((id) => {
    const i = lesson.scenes.findIndex((s) => s.id === id);
    return { i, r: lesson.resolved[i] };
  });
  const colW = side ? (width - 12) / 2 : width;
  const mode = colW >= WIDE_MIN ? 'wide' : 'narrow';
  const shown = side ? items : [items[pick]];
  return (
    <section className="rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold" style={{ color: TEXT }}>
          Side by side
        </h2>
        {!side && (
          <div role="group" aria-label="Which architecture" className="ml-auto flex gap-1">
            {items.map((it, k) => (
              <button
                key={it.r.scene.id}
                type="button"
                aria-pressed={pick === k}
                onClick={() => setPick(k)}
                className="min-h-10 rounded px-2.5 py-1 text-xs sm:min-h-0"
                style={{ background: pick === k ? ACTIVE_BG : 'transparent', border: `1px solid ${pick === k ? ACTIVE_EDGE : EDGE}`, color: pick === k ? TEXT : MUTED }}
              >
                {labels[k]}
              </button>
            ))}
          </div>
        )}
      </div>
      <div ref={ref} className={`mt-3 grid gap-3 ${side ? 'grid-cols-2' : ''}`}>
        {shown.map((it) => (
          <figure key={it.r.scene.id} className="rounded" style={{ border: `1px solid ${EDGE}` }}>
            <figcaption className="px-3 pt-2 text-sm font-medium" style={{ color: TEXT }}>
              {it.r.scene.title}
            </figcaption>
            {/* Wait for the measured width, or the first frame draws the narrow layout. */}
            {width > 0 && (
              <ArchDiagram
                diagram={lesson.diagram}
                current={it.r}
                first
                mode={mode}
                width={colW}
                maxHeight={mode === 'narrow' ? 520 : 420}
                reducedMotion={reducedMotion}
                onOpenTerm={openTerm}
                activeKey={activeKey}
              />
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

export default function LessonPage({ lessonId, query }) {
  const lesson = LESSONS[lessonId];
  const reducedMotion = useReducedMotion();
  const isWide = useMediaQuery('(min-width: 1280px)'); // Tailwind `xl`: the scene list sits beside the player
  const { openTerm, activeKey } = useGlossary();
  const [boxRef, boxWidth] = useElementWidth();
  const vh = useViewportHeight();

  const initialScene = useRef((query ?? hashQuery()).get('scene')).current;

  const steps = useMemo(
    () => lesson.scenes.map((s) => ({ ...s, p: [], dur: s.dur ?? durationFor({ d: s.d, p: [] }) + 1.4 })),
    [lesson],
  );
  const [playing, setPlaying] = useState(() => !reducedMotion && !initialScene);
  const [speed, setSpeed] = useState(() => validSpeed(readStored('mcn.speed', 1)));
  const [pauseEach, setPauseEach] = useState(() => readStored('mcn.pauseEach', false));
  const [rep, setRep] = useState(null); // representation override for sba/refpoint scenes
  const [progress, setProgress] = useState(() => readProgress());
  // Start on a deep-linked scene rather than jump to it in an effect: an
  // effect would first render scene 0 and write ?scene=<first> into the URL,
  // which the hashchange that follows a Back would then read back.
  const player = useStepPlayer(steps, {
    playing,
    setPlaying,
    speed,
    pauseEach,
    initialStep: Math.max(0, lesson.scenes.findIndex((s) => s.id === initialScene)),
  });

  useEffect(() => store('mcn.speed', speed), [speed]);
  useEffect(() => store('mcn.pauseEach', pauseEach), [pauseEach]);
  useEffect(() => writeProgress(progress), [progress]);
  useEffect(() => {
    if (reducedMotion) setPlaying(false);
  }, [reducedMotion]);

  // Follow ?scene= when back/forward or a pasted link changes it while this
  // lesson is open. (App remounts the page per lesson, so nothing leaks
  // between lessons; the first scene comes from initialStep above.) Keyed on
  // the route's query and skipped when already there, so StrictMode's
  // double-invoked effects are harmless.
  const sceneParam = (query ?? hashQuery()).get('scene');
  useEffect(() => {
    const i = lesson.scenes.findIndex((s) => s.id === sceneParam);
    if (i < 0 || i === player.step) return;
    player.go(i);
    setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const index = Math.min(player.step, lesson.scenes.length - 1);
  const scene = lesson.scenes[index];
  const last = lesson.scenes.length - 1;
  const accent = K[scene.k ?? 'control'].c;

  // Reaching a scene records how far the learner got; the lesson only counts
  // as complete once its last scene has played through (or the quick check
  // is done), not when End or a deep link lands on it.
  useEffect(() => {
    setProgress((p) => recordStep(p, 'lesson', lessonId, index, lesson.scenes.length, { completes: false }));
  }, [lessonId, index, lesson.scenes.length]);
  useEffect(() => {
    if (player.done) setProgress((p) => markCompleted(p, 'lesson', lessonId, lesson.scenes.length));
  }, [player.done, lessonId, lesson.scenes.length]);

  // Keep ?scene= in the URL so any scene can be linked to.
  useEffect(() => {
    const url = urlWithHashQuery(`/learn/${lessonId}`, { scene: scene.id });
    if (window.location.href !== url) window.history.replaceState(null, '', url);
  }, [lessonId, scene.id]);

  const hasReps = !!(lesson.diagram.layouts.sba && lesson.diagram.layouts.refpoint);
  const sceneRep = scene.layout === 'sba' || scene.layout === 'refpoint' ? scene.layout : null;
  const current = useMemo(() => {
    const r = lesson.resolved[index];
    if (!rep || !sceneRep || rep === sceneRep) return r;
    const layout = layoutFor(lesson.diagram, rep);
    const visible = new Set([...r.visible].filter((id) => layout.wide[id]));
    return { ...r, layoutName: rep, layout, visible };
  }, [lesson, index, rep, sceneRep]);
  const shownRep = sceneRep ? rep ?? sceneRep : null;

  // Depend on the player's stable functions, not the player object, which
  // changes every frame while playing (and would re-bind the key handler).
  const { go: playerGo, restart: playerRestart, done: playerDone, held: playerHeld } = player;
  const go = useCallback((i) => playerGo(Math.max(0, Math.min(last, i))), [playerGo, last]);
  const togglePlay = useCallback(() => {
    if (playing) return setPlaying(false);
    if (playerDone) playerRestart();
    else if (playerHeld && index < last) playerGo(index + 1);
    setPlaying(true);
  }, [playing, playerDone, playerHeld, playerRestart, playerGo, index, last]);

  useEffect(() => {
    const isButton = (e) => e.target instanceof HTMLElement && e.target.closest('button, [role="button"], a');
    const onKey = (e) => {
      if (ignoreShortcut(e)) return;
      if (e.code === 'Space') {
        if (isButton(e)) return;
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        go(index + 1);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        go(index - 1);
      } else if ((e.code === 'Home' || e.code === 'End') && inPlayer(e)) {
        // Elsewhere on this long page Home/End keep scrolling it.
        e.preventDefault();
        go(e.code === 'Home' ? 0 : last);
      } else if (e.key === 'm' && hasReps && sceneRep) {
        setRep((r) => ((r ?? sceneRep) === 'sba' ? 'refpoint' : 'sba'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, last, togglePlay, hasReps, sceneRep]);

  const meta = LESSON_META.find((l) => l.id === lessonId);
  const next = LESSON_META.find((l) => l.n === meta.n + 1);
  const prev = LESSON_META.find((l) => l.n === meta.n - 1);
  const mode = boxWidth >= WIDE_MIN ? 'wide' : 'narrow';
  const maxH = mode === 'wide' ? Math.max(360, vh - 300) : Math.round(vh * 0.72);
  const bestQuiz = flowProgress(progress, 'lesson', lessonId)?.bestQuiz ?? null;
  const onScore = (score, total) =>
    setProgress((p) => markCompleted(recordQuiz(p, 'lesson', lessonId, score, total), 'lesson', lessonId, lesson.scenes.length));

  const caption = (
    <section className="rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}`, borderLeft: `3px solid ${accent}` }}>
      <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.1em', color: FAINT }}>
        SCENE {index + 1} OF {lesson.scenes.length}
      </p>
      <h2 className="mt-1 text-lg font-semibold leading-snug" style={{ color: TEXT }}>
        {scene.title}
      </h2>
      <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed sm:text-base" style={{ color: TEXT_2 }}>
        {autolinkAcronyms(scene.d, GLOSSARY, { activeKey, onOpen: openTerm })}
      </p>
      <Sources cites={scene.cites} className="mt-3" />
      {/* At the end of the last scene, offer the next step right here rather
          than leave it at the bottom of a long page. */}
      {player.done && index === last && (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 text-sm" style={{ borderColor: EDGE, color: TEXT_2 }}>
          That’s the lesson.
          <a href={next ? `#/learn/${next.id}` : '#/flows'} className="rounded px-3 py-1.5 font-semibold" style={{ background: GEN['5g'].c, color: '#0b0717' }}>
            {next ? `Next: ${next.n}. ${next.title} →` : 'Next: watch real call flows →'}
          </a>
          <a href="#check-title" onClick={(e) => { e.preventDefault(); document.getElementById('check-title')?.scrollIntoView({ block: 'start' }); }} className="underline" style={{ color: MUTED }}>
            or try the quick check
          </a>
        </p>
      )}
    </section>
  );

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
      <LessonStepper current={lessonId} />
      {/* Announce only the scene's number and title as it changes; the full
          caption is there to read, and reading it all out every few seconds
          during autoplay would talk over itself. */}
      <p className="sr-only" aria-live="polite">
        Scene {index + 1} of {lesson.scenes.length}: {scene.title}
      </p>

      <header className="mt-4 mb-3">
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: FAINT }}>
          LESSON {meta.n} OF {LESSON_META.length} · ABOUT {meta.minutes} MIN
        </p>
        <h1 tabIndex={-1} className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: TEXT }}>
          {lesson.title}
        </h1>
        <p className="mt-1 max-w-[70ch] text-sm sm:text-base" style={{ color: TEXT_2 }}>
          {lesson.blurb}
        </p>
      </header>

      <div data-player className="xl:grid xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start xl:gap-4">
        <div className="min-w-0">
          <div className="rounded" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
            {hasReps && (
            <div className="flex flex-wrap items-center gap-2 px-3 pt-2.5 pb-1">
              <div role="group" aria-label="Diagram style (m)" className="ml-auto flex gap-1">
                  {REPS.map((r) => {
                    const on = shownRep === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={!sceneRep}
                        aria-pressed={on}
                        onClick={() => setRep(r.id)}
                        title={sceneRep ? 'Switch how the 5G core is drawn (m)' : 'This scene uses its own layout'}
                        className="min-h-9 rounded px-2.5 py-1 text-xs disabled:opacity-40 sm:min-h-0"
                        style={{ background: on ? ACTIVE_BG : 'transparent', border: `1px solid ${on ? ACTIVE_EDGE : EDGE}`, color: on ? TEXT : MUTED, fontFamily: MONO }}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
            </div>
            )}
            <div ref={boxRef} className="px-1 pt-2 pb-2">
              {boxWidth > 0 && (
                <ArchDiagram
                  diagram={lesson.diagram}
                  current={current}
                  first={index === 0}
                  mode={mode}
                  width={boxWidth}
                  maxHeight={maxH}
                  reducedMotion={reducedMotion}
                  onOpenTerm={openTerm}
                  activeKey={activeKey}
                  label={lesson.title}
                />
              )}
            </div>
            <Legend diagram={lesson.diagram} />
          </div>

          <Transport
            step={index}
            stepsLength={lesson.scenes.length}
            progress={player.progress}
            playing={playing}
            held={player.held}
            remaining={player.remaining}
            onTogglePlay={togglePlay}
            onPrev={() => go(index - 1)}
            onNext={() => go(index + 1)}
            onRestart={() => {
              player.restart();
              setPlaying(!reducedMotion);
            }}
            speed={speed}
            onSpeed={setSpeed}
            pauseEach={pauseEach}
            onTogglePauseEach={() => setPauseEach((p) => !p)}
            accent={accent}
          />
          <ProgressBar steps={steps.map((s) => ({ ...s, t: s.title, k: s.k ?? 'control' }))} step={index} progress={player.progress} accent={accent} onGo={go} />

          <div className="mt-3 xl:hidden">{caption}</div>
        </div>

        <aside className="mt-3 flex flex-col gap-3 xl:sticky xl:top-16 xl:mt-0">
          <div className="hidden xl:block">{caption}</div>
          {(() => {
            const sceneNav = (
            <nav aria-label="Scenes in this lesson" className="rounded p-2" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
              <ol className="grid gap-0.5">
                {lesson.scenes.map((s, i) => {
                  const on = i === index;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => go(i)}
                        aria-current={on ? 'step' : undefined}
                        className="flex w-full items-baseline gap-2 rounded px-2 py-1.5 text-left text-sm"
                        style={{ background: on ? ACTIVE_BG : 'transparent', border: 0, color: on ? TEXT : i < index ? TEXT_2 : MUTED }}
                      >
                        <span style={{ fontFamily: MONO, fontSize: 12, color: on ? K[s.k ?? 'control'].c : FAINT, minWidth: 18 }}>{String(i + 1).padStart(2, '0')}</span>
                        {s.title}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
            );
            return isWide ? (
              sceneNav
            ) : (
              <details>
                <summary className="cursor-pointer rounded px-3 py-2 text-sm" style={{ background: PANEL, border: `1px solid ${EDGE}`, color: MUTED }}>
                  All {lesson.scenes.length} scenes
                </summary>
                <div className="mt-2">{sceneNav}</div>
              </details>
            );
          })()}
        </aside>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {lesson.compare && (
          <div className="lg:col-span-2">
            <CompareDiagrams lesson={lesson} scenes={lesson.compare.scenes} labels={lesson.compare.labels} reducedMotion={reducedMotion} />
          </div>
        )}
        {lesson.compare && (
          <div className="lg:col-span-2">
            <DataTable title={lesson.compare.title} columns={['', ...lesson.compare.columns]} rows={lesson.compare.rows} cites={lesson.compare.cites} />
          </div>
        )}
        {lesson.options && (
          <details className="lg:col-span-2">
            <summary className="cursor-pointer rounded px-3 py-2 text-sm" style={{ background: PANEL, border: `1px solid ${EDGE}`, color: MUTED }}>
              All the deployment options, for reference
            </summary>
            <div className="mt-2">
            <DataTable
              title="All the deployment options, for reference"
              caption="Operators mostly deployed option 3 (NSA) first, then option 2 (SA). The other options are defined but less common."
              columns={lesson.options.columns}
              rows={lesson.options.rows}
              cites={lesson.options.cites}
            />
            </div>
          </details>
        )}
        <section className="rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
          <h2 className="text-base font-semibold" style={{ color: TEXT }}>
            Key takeaways
          </h2>
          <ul className="mt-2 grid gap-2">
            {lesson.takeaways.map((t) => (
              <li key={t} className="flex gap-2 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
                <span aria-hidden="true" style={{ color: GEN['5g'].c }}>▸</span>
                <span>{autolinkAcronyms(t, GLOSSARY, { activeKey, onOpen: openTerm })}</span>
              </li>
            ))}
          </ul>
          {lesson.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {lesson.links.map((l) => (
                <a key={l.href} href={l.href} className="rounded px-3 py-1.5 text-sm" style={{ border: `1px solid ${EDGE}`, color: TEXT }}>
                  {l.label} →
                </a>
              ))}
            </div>
          )}
        </section>
        <QuickCheck key={lessonId} questions={lesson.check} best={bestQuiz} onScore={onScore} />
      </div>

      <nav aria-label="Lesson navigation" className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {prev ? (
          <a href={`#/learn/${prev.id}`} className="rounded px-4 py-2 text-sm" style={{ border: `1px solid ${EDGE}`, color: MUTED }}>
            ← {prev.n}. {prev.title}
          </a>
        ) : (
          <a href="#/" className="rounded px-4 py-2 text-sm" style={{ border: `1px solid ${EDGE}`, color: MUTED }}>
            ← Overview
          </a>
        )}
        {next ? (
          <a href={`#/learn/${next.id}`} className="rounded px-4 py-2 text-sm font-semibold" style={{ background: GEN['5g'].c, color: '#0b0717' }}>
            Next: {next.n}. {next.title} →
          </a>
        ) : (
          <a href="#/flows" className="rounded px-4 py-2 text-sm font-semibold" style={{ background: GEN['5g'].c, color: '#0b0717' }}>
            Next: watch real call flows →
          </a>
        )}
      </nav>
    </div>
  );
}

/** Key for a lesson diagram: the generation outline colours and protocol line colours it actually uses. */
const LEGEND_BOXES = [
  ['4G EPC', '4g'],
  ['5G core', '5g'],
  ['IMS', 'ims'],
  ['Radio', 'ran'],
];
const LEGEND_LINES = [
  ['User plane', 'user'],
  ['Control', 'control'],
  ['Service-based (HTTP/2)', 'sbi'],
  ['Diameter', 'diameter'],
  ['SIP', 'ims'],
  ['Voice media', 'media'],
];
function Legend({ diagram }) {
  const gens = new Set(Object.values(diagram.nodes).map((n) => n.gen));
  const kinds = new Set(diagram.links.map((l) => l.k));
  const items = [
    ...LEGEND_BOXES.filter(([, g]) => gens.has(g)).map(([label, g]) => [label, GEN[g].c, 'box']),
    ...LEGEND_LINES.filter(([, k]) => kinds.has(k)).map(([label, k]) => [label, K[k].c, 'line']),
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-2.5" aria-label="Diagram key">
      {items.map(([label, c, kind]) => (
        <li key={label} className="flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 12, color: MUTED }}>
          {kind === 'box' ? (
            <span aria-hidden="true" style={{ width: 12, height: 9, border: `1.5px solid ${c}`, borderRadius: 2, display: 'inline-block' }} />
          ) : (
            <span aria-hidden="true" style={{ width: 14, height: 2, background: c, display: 'inline-block' }} />
          )}
          {label}
        </li>
      ))}
    </ul>
  );
}
