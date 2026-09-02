import { PANEL, EDGE, MONO } from '../theme.js';

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
  const playLabel = playing ? 'Pause' : atEnd ? 'Replay' : held ? 'Next ▸' : 'Play';

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button onClick={onPrev} disabled={step === 0} className="rounded px-3 py-2 text-sm disabled:opacity-30" style={btn} aria-label="Previous step">
        ← prev
      </button>
      <button
        onClick={onTogglePlay}
        className="rounded px-4 py-2 text-sm font-semibold"
        style={{
          background: playing ? '#1c2f52' : accent,
          border: `1px solid ${playing ? '#3d6ba8' : accent}`,
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
      <button onClick={onNext} disabled={step === stepsLength - 1} className="rounded px-3 py-2 text-sm disabled:opacity-30" style={btn} aria-label="Next step">
        next →
      </button>
      <button onClick={onRestart} className="rounded px-3 py-2 text-sm" style={{ ...btn, color: '#8ea1bf' }}>
        restart
      </button>
      <button
        onClick={onTogglePauseEach}
        aria-pressed={pauseEach}
        title="Stop after each step so you can read before moving on"
        className="rounded px-3 py-2 text-xs"
        style={{ ...btn, color: pauseEach ? '#dbe4f3' : '#63799c', borderColor: pauseEach ? '#3d6ba8' : EDGE }}
      >
        {pauseEach ? '◉' : '○'} pause after each step
      </button>
      <div className="ml-auto flex items-center gap-1" role="group" aria-label="Playback speed">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeed(s)}
            aria-pressed={speed === s}
            aria-label={`${s}× speed`}
            className="rounded px-2 py-1 text-xs"
            style={{
              background: speed === s ? '#152441' : 'transparent',
              border: `1px solid ${speed === s ? '#3d6ba8' : EDGE}`,
              color: speed === s ? '#ffffff' : '#63799c',
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
