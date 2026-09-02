import { useCallback, useEffect, useReducer, useRef } from 'react';
import { initPlayer, playerReducer } from './playerReducer.js';

/** Fraction of a step's duration during which the message dot travels; the rest is hold time for reading. */
export const DOT_PHASE = 0.4;

const WORDS_PER_MINUTE = 200;
const MIN_DURATION = 3;
const MAX_DURATION = 20;

/**
 * Seconds a step should stay on screen at 1x: an explicit `dur` wins,
 * otherwise a reading-time model (words / 200 wpm) plus a small base for the
 * dot animation, clamped so trivial steps aren't over in a blink and long
 * ones don't stall the flow.
 */
export function durationFor(step) {
  if (step.dur) return step.dur;
  const words = (step.d ?? '').trim().split(/\s+/).filter(Boolean).length;
  const reading = (words / WORDS_PER_MINUTE) * 60;
  const base = 1.6 + (step.rt ? 1 : 0) + Math.max(0, step.p.length - 2) * 0.3;
  return Math.min(MAX_DURATION, Math.max(MIN_DURATION, base + reading));
}

/**
 * Drives step-by-step playback of a flow: advances `progress` (0-1) along the
 * current step every animation frame, auto-advancing to the next step once a
 * step completes (unless `pauseEach`), and stopping (playing -> false) once
 * the flow is done or a step is held.
 */
export function useStepPlayer(steps, { playing, setPlaying, speed, pauseEach = false }) {
  const [state, dispatch] = useReducer(playerReducer, undefined, initPlayer);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  // `steps` can change identity (switching network/session) in the same
  // render that resets `state.step` via restart() — but that dispatch hasn't
  // committed yet, so state.step may briefly index past the end of a
  // shorter `steps` array. Clamp everywhere below rather than trust it.
  const clampedStep = Math.min(state.step, steps.length - 1);
  const dur = durationFor(steps[clampedStep]) / speed;

  useEffect(() => {
    if (!playing) {
      lastRef.current = null;
      return undefined;
    }
    const tick = (now) => {
      if (lastRef.current == null) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      dispatch({ type: 'tick', dt, dur, total: steps.length, advance: !pauseEach });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, dur, clampedStep, steps, pauseEach]);

  useEffect(() => {
    if (state.done || state.held) setPlaying(false);
  }, [state.done, state.held, setPlaying]);

  const go = useCallback((step) => dispatch({ type: 'goto', step }), []);
  const restart = useCallback(() => dispatch({ type: 'restart' }), []);

  return {
    step: clampedStep,
    progress: state.progress,
    done: state.done,
    held: state.held,
    dur,
    remaining: Math.max(0, Math.ceil((1 - state.progress) * dur)),
    go,
    restart,
  };
}
