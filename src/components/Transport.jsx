import { PANEL, EDGE, MONO } from '../theme.js';

const SPEEDS = [0.5, 1, 2];

export default function Transport({ step, stepsLength, progress, playing, onTogglePlay, onPrev, onNext, onRestart, speed, onSpeed, accent }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        onClick={onPrev}
        disabled={step === 0}
        className="rounded px-3 py-2 text-sm disabled:opacity-30"
        style={{ background: PANEL, border: `1px solid ${EDGE}`, color: '#dbe4f3', fontFamily: MONO }}
      >
        ← prev
      </button>
      <button
        onClick={onTogglePlay}
        className="rounded px-4 py-2 text-sm font-semibold"
        style={{
          background: playing ? '#1c2f52' : accent,
          border: `1px solid ${playing ? '#3d6ba8' : accent}`,
          color: playing ? '#dbe4f3' : '#06101f',
        }}
      >
        {playing ? 'Pause' : step === stepsLength - 1 && progress >= 1 ? 'Replay' : 'Play'}
      </button>
      <button
        onClick={onNext}
        disabled={step === stepsLength - 1}
        className="rounded px-3 py-2 text-sm disabled:opacity-30"
        style={{ background: PANEL, border: `1px solid ${EDGE}`, color: '#dbe4f3', fontFamily: MONO }}
      >
        next →
      </button>
      <button
        onClick={onRestart}
        className="rounded px-3 py-2 text-sm"
        style={{ background: PANEL, border: `1px solid ${EDGE}`, color: '#8ea1bf', fontFamily: MONO }}
      >
        restart
      </button>
      <div className="ml-auto flex items-center gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeed(s)}
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
