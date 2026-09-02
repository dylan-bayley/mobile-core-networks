import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NETWORKS, SESSIONS, FLOWS, resolveScenario, analogsOf, stepIndexOf, sessionForFlow } from '../data/index.js';
import { validateData } from '../data/validate.js';
import { NODE_MAP_4G, NODE_MAP_5GC } from '../data/reference/nodeNaming.js';
import { QCI, FIVE_QI } from '../data/reference/qos.js';
import { EIR_STATUS } from '../data/reference/eirStatus.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { autolinkAcronyms } from '../lib/autolinkAcronyms.jsx';
import { makeGeometry } from '../engine/geometry.js';
import { useStepPlayer } from '../engine/useStepPlayer.js';
import { K, BG, MONO, SANS } from '../theme.js';
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
import GlossaryPopover from './GlossaryPopover.jsx';

const DIAGRAM_MAX_HEIGHT = 'max(360px, calc(100vh - 250px))';

const readUrl = () => {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  return {
    net: p.get('net'),
    flow: p.get('variant') ?? p.get('session'),
    step: p.get('step'),
    view: p.get('view'),
  };
};

const readStored = (key, fallback) => {
  try {
    const v = window.localStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
};
const store = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode etc. — a lost preference is fine */
  }
};

const validNet = (id) => (NETWORKS.some((n) => n.id === id) ? id : NETWORKS[0].id);
const validFlow = (id) => (sessionForFlow(id) ? id : SESSIONS[0].id);
const validView = (v) => (v === 'sequence' ? 'sequence' : 'topology');

export default function Explorer() {
  useEffect(() => {
    if (import.meta.env.DEV) validateData();
  }, []);

  const initial = useRef(readUrl()).current;
  const reducedMotion = useRef(
    typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  ).current;

  const [networkId, setNetworkId] = useState(() => validNet(initial.net));
  const [flowId, setFlowId] = useState(() => validFlow(initial.flow));
  const [view, setView] = useState(() => validView(initial.view));
  const [quizOpen, setQuizOpen] = useState(false);
  const [playing, setPlaying] = useState(() => !reducedMotion && !initial.step);
  const [speed, setSpeed] = useState(() => readStored('mcn.speed', 1));
  const [pauseEach, setPauseEach] = useState(() => readStored('mcn.pauseEach', false));
  const [focus, setFocus] = useState(true);
  const [glossaryTarget, setGlossaryTarget] = useState(null);

  const pendingStepRef = useRef(initial.step ?? null);
  const firstScenarioRun = useRef(true);

  const openGlossaryTerm = useCallback((key, el) => setGlossaryTarget({ key, anchorEl: el }), []);
  const closeGlossaryTerm = useCallback(() => setGlossaryTarget(null), []);

  useEffect(() => store('mcn.speed', speed), [speed]);
  useEffect(() => store('mcn.pauseEach', pauseEach), [pauseEach]);

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
  // reduced-motion choice above isn't overridden.
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
    setPlaying(!reducedMotion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.steps]);

  const step = Math.min(player.step, scenario.steps.length - 1);
  const cur = scenario.steps[step];
  const accent = K[cur.k].c;
  const last = scenario.steps.length - 1;

  // URL reflects the current view: net / session / variant / step / view.
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    const session = sessionForFlow(scenario.flowId) ?? SESSIONS[0];
    url.searchParams.set('net', networkId);
    url.searchParams.set('session', session.id);
    if (scenario.flowId !== session.id) url.searchParams.set('variant', scenario.flowId);
    else url.searchParams.delete('variant');
    url.searchParams.set('step', cur.id);
    if (view === 'sequence') url.searchParams.set('view', 'sequence');
    else url.searchParams.delete('view');
    return url.toString();
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

  useEffect(() => {
    const isTyping = (e) => e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
    const isButton = (e) => e.target instanceof HTMLElement && e.target.closest('button, [role="button"]');
    const onKeyDown = (e) => {
      if (isTyping(e)) return;
      if (e.code === 'Space') {
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
  }, [go, step, last, togglePlay]);

  const analogs = useMemo(() => analogsOf(cur, { networkId, flowId: scenario.flowId }), [cur, networkId, scenario.flowId]);
  const networkFlows = FLOWS[networkId] ?? {};

  return (
    <div style={{ background: BG, fontFamily: SANS, color: '#dbe4f3', minHeight: '100%' }} className="w-full">
      <div className="mx-auto max-w-[1500px] px-4 py-4">
        <header className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-white">How a mobile core actually carries a session</h1>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', color: '#63799c' }}>
            4G EPC · 5G NSA / SA · IMS · MESSAGING — ERICSSON NODE NAMING
          </p>
          <p className="basis-full text-xs" style={{ color: '#6d82a5' }}>
            Pick a network and a session type, then watch the signalling walk the reference points one message at a time.
            <span style={{ fontFamily: MONO, color: '#4d618a' }}> Space play/pause · ←/→ step · Home/End</span>
          </p>
        </header>

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
                activeGlossaryKey={glossaryTarget?.key ?? null}
                maxHeight={DIAGRAM_MAX_HEIGHT}
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
                activeGlossaryKey={glossaryTarget?.key ?? null}
                maxHeight={DIAGRAM_MAX_HEIGHT}
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

            <Legend />
          </div>

          <aside className="mt-3 flex min-h-0 flex-col gap-3 xl:sticky xl:top-3 xl:mt-0 xl:max-h-[calc(100vh-1.5rem)] xl:overflow-y-auto xl:pr-0.5">
            {quizOpen ? (
              <Quiz scenario={scenario} geo={geo} onGo={go} onClose={() => setQuizOpen(false)} />
            ) : (
              <>
                <FlowOverview scenario={scenario} onGlossaryOpen={openGlossaryTerm} activeGlossaryKey={glossaryTarget?.key ?? null} />
                <StepDetail
                  cur={cur}
                  step={step}
                  stepsLength={scenario.steps.length}
                  topology={scenario.topology}
                  accent={accent}
                  onGlossaryOpen={openGlossaryTerm}
                  activeGlossaryKey={glossaryTarget?.key ?? null}
                  analogs={analogs}
                  onJumpAnalog={jumpToAnalog}
                  shareUrl={shareUrl}
                />
                <StepList steps={scenario.steps} step={step} onGo={go} />
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
        />

        <p className="mt-4 text-xs leading-relaxed" style={{ color: '#4d618a' }}>
          {autolinkAcronyms(
            "Roaming swaps S5 for S8 with the P-GW in the home network. CUPS splits the EPG into EPG-C and EPG-U over Sx, which is the same control/user separation you'll meet again as SMF and UPF in 5G — where the EIR becomes the 5G-EIR on N17, and SMS keeps working over NAS through the AMF and an SMSF.",
            GLOSSARY,
            { activeKey: glossaryTarget?.key, onOpen: openGlossaryTerm },
          )}
        </p>
      </div>

      <GlossaryPopover target={glossaryTarget} glossary={GLOSSARY} onClose={closeGlossaryTerm} />
    </div>
  );
}
