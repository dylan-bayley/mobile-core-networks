import { insertAfter, insertBefore, patch } from '../compose.js';

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
        d: 'The UE performs random access on the new NR secondary cell and confirms the reconfiguration back to the eNodeB. From here the UE has two simultaneous radio legs: the LTE PCell for the master, and the NR PSCell (plus any further NR SCells) for the secondary.' },
      { id: 'e-rab-modification', t: 'S-GW switches the downlink to the gNB', m: 'E-RAB Modification Indication → Modify Bearer', p: ['enb', 'mme', 'sgw'], k: 'control',
        d: "The S-GW still sends this bearer's downlink to the eNodeB and doesn't know the gNB exists. So the eNodeB sends an E-RAB Modification Indication to the MME with the gNB's S1-U address and tunnel ID, and the MME passes them to the S-GW in a Modify Bearer Request. From now on the downlink for the bearer goes to the gNB." },
      { id: 'scg-bearer-active', t: 'Split/SCG bearer active', m: 'X2-U + S1-U (SCG bearer)', p: ['gnb', 'sgw'], k: 'user',
        d: 'The user-plane path for this bearer now runs UE↔gNB over the air, gNB↔S-GW directly over S1-U. This is drawn as an SCG bearer, which bypasses the eNodeB for this bearer\'s data; many deployments instead use a split bearer terminated at the gNB (the industry\'s "option 3x"), where the gNB also forwards part of the traffic over X2-U to the eNodeB. Either way the S-GW now talks to the gNB.' },
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
 * one thing that changes is the NR secondary: many EN-DC deployments
 * release or suspend it when the call's QCI 1 bearer is set up, rather than
 * try to coordinate guaranteed-bit-rate scheduling across two independently
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
      d: "When the QCI 1 bearer for the call arrives, many EN-DC deployments release or suspend the NR secondary: guaranteeing QCI 1's scheduling budget across two independently scheduled cells is hard, so it's simpler to drop to LTE-only for the call's duration. Either way, the call itself is plain VoLTE: IMS registered over the LTE anchor long before, and nothing in the call signalling is 5G-specific.",
      pitfall: 'This is an implementation choice, not a 3GPP mandate — some networks leave the SCG up throughout. If VoLTE call quality differs between 4G-only and NSA handsets on the same network, this setting is the first place to look.',
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
