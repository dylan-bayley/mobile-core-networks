export const label = 'Terminating voice call';
export const blurb = 'A VoNR call arrives for an idle handset: N4 data report, N1N2 transfer, paging, Service Request — then IMS setup in reverse';

const fourg = (id) => ({ net: '4g', flow: 'voice-mt', id });

export const steps = [
  { id: 'mt-lir-5g', t: 'Terminating INVITE: I-CSCF finds the S-CSCF', m: 'Cx LIR / LIA', p: ['cscf', 'hss'], rt: true, k: 'diameter', analog: fourg('mt-lir'),
    d: 'Identical to 4G — the IMS core does not know or care which access the called party is on. The I-CSCF asks the converged UDM/HSS over Cx which S-CSCF holds the registration and forwards the INVITE there.' },
  { id: 'mt-terminating-services-5g', t: 'Terminating iFC → MTAS', m: 'ISC INVITE', p: ['cscf', 'mtas'], rt: true, k: 'ims', analog: fourg('mt-terminating-services'),
    d: 'Terminating initial Filter Criteria route the INVITE through the MTAS for forwarding, barring and the other MMTel terminating services — unchanged from VoLTE.' },
  { id: 'mt-invite-to-pcscf-5g', t: 'INVITE towards the P-CSCF', m: 'INVITE (Mw)', p: ['cscf', 'sbg'], k: 'ims', analog: fourg('mt-invite-to-pcscf'),
    d: 'The S-CSCF routes to the registered P-CSCF contact. The handset is idle: RRC released, no N3 tunnel for its ims PDU Session, only the 5QI 5 QoS Flow definition and its IP address surviving in the SMF and UPF.' },
  { id: 'mt-downlink-data-5g', t: 'Downlink packet with nowhere to go', m: 'N4 Report → N1N2MessageTransfer', p: ['sbg', 'upf', 'smf', 'amf'], k: 'control', analog: fourg('mt-downlink-data'),
    d: "The INVITE reaches the UPF over N6, but the UPF has no N3 tunnel for this UE. Following the buffering rule the SMF installed, it reports the packet over N4 (PFCP Session Report); the SMF asks the AMF to reach the UE with Namf_Communication_N1N2MessageTransfer. Three hops where 4G's S-GW sent one Downlink Data Notification — the cost of splitting the gateway into SMF and UPF." },
  { id: 'mt-paging-5g', t: 'Paging', m: 'N2 Paging', p: ['amf', 'gnb', 'ue'], k: 'control', analog: fourg('mt-paging'),
    d: "The AMF pages every gNB in the UE's registration area (5G's name for the TA list) over N2; each gNB pages on the UE's 5G-S-TMSI at its paging occasion. If the UE was parked in RRC_INACTIVE rather than idle, the gNB handles RAN paging itself and the AMF never hears about it.",
    pitfall: 'Registration areas in 5G can be far larger than LTE TA lists. When MT call-setup metrics diverge between SA and NSA handsets on the same network, compare paging success rates before anything in IMS.' },
  { id: 'mt-service-request-5g', t: 'Service Request', m: 'RRC setup + NAS Service Request', p: ['ue', 'gnb', 'amf'], k: 'radio', analog: fourg('mt-service-request'),
    d: 'The UE sets up RRC and sends a NAS Service Request. The AMF asks the SMF to re-activate the user plane for the listed PDU Sessions (Nsmf_PDUSession_UpdateSMContext) and sends the gNB an N2 PDU Session Resource Setup for each.' },
  { id: 'mt-n4-modification', t: 'N3 re-established', m: 'N4 Session Modification', p: ['amf', 'smf', 'upf'], k: 'control', analog: fourg('mt-modify-bearer'),
    d: "The gNB's new N3 tunnel endpoint comes back through the AMF to the SMF, which pushes it into the UPF over N4. The UPF releases the buffered INVITE. The same 100–300 ms detour as 4G, with one more network function in the loop." },
  { id: 'mt-invite-delivered-5g', t: 'INVITE reaches the handset', m: 'INVITE (Gm)', p: ['sbg', 'ue'], k: 'ims', analog: fourg('mt-invite-delivered'),
    d: 'The INVITE arrives over Gm. The UE picks a codec — EVS if offered — and answers with 183 Session Progress carrying its own SDP.' },
  { id: 'mt-183-and-n5', t: 'Media authorisation for the B-party', m: '183 → N5 (Npcf_PolicyAuthorization)', p: ['ue', 'sbg', 'pcf'], k: 'sbi', analog: fourg('mt-183-and-rx'),
    d: "The P-CSCF asks the PCF over N5 to authorise the media on this side; the PCF updates the SM policy on the SMF with a 5QI 1 QoS Flow — the N5/N7 equivalent of 4G's Rx/Gx pair." },
  { id: 'mt-qos-flow', t: 'Dedicated 5QI 1 QoS Flow', m: 'N4 → N2 Request → RRC Reconfig', p: ['pcf', 'smf', 'amf', 'gnb', 'ue'], k: 'control', analog: fourg('mt-dedicated-bearer'),
    d: "The SMF installs the QoS Flow's rules in the UPF and, via the AMF, asks the gNB to add a GBR Data Radio Bearer mapped to 5QI 1. Only once the radio confirms does the handset ring." },
  { id: 'mt-ringing-answer-5g', t: 'Ringing and answer', m: '180 → 200 OK → ACK', p: ['ue', 'sbg', 'cscf'], rt: true, k: 'ims', analog: fourg('mt-ringing-answer'),
    d: "180 Ringing back towards the caller; 200 OK on answer; the caller's ACK completes the dialog. All on the 5QI 5 flow." },
  { id: 'media-flowing', t: 'Voice media flowing', m: 'RTP / RTCP', p: ['ue', 'gnb', 'upf', 'sbg'], k: 'media', analog: fourg('media-flowing'),
    d: "Two-way RTP on the 5QI 1 QoS Flow over N3, anchored at the SBG's IMS-AGW." },
];

export const ambient = [{ afterId: 'media-flowing', p: ['ue', 'gnb', 'upf', 'sbg'], k: 'media' }];
