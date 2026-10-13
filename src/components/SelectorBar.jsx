import { useRef, useState } from 'react';
import { PANEL, EDGE, MONO, MUTED, FAINT, ACTIVE_BG, ACTIVE_EDGE, TEXT, DONE, RULE } from '../theme.js';
import { sessionForFlow, variantsFor } from '../data/sessions.js';
import { isCompleted } from '../lib/progress.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import Switch from './Switch.jsx';
import Popover from './ui/Popover.jsx';
import Sheet from './ui/Sheet.jsx';

const PHONE_QUERY = '(max-width: 639px)'; // below Tailwind `sm`
const VIEWS = [
  ['topology', 'Topology', 'Animated network map'],
  ['sequence', 'Sequence', 'Ladder diagram of the same steps'],
];
const FOCUS_HINT = "Fades the nodes and links the current step doesn't touch.";
const QUIZ_HINT = 'Ten questions generated from this flow.';

function Done({ show }) {
  if (!show) return null;
  return (
    <span style={{ color: DONE, marginLeft: 6, fontSize: 12 }}>
      <span aria-hidden="true">✓</span>
      <span className="sr-only"> (completed)</span>
    </span>
  );
}

/** A wrapping row of choice buttons (desktop). Hover text is only a bonus; the description is also shown after you pick. */
function Row({ items, activeId, onSelect, size = 'md', ariaLabel, doneIds }) {
  const pad = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={ariaLabel}>
      {items.map((item) => {
        const on = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-pressed={on}
            title={item.tagline}
            className={`min-h-10 rounded sm:min-h-0 ${pad}`}
            style={{
              background: on ? ACTIVE_BG : PANEL,
              border: `1px solid ${on ? ACTIVE_EDGE : EDGE}`,
              color: on ? '#ffffff' : MUTED,
              fontWeight: on ? 600 : 400,
            }}
          >
            {item.label}
            <Done show={doneIds?.has(item.id)} />
          </button>
        );
      })}
    </div>
  );
}

/** A vertical list of choices with the description visible under each (phone sheet). */
function ChoiceList({ items, activeId, onSelect, ariaLabel, doneIds, columns = false }) {
  return (
    <div role="group" aria-label={ariaLabel} className={columns ? 'grid grid-cols-3 gap-2' : 'flex flex-col gap-2'}>
      {items.map((item) => {
        const on = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={on}
            className="min-h-12 rounded px-3 py-2 text-left"
            style={{ background: on ? ACTIVE_BG : PANEL, border: `1px solid ${on ? ACTIVE_EDGE : EDGE}` }}
          >
            <span className="block text-sm" style={{ color: on ? '#ffffff' : TEXT, fontWeight: on ? 600 : 500 }}>
              {item.label}
              <Done show={doneIds?.has(item.id)} />
            </span>
            {(item.tagline ?? item.description) && (
              <span className="mt-0.5 block text-xs leading-snug" style={{ color: MUTED }}>
                {item.tagline ?? item.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const SectionLabel = ({ children }) => (
  <h3 className="mb-2 text-sm font-semibold" style={{ color: TEXT }}>
    {children}
  </h3>
);

function ViewToggle({ view, onView }) {
  return (
    <div className="flex items-center rounded" role="group" aria-label="Diagram view" style={{ border: `1px solid ${EDGE}` }}>
      {VIEWS.map(([id, label, description]) => (
        <button
          key={id}
          onClick={() => onView(id)}
          aria-pressed={view === id}
          title={description}
          className="min-h-10 px-3 py-2 text-xs sm:min-h-0"
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
  );
}

function QuizButton({ quizOpen, onToggleQuiz, onAfter }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => {
          onToggleQuiz();
          onAfter?.();
        }}
        aria-pressed={quizOpen}
        className="min-h-10 rounded px-3 py-2 text-left text-xs sm:min-h-0"
        style={{ background: PANEL, border: `1px solid ${quizOpen ? ACTIVE_EDGE : EDGE}`, color: quizOpen ? TEXT : MUTED, fontFamily: MONO }}
      >
        {quizOpen ? '✕ close quiz' : '? quiz me'}
      </button>
      <span className="text-xs" style={{ color: MUTED }}>
        {QUIZ_HINT}
      </span>
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
  const isPhone = useMediaQuery(PHONE_QUERY);
  const [sheetOpen, setSheetOpen] = useState(false);
  const summaryRef = useRef(null);
  const session = sessionForFlow(flowId) ?? sessions[0];
  const variants = variantsFor(session, networkFlows);
  const network = networks.find((n) => n.id === networkId) ?? networks[0];
  const flow = variants.find((v) => v.id === flowId);

  // A session is "done" on this network when every variant it offers here is.
  const doneSessions = new Set(
    sessions.filter((s) => {
      const vs = variantsFor(s, networkFlows);
      return vs.length > 0 && vs.every((v) => isCompleted(progress, networkId, v.id));
    }).map((s) => s.id),
  );
  const doneVariants = new Set(variants.filter((v) => isCompleted(progress, networkId, v.id)).map((v) => v.id));

  if (isPhone) {
    const pickSession = (id) => {
      onFlow(id);
      const next = sessions.find((s) => s.id === id);
      if (!next || variantsFor(next, networkFlows).length <= 1) setSheetOpen(false);
    };
    return (
      <>
        <div className="mb-3 flex items-stretch gap-2">
          <button
            ref={summaryRef}
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded px-3 py-1.5 text-left"
            style={{ background: PANEL, border: `1px solid ${EDGE}` }}
          >
            <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold" style={{ color: TEXT }}>
              {network.label}, {session.label}
            </span>
            <span className="block truncate text-xs" style={{ color: MUTED }}>
              {variants.length > 1 && flow ? flow.label : session.tagline}
            </span>
            </span>
            <span aria-hidden="true" style={{ color: MUTED }}>▾</span>
            <span className="sr-only">Change network or session</span>
          </button>
          <ViewToggle view={view} onView={onView} />
        </div>
        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Choose a flow" returnTo={summaryRef}>
          <section>
            <SectionLabel>Network</SectionLabel>
            <ChoiceList items={networks} activeId={networkId} onSelect={onNetwork} ariaLabel="Network" columns />
          </section>
          <section>
            <SectionLabel>Session</SectionLabel>
            <ChoiceList items={sessions} activeId={session.id} onSelect={pickSession} ariaLabel="Session type" doneIds={doneSessions} />
          </section>
          {variants.length > 1 && (
            <section>
              <SectionLabel>Variant</SectionLabel>
              <ChoiceList
                items={variants}
                activeId={flowId}
                onSelect={(id) => {
                  onFlow(id);
                  setSheetOpen(false);
                }}
                ariaLabel="Flow variant"
                doneIds={doneVariants}
              />
            </section>
          )}
          <section className="flex flex-col gap-3">
            <SectionLabel>Diagram and quiz</SectionLabel>
            <Switch on={focus} onChange={onToggleFocus} hint={FOCUS_HINT}>
              focus current step
            </Switch>
            <QuizButton
              quizOpen={quizOpen}
              onToggleQuiz={onToggleQuiz}
              onAfter={() => {
                setSheetOpen(false);
                // On a phone the quiz renders below the diagram; bring it into view when it opens.
                if (!quizOpen) setTimeout(() => document.getElementById('flow-aside')?.scrollIntoView({ block: 'start' }), 0);
              }}
            />
          </section>
        </Sheet>
      </>
    );
  }

  return (
    <div className="mb-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="sr-only">Network</span>
        <Row items={networks} activeId={networkId} onSelect={onNetwork} ariaLabel="Network" />
        <span aria-hidden="true" className="hidden sm:inline" style={{ color: RULE }}>|</span>
        <Row items={sessions} activeId={session.id} onSelect={(id) => onFlow(id)} ariaLabel="Session type" doneIds={doneSessions} />
        <div className="flex items-center gap-2 sm:ml-auto">
          <ViewToggle view={view} onView={onView} />
          <Popover label="More" ariaLabel="Diagram and quiz options" active={quizOpen} width="w-72">
            {(close) => (
              <>
                <Switch on={focus} onChange={onToggleFocus} hint={FOCUS_HINT}>
                  focus current step
                </Switch>
                <QuizButton quizOpen={quizOpen} onToggleQuiz={onToggleQuiz} onAfter={close} />
              </>
            )}
          </Popover>
        </div>
      </div>
      {variants.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm" style={{ color: FAINT }}>Variant</span>
          <Row items={variants} activeId={flowId} onSelect={onFlow} size="sm" ariaLabel="Flow variant" doneIds={doneVariants} />
        </div>
      )}
    </div>
  );
}
