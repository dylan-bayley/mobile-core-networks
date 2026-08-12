import { useCallback, useEffect, useMemo, useState } from 'react';
import { NETWORKS, SESSIONS, resolveScenario } from '../data/index.js';
import { validateData } from '../data/validate.js';
import { NODE_MAP_4G } from '../data/reference/nodeNaming.js';
import { QCI } from '../data/reference/qos.js';
import { EIR_STATUS } from '../data/reference/eirStatus.js';
import { makeGeometry } from '../engine/geometry.js';
import { useStepPlayer } from '../engine/useStepPlayer.js';
import { K, BG, MONO, SANS } from '../theme.js';
import SelectorBar from './SelectorBar.jsx';
import TopologyDiagram from './TopologyDiagram.jsx';
import Transport from './Transport.jsx';
import ProgressBar from './ProgressBar.jsx';
import StepDetail from './StepDetail.jsx';
import StepList from './StepList.jsx';
import Legend from './Legend.jsx';
import ReferencePanel from './ReferencePanel.jsx';

export default function Explorer() {
  useEffect(() => {
    if (import.meta.env.DEV) validateData();
  }, []);

  const [networkId, setNetworkId] = useState(NETWORKS[0].id);
  const [sessionId, setSessionId] = useState(SESSIONS[0].id);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [focus, setFocus] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setPlaying(false);
    }
  }, []);

  const scenario = useMemo(() => resolveScenario(networkId, sessionId), [networkId, sessionId]);
  const geo = useMemo(() => makeGeometry(scenario.topology), [scenario.topology]);
  const player = useStepPlayer(scenario.steps, { playing, setPlaying, speed });

  useEffect(() => {
    player.restart();
    setPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId, sessionId]);

  const step = Math.min(player.step, scenario.steps.length - 1);
  const cur = scenario.steps[step];
  const accent = K[cur.k].c;

  const go = useCallback((i) => player.go(i), [player]);
  const switchNetwork = (id) => setNetworkId(id);
  const switchSession = (id) => setSessionId(id);

  return (
    <div style={{ background: BG, fontFamily: SANS, color: '#dbe4f3', minHeight: '100%' }} className="w-full">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <header className="mb-4">
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em', color: '#63799c' }}>
            4G EPC · 5G NSA / SA · IMS · MESSAGING — ERICSSON NODE NAMING
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">How a mobile core actually carries a session</h1>
          <p className="mt-1 text-sm" style={{ color: '#8ea1bf' }}>
            Pick a network and a session type, then watch the signalling walk the reference points, one message at a
            time.
          </p>
        </header>

        <SelectorBar
          networks={NETWORKS}
          sessions={SESSIONS}
          networkId={networkId}
          sessionId={sessionId}
          onNetwork={switchNetwork}
          onSession={switchSession}
          focus={focus}
          onToggleFocus={() => setFocus((f) => !f)}
        />

        <TopologyDiagram
          topology={scenario.topology}
          geo={geo}
          steps={scenario.steps}
          step={step}
          progress={player.progress}
          ambient={scenario.ambient}
          focus={focus}
        />

        <Transport
          step={step}
          stepsLength={scenario.steps.length}
          progress={player.progress}
          playing={playing}
          onTogglePlay={() => setPlaying((p) => !p)}
          onPrev={() => go(Math.max(0, step - 1))}
          onNext={() => go(Math.min(scenario.steps.length - 1, step + 1))}
          onRestart={() => {
            player.restart();
            setPlaying(true);
          }}
          speed={speed}
          onSpeed={setSpeed}
          accent={accent}
        />

        <ProgressBar step={step} progress={player.progress} stepsLength={scenario.steps.length} accent={accent} />

        <div className="mt-4 grid gap-3 lg:grid-cols-5">
          <StepDetail cur={cur} step={step} stepsLength={scenario.steps.length} topology={scenario.topology} accent={accent} />
          <StepList steps={scenario.steps} step={step} blurb={scenario.blurb} onGo={go} />
        </div>

        <Legend />

        <ReferencePanel nodeNaming={NODE_MAP_4G} qci={QCI} fiveQi={null} eirStatus={EIR_STATUS} />

        <p className="mt-4 text-xs leading-relaxed" style={{ color: '#4d618a' }}>
          Roaming swaps S5 for S8 with the P-GW in the home network. CUPS splits the EPG into EPG-C and EPG-U over
          Sx, which is the same control/user separation you'll meet again as SMF and UPF in 5G — where the EIR
          becomes the 5G-EIR on N17, and SMS keeps working over NAS through the AMF and an SMSF.
        </p>
      </div>
    </div>
  );
}
