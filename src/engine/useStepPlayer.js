import { useCallback, useEffect, useReducer, useRef } from 'react';
import { initPlayer, playerReducer } from './playerReducer.js';

const durationFor = (step) => (step.rt ? 3.4 : 2.2) + (step.p.length - 2) * 0.5;

/**
 * Drives step-by-step playback of a flow: advances `progress` (0-1) along the
 * current step every animation frame, auto-advancing to the next step once a
 * step completes, and stopping (playing -> false) once the flow is done.
 */
export function useStepPlayer(steps, { playing, setPlaying, speed }) {
  const [state, dispatch] = useReducer(playerReducer, undefined, initPlayer);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    if (!playing) {
      lastRef.current = null;
      return undefined;
    }
    const step = steps[state.step];
    const dur = (step.dur ?? durationFor(step)) / speed;

    const tick = (now) => {
      if (lastRef.current == null) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      dispatch({ type: 'tick', dt, dur, total: steps.length });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speed, state.step, steps]);

  useEffect(() => {
    if (state.done) setPlaying(false);
  }, [state.done, setPlaying]);

  const go = useCallback((step) => dispatch({ type: 'goto', step }), []);
  const restart = useCallback(() => dispatch({ type: 'restart' }), []);

  return { step: state.step, progress: state.progress, done: state.done, go, restart };
}
