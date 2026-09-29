import { useEffect, useMemo, useState } from 'react';
import { LESSONS } from '../../data/arch/index.js';
import { GLOSSARY } from '../../data/reference/glossary.js';
import { resolveScenes } from '../../engine/arch.js';
import { durationFor, useStepPlayer } from '../../engine/useStepPlayer.js';
import { useGlossary } from '../../lib/glossaryContext.js';
import { useReducedMotion } from '../../lib/useMediaQuery.js';
import { useElementWidth } from '../../lib/useElementWidth.js';
import { autolinkAcronyms } from '../../lib/autolinkAcronyms.jsx';
import { PANEL, EDGE, MONO, FAINT, MUTED, TEXT, TEXT_2, K, ACTIVE_BG, ACTIVE_EDGE } from '../../theme.js';
import ArchDiagram from './ArchDiagram.jsx';
import Sources from '../SourceChip.jsx';

const btn = { background: PANEL, border: `1px solid ${EDGE}`, color: TEXT, fontFamily: MONO };

/** A short, self-contained animation of one thing a component does, on a lesson diagram (the 5G core by default). */
export default function VignettePlayer({ vignette, highlight }) {
  const lesson = LESSONS[vignette.lesson ?? '5gc'];
  const reducedMotion = useReducedMotion();
  const { openTerm, activeKey } = useGlossary();
  const [ref, width] = useElementWidth();
  const scenes = useMemo(
    () =>
      vignette.steps.map((s) => {
        // Default focus: the component itself plus whoever the message travels between.
        const talking = (s.traffic ?? []).flatMap((t) => t.p.map((x) => x.replace(/^@/, '')));
        const nodes = [...new Set([...(highlight && vignette.show.includes(highlight) ? [highlight] : []), ...talking])];
        return { ...s, layout: vignette.layout ?? 'sba', show: vignette.show, focus: s.focus ?? { nodes } };
      }),
    [vignette, highlight],
  );
  const resolved = useMemo(() => resolveScenes(lesson.diagram, scenes), [lesson, scenes]);
  const steps = useMemo(() => scenes.map((s) => ({ ...s, p: [], dur: durationFor({ d: s.d, p: [] }) + 2 })), [scenes]);
  const [playing, setPlaying] = useState(false);
  const player = useStepPlayer(steps, { playing, setPlaying, speed: 1, pauseEach: false });
  const i = Math.min(player.step, scenes.length - 1);
  const s = scenes[i];

  useEffect(() => {
    player.restart();
    setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vignette]);

  const mode = width >= 720 ? 'wide' : 'narrow';
  return (
    <section aria-labelledby="vignette-title" className="rounded" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
        <h2 id="vignette-title" className="text-base font-semibold" style={{ color: TEXT }}>
          See it work: {vignette.title}
        </h2>
        <span className="ml-auto" style={{ fontFamily: MONO, fontSize: 11, color: FAINT }}>
          {i + 1}/{scenes.length}
        </span>
      </div>
      <div ref={ref} className="px-1">
        {width > 0 && (
          <ArchDiagram
            diagram={lesson.diagram}
            current={resolved[i]}
            first
            mode={mode}
            width={width}
            maxHeight={mode === 'wide' ? 380 : 440}
            reducedMotion={reducedMotion}
            onOpenTerm={openTerm}
            activeKey={activeKey}
            label={vignette.title}
          />
        )}
      </div>
      <div className="px-4 pb-4" aria-live="polite">
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => player.go(Math.max(0, i - 1))} disabled={i === 0} className="min-h-10 rounded px-3 py-1.5 text-sm disabled:opacity-30 sm:min-h-0" style={btn} aria-label="Previous step">
            ←
          </button>
          <button
            type="button"
            onClick={() => {
              if (playing) return setPlaying(false);
              if (player.done) player.restart();
              setPlaying(true);
            }}
            className="min-h-10 rounded px-4 py-1.5 text-sm font-semibold sm:min-h-0"
            style={{ background: playing ? ACTIVE_BG : K.sbi.c, border: `1px solid ${playing ? ACTIVE_EDGE : K.sbi.c}`, color: playing ? TEXT : '#12051a' }}
          >
            {playing ? 'Pause' : player.done ? 'Replay' : 'Play'}
          </button>
          <button type="button" onClick={() => player.go(Math.min(scenes.length - 1, i + 1))} disabled={i === scenes.length - 1} className="min-h-10 rounded px-3 py-1.5 text-sm disabled:opacity-30 sm:min-h-0" style={btn} aria-label="Next step">
            →
          </button>
          <ol className="ml-1 flex gap-1" aria-label="Steps">
            {scenes.map((x, k) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => player.go(k)}
                  aria-label={`Step ${k + 1}: ${x.title}`}
                  aria-current={k === i ? 'step' : undefined}
                  className="block h-2.5 w-6 rounded-sm"
                  style={{ background: k === i ? K.sbi.c : k < i ? `${K.sbi.c}77` : '#1b2740', border: 0 }}
                />
              </li>
            ))}
          </ol>
        </div>
        <h3 className="mt-3 text-sm font-semibold" style={{ color: TEXT }}>
          {i + 1}. {s.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: TEXT_2 }}>
          {autolinkAcronyms(s.d, GLOSSARY, { activeKey, onOpen: openTerm })}
        </p>
        <Sources cites={s.cites} className="mt-2" />
        <p className="mt-2 text-xs" style={{ color: MUTED }}>
          A simplified sketch of the procedure. See the cited clauses for every parameter and branch.
        </p>
      </div>
    </section>
  );
}
