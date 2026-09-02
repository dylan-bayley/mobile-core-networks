import { compose, insertBefore, removeStep, patch } from '../compose.js';
import { steps as vonrSteps } from './voice.js';

export const label = 'Voice call — EPS fallback';
export const blurb = 'The call starts on 5G SA, but the network moves the handset to LTE to actually carry it: N26, TAU, and a QCI 1 bearer in the EPC';
export const topologyId = 'epsfb';

/*
 * Everything up to media authorisation is VoNR; the difference begins when
 * the gNB is asked for the 5QI 1 QoS Flow and declines.
 */
export const steps = compose(
  vonrSteps,
  removeStep('n4-qos-flow-update'),
  removeStep('n2-resource-setup'),
  insertBefore(
    'alerting-answer',
    { id: 'epsfb-n2-reject', t: 'gNB refuses the voice QoS Flow', m: 'N2 PDU Session Resource Modify → reject', p: ['amf', 'gnb'], rt: true, k: 'control', tag: 'epsfb',
      d: "The AMF asks the gNB to add the 5QI 1 QoS Flow. This gNB doesn't carry voice over NR — no VoNR feature licensed, no RAN support yet, or the cell is too marginal — so it rejects with cause 'IMS voice EPS fallback or RAT fallback triggered'. The SMF is told the flow could not be set up; nothing is torn down." },
    { id: 'epsfb-redirect', t: 'Redirect (or handover) to LTE', m: 'RRC Release with redirection', p: ['gnb', 'ue'], k: 'radio', tag: 'epsfb',
      d: 'The gNB moves the UE to LTE either by RRC Release with redirection information (fast, drops to idle on LTE) or by an inter-system handover coordinated over N26 (seamless, keeps the connection). Redirection is far more common in early deployments because it needs no handover preparation between the two RANs.' },
    { id: 'epsfb-tau', t: 'TAU into the EPC with the mapped GUTI', m: 'TAU Request (handover indication)', p: ['ue', 'enb', 'mme'], k: 'control', tag: 'epsfb', analog: { net: '4g', flow: 'data-idle', id: 'tau-request' },
      d: 'The UE arrives on LTE and sends a TAU Request carrying its 5G-GUTI mapped into EPS GUTI format. The MME recognises a mapped identity and knows the context lives in an AMF, not another MME.' },
    { id: 'epsfb-n26', t: 'MME pulls the UE context over N26', m: 'N26 Context Request / Response', p: ['mme', 'amf'], rt: true, k: 'control', tag: 'epsfb',
      d: "N26 is the MME↔AMF interface for 4G⇄5G interworking. The AMF hands over the security context and the PDU Sessions, which the MME re-expresses as PDN connections with EPS bearers. Without N26 the UE would have to attach from scratch and re-register with IMS — far too slow for a call in progress." },
    { id: 'epsfb-bearers', t: 'Bearers re-created in the EPC', m: 'S11 / S5 Create Session', p: ['mme', 'sgw', 'pgw'], k: 'control', tag: 'epsfb', analog: { net: '4g', flow: 'data', id: 'create-session-request' },
      d: 'The MME sets up S-GW and P-GW bearers for each PDN connection. The P-GW is the same combined SMF+PGW-C / UPF+PGW-U node that served the SA session, so the UE keeps its IP address — which is what keeps the IMS registration and the half-built SIP dialog alive.' },
    { id: 'epsfb-tau-accept', t: 'TAU Accept — the UE is on LTE', m: 'TAU Accept', p: ['mme', 'enb', 'ue'], k: 'control', tag: 'epsfb',
      d: 'The eNodeB re-establishes the radio bearers, including the QCI 5 one carrying SIP, and the TAU completes. From the IMS core\'s point of view nothing has happened: same P-CSCF, same registration, same dialog.' },
    { id: 'epsfb-qci1', t: 'Dedicated QCI 1 bearer on LTE', m: 'Gx RAR → Create Bearer → E-RAB Setup', p: ['pcf', 'pgw', 'sgw', 'mme', 'enb', 'ue'], k: 'control', tag: 'epsfb', analog: { net: '4g', flow: 'voice', id: 'create-bearer-request' },
      d: 'The PCF — acting as the PCRF over Gx towards the combined gateway — now installs the voice rule on the EPC side. A Create Bearer Request for QCI 1 comes down through S5, S11 and S1, and the eNodeB sets up the E-RAB. The IMS session that began on 5G finishes setting up on 4G.',
      pitfall: 'The whole fallback adds one to two seconds to call setup — the single biggest reason operators eventually turn on VoNR. When a 5G SA handset shows slow call setup, first check whether the call is actually landing on LTE.' },
  ),
  patch('alerting-answer', (s) => ({ d: `${s.d} By now the handset is on LTE, so "5QI 5" is really the QCI 5 bearer the EPC just rebuilt.` })),
  patch('media-flowing', () => ({
    m: 'RTP / RTCP (VoLTE)',
    p: ['ue', 'enb', 'sgw', 'pgw', 'sbg'],
    d: "The media flows as ordinary VoLTE over the LTE QCI 1 bearer through S-GW and P-GW to the SBG's IMS-AGW. A 5G icon on the phone a moment ago; a 4G call now.",
  })),
  patch('release', (s) => ({
    m: 'BYE → Rx STR → Delete Bearer → back to NR',
    d: `${s.d.split(' There')[0]} Once the QCI 1 bearer is gone the eNodeB can release the UE with redirection back to NR, or the UE simply reselects a 5G cell — and the next call will fall back all over again.`,
  })),
);

export const ambient = [{ afterId: 'media-flowing', p: ['ue', 'enb', 'sgw', 'pgw', 'sbg'], k: 'media' }];
