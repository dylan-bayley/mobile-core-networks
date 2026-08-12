import { PANEL, EDGE, MONO } from '../theme.js';

function Row({ items, activeId, onSelect, getCount }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const on = item.id === activeId;
        const disabled = !!item.comingSoon;
        return (
          <button
            key={item.id}
            onClick={() => !disabled && onSelect(item.id)}
            disabled={disabled}
            className="rounded px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: on ? '#152441' : PANEL,
              border: `1px solid ${on ? '#3d6ba8' : EDGE}`,
              color: on ? '#ffffff' : '#8ea1bf',
              fontWeight: on ? 600 : 400,
            }}
          >
            {item.label}
            {item.comingSoon && (
              <span className="ml-2 hidden sm:inline" style={{ fontFamily: MONO, fontSize: 10, color: '#63799c' }}>
                soon
              </span>
            )}
            {getCount && !disabled && (
              <span className="ml-2 hidden sm:inline" style={{ fontFamily: MONO, fontSize: 11, color: '#63799c' }}>
                {getCount(item)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function SelectorBar({ networks, sessions, networkId, sessionId, onNetwork, onSession, focus, onToggleFocus }) {
  return (
    <div className="mb-1">
      {networks.length > 1 && <Row items={networks} activeId={networkId} onSelect={onNetwork} />}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-2">
          <Row items={sessions} activeId={sessionId} onSelect={onSession} />
        </div>
        <button
          onClick={onToggleFocus}
          className="mb-2 rounded px-3 py-2 text-xs"
          style={{ background: PANEL, border: `1px solid ${EDGE}`, color: focus ? '#dbe4f3' : '#63799c', fontFamily: MONO }}
        >
          {focus ? '◉' : '○'} dim inactive
        </button>
      </div>
    </div>
  );
}
