import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NETWORKS, SESSIONS, FLOWS, resolveScenario, analogsOf, stepIndexOf, sessionForFlow } from '../data/index.js';
import { DEFAULT_FLOW, LEARNING_PATH, taglineFor } from '../data/sessions.js';
import { validateData } from '../data/validate.js';
import { NODE_MAP_4G, NODE_MAP_5GC } from '../data/reference/nodeNaming.js';
import { QCI, FIVE_QI } from '../data/reference/qos.js';
import { EIR_STATUS } from '../data/reference/eirStatus.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { autolinkAcronyms } from '../lib/autolinkAcronyms.jsx';
import { countCompleted, flowProgress, readProgress, recordQuiz, recordStep, resetProgress, writeProgress } from '../lib/progress.js';
import { hashQuery, urlWithHashQuery } from '../lib/route.js';
import { useMediaQuery, useReducedMotion } from '../lib/useMediaQuery.js';
import { useGlossary } from '../lib/glossaryContext.js';
import { readStored, store } from '../lib/storage.js';
import { makeGeometry } from '../engine/geometry.js';
import { useStepPlayer } from '../engine/useStepPlayer.js';
import { K, MONO, MUTED, FAINT, EDGE, PANEL } from '../theme.js';
import SelectorBar from './SelectorBar.jsx';
import TopologyDiagram from './TopologyDiagram.jsx';
import SequenceDiagram from './SequenceDiagram.jsx';
import Transport from './Transport.jsx';
import ProgressBar from './ProgressBar.jsx';
import FlowOverview from './FlowOverview.jsx';
import StepDetail from './StepDetail.jsx';
import StepList from './StepList.jsx';
import Quiz from './Quiz.jsx';
import Legend from './Legend.jsx';
import ReferencePanel from './ReferencePanel.jsx';
import IntroCard from './IntroCard.jsx';

const DIAGRAM_MAX_HEIGHT_WIDE = 'max(360px, calc(100vh - 250px))';
const DIAGRAM_MAX_HEIGHT_NARROW = '48vh';
const WIDE_QUERY = '(min-width: 1280px)'; // Tailwind `xl` — where the aside moves beside the diagram

const BEYOND =
  "Roaming swaps S5 for S8 with the P-GW in the home network. CUPS splits the EPG into EPG-C and EPG-U over Sx, which is the same control/user separation you'll meet again as SMF and UPF in 5G — where the EIR becomes the 5G-EIR on N17, and SMS keeps working over NAS through the AMF and an SMSF.";

const readUrl = () => {
  if (typeof window === 'undefined') return {};
  const p = hashQuery();
  return {
    net: p.get('net'),
    flow: p.get('variant') ?? p.get('session'),
    step: p.get('step'),
    view: p.get('view'),
  };
};

const validNet = (id) => (NETWORKS.some((n) => n.id === id) ? id : NETWORKS[0].id);
const validFlow = (id) => (sessionForFlow(id) ? id : DEFAULT_FLOW);
const validView = (v) => (v === 'sequence' ? 'sequence' : 'topology');

export default function Explorer() {
  useEffect(() => {
    if (import.meta.env.DEV) validateData();
  }, []);

  const initial = useRef(readUrl()).current;
  const reducedMotion = useReducedMotion();
  const isWide = useMediaQuery(WIDE_QUERY);
  const { openTerm: openGlossaryTerm, closeTerm: closeGlossaryTerm, activeKey: activeGlossaryKey, setDiagram } = useGlossary();

  const [networkId, setNetworkId] = useState(() => validNet(initial.net));
  const [flowId, setFlowId] = useState(() => validFlow(initial.flow));
  const [view, setView] = useState(() => validView(initial.view));
  const [quizOpen, setQuizOpen] = useState(false);
  // First visit: show the intro and hold playback until the learner presses
  // Start. (Not keyed on the URL — the app writes ?step= into it on load, so
  // a plain reload would otherwise look like a deep link.)
  const [introOpen, setIntroOpen] = useState(() => !readStored('mcn.introSeen', false));
  const [playing, setPlaying] = useState(() => !reducedMotion && !initial.step && !introOpen);
  const [speed, setSpeed] = useState(() => readStored('mcn.speed', 1));
  const [pauseEach, setPauseEach] = useState(() => readStored('mcn.pauseEach', false));
  const [focus, setFocus] = useState(true);
  const [highlightNode, setHighlightNode] = useState(null);
  const [progress, setProgress] = useState(() => readProgress());

  const pendingStepRef = useRef(initial.step ?? null);
  const firstScenarioRun = useRef(true);

  // Reduced motion switched on mid-session: stop autoplay rather than wait for a reload.
  useEffect(() => {
    if (reducedMotion) setPlaying(false);
  }, [reducedMotion]);

  useEffect(() => store('mcn.speed', speed), [speed]);
  useEffect(() => store('mcn.pauseEach', pauseEach), [pauseEach]);
  useEffect(() => writeProgress(progress), [progress]);

  const scenario = useMemo(() => resolveScenario(networkId, flowId), [networkId, flowId]);
  const geo = useMemo(() => makeGeometry(scenario.topology), [scenario.topology]);
  const player = useStepPlayer(scenario.steps, { playing, setPlaying, speed, pauseEach });

  // If the network can't serve the requested flow (e.g. EPS fallback on 4G)
  // resolveScenario fell back; reflect that in state so the selector is honest.
  useEffect(() => {
    if (scenario.flowId !== flowId) setFlowId(scenario.flowId);
  }, [scenario.flowId, flowId]);

  // On a scenario change: jump to a pending deep-linked step (paused), or
  // restart from the top. Skipped on first mount so the initial paused /
  // reduced-motion / intro choice above isn't overridden.
  useEffect(() => {
    const id = pendingStepRef.current;
    pendingStepRef.current = null;
    const idx = id ? stepIndexOf(scenario.steps, id) : -1;
    if (idx >= 0) {
      player.go(idx);
      setPlaying(false);
      return;
    }
    if (firstScenarioRun.current) {
      firstScenarioRun.current = false;
      return;
    }
    player.restart();
    setPlaying(!reducedMotion && !introOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.steps]);

  const step = Math.min(player.step, scenario.steps.length - 1);
  const cur = scenario.steps[step];
  const accent = K[cur.k].c;
  const last = scenario.steps.length - 1;

  // Learning progress: furthest step reached per flow, completion on the last one.
  useEffect(() => {
    setProgress((p) => recordStep(p, networkId, scenario.flowId, step, scenario.steps.length));
  }, [networkId, scenario.flowId, step, scenario.steps.length]);

  // URL reflects the current view: net / session / variant / step / view.
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const session = sessionForFlow(scenario.flowId) ?? SESSIONS[0];
    const q = new URLSearchParams({ net: networkId, session: session.id });
    if (scenario.flowId !== session.id) q.set('variant', scenario.flowId);
    q.set('step', cur.id);
    if (view === 'sequence') q.set('view', 'sequence');
    return urlWithHashQuery('/flows', q);
  }, [networkId, scenario.flowId, cur.id, view]);

  useEffect(() => {
    if (typeof window === 'undefined' || !shareUrl) return;
    if (window.location.href !== shareUrl) window.history.replaceState(null, '', shareUrl);
  }, [shareUrl]);

  // Browser back/forward: re-read the URL and apply it.
  const currentRef = useRef({ networkId, flowId });
  currentRef.current = { networkId, flowId };
  useEffect(() => {
    const onPop = () => {
      const u = readUrl();
      const net = validNet(u.net);
      const flow = validFlow(u.flow);
      setView(validView(u.view));
      const changed = net !== currentRef.current.networkId || flow !== currentRef.current.flowId;
      if (changed) {
        pendingStepRef.current = u.step ?? null;
        setNetworkId(net);
        setFlowId(flow);
      } else if (u.step) {
        const idx = stepIndexOf(scenario.steps, u.step);
        if (idx >= 0) player.go(idx);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [scenario.steps, player]);

  /** Push the *current* URL so browser back returns here after a user-initiated jump. */
  const markHistory = () => {
    if (typeof window !== 'undefined') window.history.pushState(null, '', window.location.href);
  };

  const go = useCallback(
    (i) => {
      markHistory();
      player.go(Math.max(0, Math.min(last, i)));
    },
    [player, last],
  );
  const switchNetwork = (id) => {
    if (id === networkId) return;
    markHistory();
    setNetworkId(id);
  };
  const switchFlow = (id) => {
    if (id === flowId) return;
    markHistory();
    setFlowId(id);
  };
  const switchTo = (net, flow) => {
    if (net === networkId && flow === flowId) return;
    markHistory();
    setNetworkId(net);
    setFlowId(flow);
  };
  const jumpToAnalog = (a) => {
    markHistory();
    pendingStepRef.current = a.id;
    setNetworkId(a.net);
    setFlowId(a.flow);
  };

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (player.done) player.restart();
    else if (player.held && step < last) player.go(step + 1);
    setPlaying(true);
  }, [playing, player, step, last]);

  const restart = () => {
    player.restart();
    setPlaying(true);
  };

  const closeIntro = () => {
    setIntroOpen(false);
    store('mcn.introSeen', true);
  };
  const startFromIntro = (targetFlowId) => {
    closeIntro();
    if (targetFlowId && targetFlowId !== flowId) {
      switchFlow(targetFlowId); // the scenario-change effect restarts and plays
      return;
    }
    player.restart();
    setPlaying(!reducedMotion);
  };

  const showNode = useCallback(
    (id) => {
      closeGlossaryTerm();
      setHighlightNode(id);
    },
    [closeGlossaryTerm],
  );

  // Let the site-wide glossary popover offer "show on diagram" for this topology.
  useEffect(() => {
    setDiagram(view === 'topology' ? { topology: scenario.topology, onShowNode: showNode } : null);
  }, [setDiagram, view, scenario.topology, showNode]);
  useEffect(() => () => setDiagram(null), [setDiagram]);
  useEffect(() => {
    if (!highlightNode) return undefined;
    const t = setTimeout(() => setHighlightNode(null), 2200);
    return () => clearTimeout(t);
  }, [highlightNode]);

  const onQuizScore = useCallback(
    (score, total) => setProgress((p) => recordQuiz(p, networkId, scenario.flowId, score, total)),
    [networkId, scenario.flowId],
  );
  const onResetProgress = () => setProgress(resetProgress());

  useEffect(() => {
    const isTyping = (e) => e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
    const isButton = (e) => e.target instanceof HTMLElement && e.target.closest('button, [role="button"]');
    const onKeyDown = (e) => {
      if (isTyping(e) || e.defaultPrevented) return;
      if (e.key === 'Escape') {
        if (introOpen) closeIntro();
      } else if (e.code === 'Space') {
        if (isButton(e)) return; // let the focused button take Space; don't also toggle playback
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        go(step + 1);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        go(step - 1);
      } else if (e.code === 'Home') {
        e.preventDefault();
        go(0);
      } else if (e.code === 'End') {
        e.preventDefault();
        go(last);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, step, last, togglePlay, introOpen]);

  const analogs = useMemo(() => analogsOf(cur, { networkId, flowId: scenario.flowId }), [cur, networkId, scenario.flowId]);
  const networkFlows = FLOWS[networkId] ?? {};
  const network = NETWORKS.find((n) => n.id === networkId) ?? NETWORKS[0];
  const pathForNetwork = LEARNING_PATH.filter((f) => networkFlows[f.id]);
  const allFlowKeys = NETWORKS.flatMap((n) => Object.keys(FLOWS[n.id] ?? {}).map((f) => [n.id, f]));
  const completedTotal = allFlowKeys.filter(([n, f]) => countCompleted(progress, n, [f]) === 1).length;
  const bestQuiz = flowProgress(progress, networkId, scenario.flowId)?.bestQuiz ?? null;
  const diagramMaxHeight = isWide ? DIAGRAM_MAX_HEIGHT_WIDE : DIAGRAM_MAX_HEIGHT_NARROW;

  const stepDetail = (announce) => (
    <StepDetail
      cur={cur}
      step={step}
      stepsLength={scenario.steps.length}
      topology={scenario.topology}
      accent={accent}
      onGlossaryOpen={openGlossaryTerm}
      activeGlossaryKey={activeGlossaryKey}
      analogs={analogs}
      onJumpAnalog={jumpToAnalog}
      shareUrl={shareUrl}
      announce={announce}
    />
  );

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1500px] px-3 py-3 sm:px-4 sm:py-4">
        <header className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <h1 tabIndex={-1} className="text-lg font-semibold tracking-tight text-white outline-none sm:text-xl">
            How a mobile core actually carries a session
          </h1>
          <p className="hidden md:block" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', color: FAINT }}>
            4G EPC · 5G NSA / SA · IMS · MESSAGING
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIntroOpen((o) => !o)}
              aria-pressed={introOpen}
              title="What is this site and where should I start?"
              className="rounded px-2 py-1.5 text-xs"
              style={{ background: PANEL, border: `1px solid ${EDGE}`, color: MUTED, fontFamily: MONO }}
            >
              ? help
            </button>
          </div>
          <p className="basis-full text-xs" style={{ color: MUTED }}>
            Pick a network and a session type, then watch the signalling walk the reference points one message at a time.
            <span className="hidden sm:inline" style={{ fontFamily: MONO, color: FAINT }}> Space play/pause · ←/→ step · ? for all shortcuts</span>
          </p>
        </header>

        {introOpen && (
          <IntroCard
            path={pathForNetwork}
            progress={progress}
            networkId={networkId}
            networkLabel={network.label}
            currentFlowId={scenario.flowId}
            onStart={startFromIntro}
            onClose={closeIntro}
          />
        )}

        <SelectorBar
          networks={NETWORKS}
          sessions={SESSIONS}
          networkId={networkId}
          flowId={scenario.flowId}
          networkFlows={networkFlows}
          onNetwork={switchNetwork}
          onFlow={switchFlow}
          focus={focus}
          onToggleFocus={() => setFocus((f) => !f)}
          view={view}
          onView={setView}
          quizOpen={quizOpen}
          onToggleQuiz={() => setQuizOpen((q) => !q)}
          progress={progress}
        />

        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start xl:gap-3">
          <div className="min-w-0">
            {view === 'sequence' ? (
              <SequenceDiagram
                topology={scenario.topology}
                steps={scenario.steps}
                step={step}
                onGo={go}
                onGlossaryOpen={openGlossaryTerm}
                activeGlossaryKey={activeGlossaryKey}
                maxHeight={diagramMaxHeight}
                reducedMotion={reducedMotion}
              />
            ) : (
              <TopologyDiagram
                topology={scenario.topology}
                geo={geo}
                steps={scenario.steps}
                step={step}
                progress={player.progress}
                ambient={scenario.ambient}
                focus={focus}
                reducedMotion={reducedMotion}
                onGlossaryOpen={openGlossaryTerm}
                activeGlossaryKey={activeGlossaryKey}
                highlightNode={highlightNode}
                maxHeight={diagramMaxHeight}
              />
            )}

            <Transport
              step={step}
              stepsLength={scenario.steps.length}
              progress={player.progress}
              playing={playing}
              held={player.held}
              remaining={player.remaining}
              onTogglePlay={togglePlay}
              onPrev={() => go(step - 1)}
              onNext={() => go(step + 1)}
              onRestart={restart}
              speed={speed}
              onSpeed={setSpeed}
              pauseEach={pauseEach}
              onTogglePauseEach={() => setPauseEach((p) => !p)}
              accent={accent}
            />

            <ProgressBar steps={scenario.steps} step={step} progress={player.progress} accent={accent} onGo={go} />

            {/* Narrow screens: the reading surface sits right under the controls. */}
            {!quizOpen && <div className="mt-3 xl:hidden">{stepDetail(!isWide)}</div>}

            <Legend />
          </div>

          <aside className="mt-3 flex min-h-0 flex-col gap-3 xl:sticky xl:top-3 xl:mt-0 xl:max-h-[calc(100vh-1.5rem)] xl:overflow-y-auto xl:pr-0.5">
            {quizOpen ? (
              <Quiz
                scenario={scenario}
                geo={geo}
                onGo={go}
                onClose={() => setQuizOpen(false)}
                best={bestQuiz}
                onScore={onQuizScore}
                onGlossaryOpen={openGlossaryTerm}
                activeGlossaryKey={activeGlossaryKey}
              />
            ) : (
              <>
                <FlowOverview
                  scenario={scenario}
                  networks={NETWORKS}
                  flows={FLOWS}
                  networkId={networkId}
                  onSwitch={switchTo}
                  onGlossaryOpen={openGlossaryTerm}
                  activeGlossaryKey={activeGlossaryKey}
                  tagline={taglineFor(scenario.flowId)}
                />
                <StepList steps={scenario.steps} step={step} onGo={go} />
                <div className="hidden xl:block">{stepDetail(isWide)}</div>
              </>
            )}
          </aside>
        </div>

        <ReferencePanel
          nodeNaming={networkId === '4g' ? NODE_MAP_4G : [...NODE_MAP_4G, ...NODE_MAP_5GC]}
          qci={QCI}
          fiveQi={networkId === '4g' ? null : FIVE_QI}
          eirStatus={EIR_STATUS}
          glossary={GLOSSARY}
          beyond={autolinkAcronyms(BEYOND, GLOSSARY, { activeKey: activeGlossaryKey, onOpen: openGlossaryTerm })}
          completed={completedTotal}
          totalFlows={allFlowKeys.length}
          onResetProgress={onResetProgress}
        />
      </div>
    </div>
  );
}
