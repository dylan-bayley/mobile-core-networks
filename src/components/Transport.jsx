import { PANEL, EDGE, MONO, MUTED, FAINT, ACTIVE_BG, ACTIVE_EDGE } from '../theme.js';
import Switch from './Switch.jsx';

const SPEEDS = [0.5, 1, 1.5, 2];

const btn = { background: PANEL, border: `1px solid ${EDGE}`, color: '#dbe4f3', fontFamily: MONO };

export default function Transport({
  step,
  stepsLength,
  progress,
  playing,
  held,
  remaining,
  onTogglePlay,
  onPrev,
  onNext,
  onRestart,
  speed,
  onSpeed,
  pauseEach,
  onTogglePauseEach,
  accent,
}) {
  const atEnd = step === stepsLength - 1 && progress >= 1;
  const playLabel = playing ? 'Pause' : atEnd ? 'Replay' : 'Play';

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button onClick={onPrev} disabled={step === 0} className="min-h-10 rounded px-3 py-2 text-sm disabled:opacity-30 sm:min-h-0" style={btn} aria-label="Previous step">
        ← prev
      </button>
      <button
        onClick={onTogglePlay}
        className="min-h-10 rounded px-4 py-2 text-sm font-semibold sm:min-h-0"
        style={{
          background: playing ? ACTIVE_BG : accent,
          border: `1px solid ${playing ? ACTIVE_EDGE : accent}`,
          color: playing ? '#dbe4f3' : '#06101f',
          minWidth: 84,
        }}
        aria-label={playLabel}
      >
        {playLabel}
        {playing && (
          <span className="ml-2" style={{ fontFamily: MONO, fontSize: 10, opacity: 0.7 }}>
            {remaining}s
          </span>
        )}
      </button>
      <button onClick={onNext} disabled={step === stepsLength - 1} className="min-h-10 rounded px-3 py-2 text-sm disabled:opacity-30 sm:min-h-0" style={btn} aria-label="Next step">
        next →
      </button>
      <button onClick={onRestart} className="min-h-10 rounded px-3 py-2 text-sm sm:min-h-0" style={{ ...btn, color: MUTED }}>
        restart
      </button>
      {held && !playing && (
        <span style={{ fontFamily: MONO, fontSize: 10, color: FAINT }} aria-live="polite">
          step finished · Play continues
        </span>
      )}
      <Switch on={!pauseEach} onChange={onTogglePauseEach} title="Off: playback stops at the end of every step so you can read before moving on">
        auto-advance
      </Switch>
      <div className="ml-auto flex items-center gap-1" role="group" aria-label="Playback speed">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeed(s)}
            aria-pressed={speed === s}
            aria-label={`${s}× speed`}
            className="min-h-10 rounded px-2 py-1 text-xs sm:min-h-0"
            style={{
              background: speed === s ? ACTIVE_BG : 'transparent',
              border: `1px solid ${speed === s ? ACTIVE_EDGE : EDGE}`,
              color: speed === s ? '#ffffff' : MUTED,
              fontFamily: MONO,
            }}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}
