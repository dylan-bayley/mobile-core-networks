export const label = 'Terminating voice call';
export const blurb = 'A call arrives for an idle handset: Downlink Data Notification, paging, Service Request — then the same IMS setup in reverse';

export const steps = [
  { id: 'mt-lir', t: 'Terminating INVITE: I-CSCF finds the S-CSCF', m: 'Cx LIR / LIA', p: ['cscf', 'hss'], rt: true, k: 'diameter',
    d: 'A call for our subscriber arrives from the originating side — another operator via the IBCF, the PSTN via the MGCF, or an on-net caller. The I-CSCF asks the HSS over Cx which S-CSCF holds this subscriber\'s registration (Location-Info-Request / Answer) and forwards the INVITE there.' },
  { id: 'mt-terminating-services', t: 'Terminating iFC → MTAS', m: 'ISC INVITE', p: ['cscf', 'mtas'], rt: true, k: 'ims',
    d: 'The S-CSCF evaluates terminating initial Filter Criteria and hands the INVITE to the MTAS, which applies terminating MMTel services: call forwarding, barring, do-not-disturb, simultaneous ringing. If a diversion applies, the call leaves here and never reaches the handset.' },
  { id: 'mt-invite-to-pcscf', t: 'INVITE towards the P-CSCF', m: 'INVITE (Mw)', p: ['cscf', 'sbg'], k: 'ims',
    d: 'With no diversion, the S-CSCF routes to the P-CSCF contact the UE registered — the SBG — which must now deliver it over Gm. But the handset has been idle: its radio connection was released after the last burst of activity, and the QCI 5 signalling bearer currently has no S1-U leg to any eNodeB.' },
  { id: 'mt-downlink-data', t: 'Downlink packet with nowhere to go', m: 'S11 Downlink Data Notification', p: ['sbg', 'pgw', 'sgw', 'mme'], k: 'control',
    d: "The INVITE is just an IP packet on the QCI 5 bearer. It reaches the S-GW over S5, but the S-GW holds no eNodeB TEID for this UE — that leg was torn down when the UE went idle. The S-GW buffers the packet and sends the MME a Downlink Data Notification." },
  { id: 'mt-paging', t: 'Paging', m: 'S1AP Paging', p: ['mme', 'enb', 'ue'], k: 'control',
    d: "The MME knows the UE only to Tracking-Area granularity, so it sends S1AP Paging to every eNodeB in the UE's TA list — last-known cell first if that optimisation is on. Each eNodeB broadcasts the page on the PCCH using the UE's S-TMSI, and the UE, waking on its paging occasion every DRX cycle, hears its identity.",
    pitfall: "Paging is a classic capacity trade-off: a large TA list means fewer TAUs but more cells paged per call. A subscriber who is 'reachable for data but calls go to voicemail' usually has a paging problem, not an IMS one." },
  { id: 'mt-service-request', t: 'Service Request', m: 'RRC setup + NAS Service Request', p: ['ue', 'enb', 'mme'], k: 'radio',
    d: 'The UE answers by setting up an RRC connection and sending a NAS Service Request. The MME validates it against the stored security context — no new AKA needed — and sends Initial Context Setup to re-establish every active E-RAB: the internet bearer and the QCI 5 IMS bearer.' },
  { id: 'mt-modify-bearer', t: 'S1-U re-established', m: 'S11 Modify Bearer Request', p: ['mme', 'sgw'], k: 'control',
    d: "The eNodeB's fresh S1-U TEIDs go to the S-GW in a Modify Bearer Request, and the S-GW releases the buffered INVITE. This detour typically costs 100–300 ms, which is why mobile-terminated call setup is measurably slower than mobile-originated." },
  { id: 'mt-invite-delivered', t: 'INVITE reaches the handset', m: 'INVITE (Gm)', p: ['sbg', 'ue'], k: 'ims',
    d: 'The INVITE finally arrives over Gm. The UE checks the SDP offer, picks a codec it supports, and answers with 183 Session Progress carrying its own SDP — the mirror image of what the originating handset did.' },
  { id: 'mt-183-and-rx', t: 'Media authorisation for the B-party', m: '183 → Rx AAR / AAA', p: ['ue', 'sbg', 'pcrf'], k: 'diameter',
    d: "The P-CSCF sees the SDP answer and asks the PCRF to authorise the media on this side — the same Rx exchange the A-party's network did. SAPC in turn pushes a Gx RAR to the P-GW for a QCI 1 dedicated bearer." },
  { id: 'mt-dedicated-bearer', t: 'Dedicated QCI 1 bearer', m: 'Create Bearer → E-RAB Setup', p: ['pgw', 'sgw', 'mme', 'enb', 'ue'], k: 'control',
    d: 'The network-initiated dedicated bearer comes down through S5, S11 and S1, and the eNodeB reconfigures the radio for GBR voice. Only once this completes does the handset start ringing — preconditions again.' },
  { id: 'mt-ringing-answer', t: 'Ringing and answer', m: '180 → 200 OK → ACK', p: ['ue', 'sbg', 'cscf'], rt: true, k: 'ims',
    d: '180 Ringing goes back towards the caller; when the user picks up, 200 OK follows and the caller\'s ACK completes the dialog. All of it on QCI 5.' },
  { id: 'media-flowing', t: 'Voice media flowing', m: 'RTP / RTCP', p: ['ue', 'enb', 'sgw', 'pgw', 'sbg'], k: 'media',
    d: "Two-way RTP on the QCI 1 bearer, anchored at the SBG's IMS-AGW. From here on the call is indistinguishable from one this handset originated." },
];

export const ambient = [{ afterId: 'media-flowing', p: ['ue', 'enb', 'sgw', 'pgw', 'sbg'], k: 'media' }];
