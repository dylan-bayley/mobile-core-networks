import { PANEL, EDGE, MONO, MUTED, FAINT, ACTIVE_BG, ACTIVE_EDGE } from '../theme.js';
import { sessionForFlow, variantsFor, taglineFor } from '../data/sessions.js';
import { isCompleted } from '../lib/progress.js';
import Switch from './Switch.jsx';

function Row({ items, activeId, onSelect, size = 'md', ariaLabel, doneIds }) {
  const pad = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={ariaLabel}>
      {items.map((item) => {
        const on = item.id === activeId;
        const done = doneIds?.has(item.id);
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-pressed={on}
            title={item.tagline ? `${item.tagline}${done ? ' (completed)' : ''}` : undefined}
            className={`min-h-10 rounded sm:min-h-0 ${pad}`}
            style={{
              background: on ? ACTIVE_BG : PANEL,
              border: `1px solid ${on ? ACTIVE_EDGE : EDGE}`,
              color: on ? '#ffffff' : MUTED,
              fontWeight: on ? 600 : 400,
            }}
          >
            {item.label}
            {done && (
              <span aria-label="completed" title="You have watched this flow to the end" style={{ color: '#3fd6a0', marginLeft: 6, fontSize: 11 }}>
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
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
  progress = {},
}) {
  const session = sessionForFlow(flowId) ?? sessions[0];
  const variants = variantsFor(session, networkFlows);

  // A session is "done" on this network when every variant it offers here is.
  const doneSessions = new Set(
    sessions.filter((s) => {
      const vs = variantsFor(s, networkFlows);
      return vs.length > 0 && vs.every((v) => isCompleted(progress, networkId, v.id));
    }).map((s) => s.id),
  );
  const doneVariants = new Set(variants.filter((v) => isCompleted(progress, networkId, v.id)).map((v) => v.id));
  const tagline = taglineFor(flowId);

  return (
    <div className="mb-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="sr-only">Network</span>
        <Row items={networks} activeId={networkId} onSelect={onNetwork} ariaLabel="Network" />
        <span aria-hidden="true" className="hidden sm:inline" style={{ color: '#2a3958' }}>|</span>
        <Row items={sessions} activeId={session.id} onSelect={(id) => onFlow(id)} ariaLabel="Session type" doneIds={doneSessions} />
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <div className="flex items-center rounded" role="group" aria-label="Diagram view" style={{ border: `1px solid ${EDGE}` }}>
            {[
              ['topology', 'Topology'],
              ['sequence', 'Sequence'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => onView(id)}
                aria-pressed={view === id}
                className="min-h-10 px-3 py-2 text-xs sm:min-h-0"
                title={id === 'topology' ? 'Animated network map' : 'Ladder diagram of the same steps'}
                style={{
                  background: view === id ? ACTIVE_BG : PANEL,
                  color: view === id ? '#ffffff' : MUTED,
                  fontFamily: MONO,
                  border: 0,
                  borderRadius: id === 'topology' ? '4px 0 0 4px' : '0 4px 4px 0',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <Switch on={focus} onChange={onToggleFocus} title="Fade the nodes and links the current step doesn't touch">
            focus current step
          </Switch>
          <button
            onClick={onToggleQuiz}
            aria-pressed={quizOpen}
            title="Ten questions generated from this flow"
            className="min-h-10 rounded px-3 py-2 text-xs sm:min-h-0"
            style={{ background: PANEL, border: `1px solid ${quizOpen ? ACTIVE_EDGE : EDGE}`, color: quizOpen ? '#dbe4f3' : MUTED, fontFamily: MONO }}
          >
            {quizOpen ? '✕ close quiz' : '? quiz me'}
          </button>
        </div>
      </div>
      {(variants.length > 1 || tagline) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {variants.length > 1 && (
            <>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: FAINT }}>VARIANT</span>
              <Row items={variants} activeId={flowId} onSelect={onFlow} size="sm" ariaLabel="Flow variant" doneIds={doneVariants} />
            </>
          )}
          {tagline && (
            <span className="basis-full text-xs sm:basis-auto" style={{ color: MUTED }}>
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
