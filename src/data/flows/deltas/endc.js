import { insertAfter, insertBefore, append, patch } from '../compose.js';

/**
 * EN-DC (5G NSA): once the UE has attached and its default bearer is up over
 * the LTE anchor, the eNodeB can add a secondary gNB purely for extra
 * user-plane throughput — the SgNB Addition procedure. Everything before
 * `afterId` (attach, security, session setup) is untouched; this only adds
 * the NR leg and re-routes the final traffic step through it.
 */
export function makeEndcAdditionDelta({ afterId, trafficStepId = 'user-plane-traffic' }) {
  return [
    insertAfter(
      afterId,
      { id: 'meas-config', t: 'Measurement configuration for NR', m: 'RRCConnectionReconfiguration (measConfig)', p: ['enb', 'ue'], k: 'radio',
        d: 'With the default bearer up, the eNodeB configures the UE to measure neighbouring NR cells (event B1: an NR cell becomes good enough to add as a secondary). This is purely a throughput play — nothing about the LTE anchor or the bearer just established changes.' },
      { id: 'b1-report', t: 'B1 measurement report', m: 'Measurement Report (B1 NR)', p: ['ue', 'enb'], k: 'radio',
        d: 'The UE reports a suitable NR cell. The eNodeB — still the master node and the only one with an S1-MME control-plane connection — decides whether to add it as a secondary gNB (SgNB).' },
      { id: 'sgnb-addition', t: 'SgNB Addition procedure', m: 'X2-AP SgNB Addition Request / ACK', p: ['enb', 'gnb'], rt: true, k: 'control',
        d: 'Master eNodeB asks the candidate gNB, over X2-C, to allocate resources for this UE as a secondary node. The SgNB Addition Request carries the UE context and requested capacity; the ACK carries back the radio resource configuration for the new NR secondary cell group (SCG).' },
      { id: 'rrc-reconfig-scg', t: 'RRC reconfiguration adds the SCG', m: 'RRCConnectionReconfiguration (SCG config)', p: ['enb', 'ue'], k: 'radio',
        d: "The eNodeB — the UE's only RRC anchor in EN-DC — forwards the gNB's radio configuration to the UE inside its own RRC message. The UE never talks RRC directly to the gNB; the eNodeB stays the single point of control." },
      { id: 'nr-random-access', t: 'Random access to the gNB', m: 'RACH (SCG)', p: ['ue', 'gnb'], k: 'radio',
        d: 'The UE performs random access on the new NR secondary cell and confirms the reconfiguration back to the eNodeB. From here the UE has two simultaneous radio legs: LTE PCell for the master, NR SCell(s) for the secondary.' },
      { id: 'scg-bearer-active', t: 'Split/SCG bearer active', m: 'X2-U + S1-U (SCG bearer)', p: ['gnb', 'sgw'], k: 'user',
        d: 'The user-plane path for this bearer now runs UE↔gNB over the air, gNB↔S-GW directly over a dedicated S1-U — the "SCG bearer" option most EN-DC deployments use, which bypasses the eNodeB entirely for the bulk of the data instead of splitting it across both legs.' },
    ),
    patch(trafficStepId, () => ({
      m: 'GTP-U payload (SCG bearer)',
      tag: 'nsa',
      p: ['ue', 'gnb', 'sgw', 'pgw', 'inet'],
      d: 'Traffic for this bearer now rides the NR secondary: UE↔gNB on the air interface, then straight to the S-GW over the SCG bearer\'s own S1-U, and out through P-GW/SGi exactly as before. The eNodeB keeps the RRC/S1-MME control connection but is no longer in the user-plane path for this bearer — which is the entire point of adding NR here.',
    })),
  ];
}

/**
 * Voice in EN-DC has no separate 5G core to "fall back" from — IMS
 * registration already rides the LTE anchor, so a call is just VoLTE. The
 * one thing that changes is the NR secondary: most EN-DC deployments
 * release or suspend it for the call's duration rather than try to
 * coordinate guaranteed-bit-rate scheduling across two independently
 * scheduled radios.
 */
export function makeNrLegReleaseDelta({ beforeId, afterId }) {
  return [
    insertBefore(beforeId, {
      id: 'scg-release-for-voice',
      t: 'NR secondary released for the call',
      m: 'X2-AP SgNB Release',
      p: ['enb', 'gnb'],
      k: 'control',
      tag: 'nsa',
      d: "Many EN-DC deployments release or suspend the NR secondary before a voice call sets up: the eNodeB alone can't guarantee QCI 1's scheduling budget across two independently-scheduled cells, so it's simpler to drop to LTE-only for the call's duration. This is an implementation choice, not a 3GPP mandate — some networks leave the SCG up throughout. Either way, the call itself is plain VoLTE: IMS already registered over the LTE anchor, nothing 5G-specific about the signalling that follows.",
    }),
    insertAfter(afterId, {
      id: 'sgnb-readd',
      t: 'NR secondary re-added after the call',
      m: 'X2-AP SgNB Addition Request / ACK',
      p: ['enb', 'gnb'],
      rt: true,
      k: 'control',
      tag: 'nsa',
      d: 'Once the QCI 1 bearer is torn down, the eNodeB re-runs SgNB Addition to bring the throughput-boosting NR secondary back for the data bearer — the same procedure used when EN-DC was first established.',
    }),
  ];
}
