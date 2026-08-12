export const initPlayer = () => ({ step: 0, progress: 0, done: false });

export function playerReducer(state, action) {
  switch (action.type) {
    case 'tick': {
      const next = state.progress + action.dt / action.dur;
      if (next < 1) return { ...state, progress: next };
      if (state.step < action.total - 1) return { step: state.step + 1, progress: 0, done: false };
      return { ...state, progress: 1, done: true };
    }
    case 'goto':
      return { step: action.step, progress: 0, done: false };
    case 'restart':
      return initPlayer();
    default:
      return state;
  }
}
