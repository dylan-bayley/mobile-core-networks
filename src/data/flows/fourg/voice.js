export const label = 'Voice call';
export const blurb = 'IMS registration, call setup and a dedicated QCI 1 bearer';

export const steps = [
  { id: 'ims-pdn', t: 'Second PDN to the ims APN', m: 'IMS PDN connectivity', p: ['ue', 'enb', 'sgw', 'pgw'], k: 'control',
    d: 'VoLTE needs its own PDN connection to the ims APN, with a default bearer on QCI 5 — non-GBR, priority 1 — reserved for SIP. The P-CSCF address is returned to the UE in the PCO of the Create Session Response.' },
  { id: 'sip-register', t: 'SIP REGISTER', m: 'REGISTER', p: ['ue', 'sbg'], k: 'ims',
    d: 'The UE registers over the QCI 5 bearer. Gm terminates on the Ericsson SBG, which hosts the P-CSCF signalling function alongside the IMS-AGW that will later handle the media.' },
  { id: 'scscf-assignment', t: 'S-CSCF assignment', m: 'Mw + Cx UAR / UAA', p: ['sbg', 'cscf', 'hss'], rt: true, k: 'ims',
    d: 'P-CSCF forwards to the I-CSCF, which queries the HSS over Cx to select an S-CSCF for this subscriber. Ericsson runs I-CSCF and S-CSCF as one CSCF node, virtualised as part of Cloud IMS.' },
  { id: 'ims-aka', t: 'IMS-AKA challenge', m: '401 → REGISTER → 200 OK', p: ['cscf', 'sbg', 'ue'], rt: true, k: 'ims',
    d: 'S-CSCF challenges with a 401; the UE computes the response on its ISIM and re-REGISTERs. S-CSCF then downloads the service profile with Cx SAR/SAA, and IPsec security associations come up on Gm.' },
  { id: 'third-party-register', t: 'Third-party REGISTER', m: 'ISC REGISTER', p: ['cscf', 'mtas'], k: 'ims',
    d: "Initial Filter Criteria in the service profile trigger a third-party REGISTER towards the MTAS, Ericsson's MMTel application server. MTAS pulls the telephony data it needs — diversion, barring, CLI presentation — from the HSS over Sh." },
  { id: 'invite-sdp-offer', t: 'INVITE with SDP offer', m: 'INVITE (SDP)', p: ['ue', 'sbg', 'cscf'], k: 'ims',
    d: "A-party sends INVITE with an SDP offer: AMR or AMR-WB codec, RTP and RTCP ports, and preconditions required so the phone can't ring before a media bearer exists." },
  { id: 'originating-services', t: 'Originating services and routing', m: 'iFC → MTAS → ENUM', p: ['cscf', 'mtas'], rt: true, k: 'ims',
    d: 'MTAS applies originating MMTel services, then the dialled E.164 number is resolved through ENUM/DNS. On-net it routes to the terminating S-CSCF; off-net it heads for another operator or the PSTN.' },
  { id: '183-session-progress', t: '183 Session Progress', m: '183 (SDP answer)', p: ['cscf', 'sbg'], k: 'ims',
    d: 'The far end answers with its SDP. Codec and media addresses are agreed, so the network now knows exactly how much bandwidth to reserve and for which 5-tuple.' },
  { id: 'rx-aar', t: 'Media authorisation', m: 'Rx AAR / AAA', p: ['sbg', 'pcrf'], rt: true, k: 'diameter',
    d: 'P-CSCF passes the negotiated media description to the PCRF over Rx. This is the hinge between IMS and the packet core — SAPC turns a SIP session description into a policy decision.' },
  { id: 'gx-rar', t: 'PCC rule pushed to the P-GW', m: 'Gx RAR / RAA', p: ['pcrf', 'pgw'], rt: true, k: 'diameter',
    d: 'SAPC sends an unsolicited Re-Auth Request installing a rule for a dedicated GBR bearer: QCI 1, ARP per operator policy, GBR and MBR sized from the codec, and a TFT matching the RTP flow.' },
  { id: 'create-bearer-request', t: 'Create Bearer Request', m: 'Create Bearer Req', p: ['pgw', 'sgw', 'mme'], k: 'control',
    d: 'The P-GW initiates the dedicated bearer downwards through S5 and S11. Note the direction: unlike attach, the network pushes this one, not the UE.' },
  { id: 'e-rab-setup', t: 'E-RAB setup on the radio', m: 'E-RAB Setup Request', p: ['mme', 'enb', 'ue'], k: 'control',
    d: 'The eNodeB admission-controls the GBR bearer and reconfigures the radio: dedicated bearer on QCI 1, RoHC to compress the IP/UDP/RTP header, and typically semi-persistent scheduling or TTI bundling at cell edge.' },
  { id: 'alerting-answer', t: 'Alerting and answer', m: '180 → 200 OK → ACK', p: ['ue', 'sbg', 'cscf'], rt: true, k: 'ims',
    d: 'With preconditions met the far end can ring. 180 Ringing, then 200 OK and ACK. All of this signalling stays on the QCI 5 bearer, separate from the voice itself.' },
  { id: 'media-flowing', t: 'Voice media flowing', m: 'RTP / RTCP', p: ['ue', 'enb', 'sgw', 'pgw', 'sbg'], k: 'media',
    d: "RTP rides the QCI 1 dedicated bearer: 100 ms packet delay budget, 10⁻² loss rate, guaranteed bit rate. Media passes through the SBG's IMS-AGW for topology hiding and transcoding where the far end needs it." },
  { id: 'pstn-breakout', t: 'PSTN breakout, if off-net', m: 'SIP → ISUP', p: ['cscf', 'mgcf', 'pstn'], k: 'tdm',
    d: 'For a fixed or legacy mobile number, the MGCF interworks SIP to ISUP or BICC and the Ericsson M-MGw handles the media, transcoding AMR to G.711.' },
  { id: 'release-srvcc', t: 'Release — and SRVCC', m: 'BYE → Rx STR → Delete Bearer', p: ['ue', 'sbg', 'pcrf'], k: 'ims',
    d: 'BYE triggers an Rx Session Termination, SAPC withdraws the rule over Gx and the QCI 1 bearer is deleted; QCI 5 stays up for the next call. If the UE runs out of LTE coverage mid-call, the MME triggers SRVCC over Sv and the MSC-S continues the call on WCDMA or GSM.' },
];

export const ambient = [{ afterId: 'media-flowing', p: ['ue', 'enb', 'sgw', 'pgw', 'sbg'], k: 'media' }];
