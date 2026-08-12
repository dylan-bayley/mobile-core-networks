export const label = 'Voice call';
export const blurb = 'VoNR — native 5G voice, no CS fallback and no LTE anchor involved';

export const steps = [
  { id: 'ims-pdu-session', t: 'PDU Session to the ims DNN', m: 'IMS PDU Session', p: ['ue', 'gnb', 'upf'], k: 'control',
    d: 'VoNR needs its own PDU Session to the ims DNN, with a default QoS Flow on 5QI 5 — non-GBR, priority 1 — reserved for SIP. The P-CSCF address comes back to the UE in the PDU Session Establishment Accept, the same PCO-style container 4G used.' },
  { id: 'sip-register', t: 'SIP REGISTER', m: 'REGISTER', p: ['ue', 'sbg'], k: 'ims',
    d: 'The UE registers over the 5QI 5 QoS Flow. Gm still terminates on the same SBG that serves 4G VoLTE traffic — the IMS core is shared across access types, which is the whole point of separating it from the packet core underneath.' },
  { id: 'scscf-assignment', t: 'S-CSCF assignment', m: 'Mw + Cx UAR / UAA', p: ['sbg', 'cscf', 'hss'], rt: true, k: 'ims',
    d: 'Unchanged from 4G: P-CSCF forwards to I-CSCF, which queries the converged UDM/HSS over Cx to pick an S-CSCF. The IMS core has no idea whether the UE arrived over LTE or NR.' },
  { id: 'ims-aka', t: 'IMS-AKA challenge', m: '401 → REGISTER → 200 OK', p: ['cscf', 'sbg', 'ue'], rt: true, k: 'ims',
    d: 'S-CSCF challenges with a 401; the UE answers on its ISIM and re-REGISTERs. IMS-AKA is layered on top of IMS itself and is completely independent of whether the access network is EPC or 5GC.' },
  { id: 'third-party-register', t: 'Third-party REGISTER', m: 'ISC REGISTER', p: ['cscf', 'mtas'], k: 'ims',
    d: 'iFC triggers a third-party REGISTER to the same MTAS that serves VoLTE, which pulls telephony data from the UDM/HSS over Sh — again, no change from 4G.' },
  { id: 'invite-sdp-offer', t: 'INVITE with SDP offer', m: 'INVITE (SDP)', p: ['ue', 'sbg', 'cscf'], k: 'ims',
    d: 'A-party sends INVITE with an SDP offer — EVS is the headline codec for VoNR (wider bandwidth than AMR-WB), falling back to AMR-WB where the far end or transcoder needs it. Preconditions still apply: no ringing before media resources exist.' },
  { id: 'originating-services', t: 'Originating services and routing', m: 'iFC → MTAS → ENUM', p: ['cscf', 'mtas'], rt: true, k: 'ims',
    d: 'Same MMTel services, same ENUM/DNS-based routing decision between on-net and off-net as 4G — this layer of IMS is genuinely access-agnostic.' },
  { id: '183-session-progress', t: '183 Session Progress', m: '183 (SDP answer)', p: ['cscf', 'sbg'], k: 'ims',
    d: "The far end's SDP answer settles codec and media addresses, so the network knows exactly what to reserve." },
  { id: 'rx-aar', t: 'Media authorisation', m: 'N5 (Npcf_PolicyAuthorization)', p: ['sbg', 'pcf'], rt: true, k: 'sbi',
    d: 'P-CSCF passes the negotiated media description to the PCF — over N5, the SBI-based successor to 4G\'s Rx. Same hinge point between IMS and the packet core, now a service call instead of a Diameter exchange.' },
  { id: 'sm-policy-update', t: 'QoS rule pushed to the SMF', m: 'Npcf_SMPolicyControl (Update)', p: ['pcf', 'smf'], rt: true, k: 'sbi',
    d: 'PCF pushes an updated SM policy to the SMF for the ims PDU Session: a new QoS Flow, 5QI 1, GBR/MBR sized from the codec, and a packet filter matching the RTP flow — the direct equivalent of 4G\'s Gx RAR installing a QCI 1 bearer.' },
  { id: 'n4-qos-flow-update', t: 'N4 Session Modification adds the QoS Flow', m: 'PFCP Session Modification', p: ['smf', 'upf'], k: 'control',
    d: 'SMF pushes the new QoS Flow\'s forwarding and enforcement rules into the UPF over N4 — the SMF still never touches the voice packets themselves.' },
  { id: 'n2-resource-setup', t: 'N2 resource setup on the radio', m: 'N2 Request → RRC Reconfig', p: ['amf', 'gnb', 'ue'], k: 'control',
    d: "AMF signals the new QoS Flow to the gNB over N2; the gNB admission-controls the GBR resource and reconfigures the radio with a new Data Radio Bearer mapped to 5QI 1. The RAN-side mechanics are the same shape as 4G's E-RAB setup." },
  { id: 'alerting-answer', t: 'Alerting and answer', m: '180 → 200 OK → ACK', p: ['ue', 'sbg', 'cscf'], rt: true, k: 'ims',
    d: '180 Ringing, then 200 OK and ACK, all riding the 5QI 5 signalling flow — separate from the voice media itself, exactly as in 4G.' },
  { id: 'media-flowing', t: 'Voice media flowing', m: 'RTP / RTCP', p: ['ue', 'gnb', 'upf', 'sbg'], k: 'media',
    d: "RTP rides the 5QI 1 QoS Flow over N3 to the UPF and out to the SBG's IMS-AGW for topology hiding and any transcoding the far end needs — EVS end to end if both sides support it, otherwise transcoded to AMR-WB or G.711 at the MGCF/M-MGw for off-net calls." },
  { id: 'pstn-breakout', t: 'PSTN breakout, if off-net', m: 'SIP → ISUP', p: ['cscf', 'mgcf', 'pstn'], k: 'tdm',
    d: 'Unchanged from 4G: the MGCF interworks SIP to ISUP/BICC and the M-MGw handles the media and any transcoding.' },
  { id: 'release', t: 'Release', m: 'BYE → N5 termination → QoS Flow removal', p: ['ue', 'sbg', 'pcf'], k: 'ims',
    d: "BYE triggers session termination over N5, the PCF withdraws the QoS Flow rule, and the SMF removes it via N4; the 5QI 5 signalling flow stays up for the next call. There's no SRVCC step here — VoNR assumes a network that doesn't need to hand a voice call back to a CS domain that, in a genuinely CS-free 5G SA deployment, may not exist. Interworking back to LTE/EPC (via N26) for coverage reasons is a separate mechanism, not modelled here." },
];

export const ambient = [{ afterId: 'media-flowing', p: ['ue', 'gnb', 'upf', 'sbg'], k: 'media' }];
