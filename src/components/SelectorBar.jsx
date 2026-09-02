import { PANEL, EDGE, MONO } from '../theme.js';
import { sessionForFlow, variantsFor } from '../data/sessions.js';

function Row({ items, activeId, onSelect, size = 'md', ariaLabel }) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-2 text-sm';
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={ariaLabel}>
      {items.map((item) => {
        const on = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-pressed={on}
            className={`rounded ${pad}`}
            style={{
              background: on ? '#152441' : PANEL,
              border: `1px solid ${on ? '#3d6ba8' : EDGE}`,
              color: on ? '#ffffff' : '#8ea1bf',
              fontWeight: on ? 600 : 400,
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ on, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      title={title}
      className="rounded px-3 py-2 text-xs"
      style={{ background: PANEL, border: `1px solid ${on ? '#3d6ba8' : EDGE}`, color: on ? '#dbe4f3' : '#63799c', fontFamily: MONO }}
    >
      {children}
    </button>
  );
}

export default function SelectorBar({
  networks,
  sessions,
  networkId,
  flowId,
  networkFlows,
  onNetwork,
  onFlow,
  focus,
  onToggleFocus,
  view,
  onView,
  quizOpen,
  onToggleQuiz,
}) {
  const session = sessionForFlow(flowId) ?? sessions[0];
  const variants = variantsFor(session, networkFlows);

  return (
    <div className="mb-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Row items={networks} activeId={networkId} onSelect={onNetwork} ariaLabel="Network" />
        <span aria-hidden="true" style={{ color: '#2a3958' }}>|</span>
        <Row items={sessions} activeId={session.id} onSelect={(id) => onFlow(id)} ariaLabel="Session type" />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded" role="group" aria-label="Diagram view" style={{ border: `1px solid ${EDGE}` }}>
            {[
              ['topology', 'Topology'],
              ['sequence', 'Sequence'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => onView(id)}
                aria-pressed={view === id}
                className="px-3 py-2 text-xs"
                style={{
                  background: view === id ? '#152441' : PANEL,
                  color: view === id ? '#ffffff' : '#63799c',
                  fontFamily: MONO,
                  border: 0,
                  borderRadius: id === 'topology' ? '4px 0 0 4px' : '0 4px 4px 0',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <Toggle on={focus} onClick={onToggleFocus} title="Dim nodes and links the current step doesn't touch">
            {focus ? '◉' : '○'} dim inactive
          </Toggle>
          <Toggle on={quizOpen} onClick={onToggleQuiz} title="Ten questions generated from this flow">
            {quizOpen ? '✕ close quiz' : '? quiz me'}
          </Toggle>
        </div>
      </div>
      {variants.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: '#4d618a' }}>VARIANT</span>
          <Row items={variants} activeId={flowId} onSelect={onFlow} size="sm" ariaLabel="Flow variant" />
        </div>
      )}
    </div>
  );
}
