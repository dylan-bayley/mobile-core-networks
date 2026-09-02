export const initPlayer = () => ({ step: 0, progress: 0, done: false, held: false });

/**
 * `tick` advances progress; when a step completes it either moves to the
 * next step (`advance: true`) or holds at progress=1 with `held: true` so the
 * hook can pause playback ("pause after each step" mode). The final step
 * always ends with `done: true`.
 */
export function playerReducer(state, action) {
  switch (action.type) {
    case 'tick': {
      const next = state.progress + action.dt / action.dur;
      if (next < 1) return { ...state, progress: next };
      if (state.step < action.total - 1) {
        if (action.advance === false) return { ...state, progress: 1, held: true };
        return { step: state.step + 1, progress: 0, done: false, held: false };
      }
      return { ...state, progress: 1, done: true, held: false };
    }
    case 'goto':
      return { step: action.step, progress: 0, done: false, held: false };
    case 'restart':
      return initPlayer();
    default:
      return state;
  }
}
