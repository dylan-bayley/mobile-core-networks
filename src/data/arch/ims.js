/* Lesson 5 — the IP Multimedia Subsystem as a service layer above either
   packet core. Entities and roles follow TS 23.228 (Figure 4.0, clauses 4.6
   and 4.7) and TS 23.002 §4a.7; the access-specific parts follow TS 23.228
   Annex E (EPS) and Annex Y (5GS). The CSCF roles are drawn as separate
   boxes even though products often combine them. */

const IMS_ROWS = { wide: [0, 4.3], narrow: [0, 6.3] };
const BANDS = {
  wide: { ims: IMS_ROWS.wide, core: [4.45, 7] },
  narrow: { ims: IMS_ROWS.narrow, core: [6.4, 11] },
};

/* IMS positions are shared by both accesses; only the packet core changes. */
const IMS_WIDE = {
  icscf: [2, 0.45], scscf: [3.6, 0.45], tas: [5.2, 0.45], mrf: [6.8, 0.45],
  pcscf: [1, 2.1], hss: [2.8, 1.75], bgcf: [4.4, 1.75], ibcf: [5.6, 1.75], other: [7, 1.75],
  mgcf: [4.2, 2.85], agw: [2.2, 3.5], mgw: [5.6, 3.55], pstn: [7, 2.85],
};
const IMS_NARROW = {
  tas: [0.9, 0.4], hss: [2.4, 0.4],
  mrf: [0.1, 1.6], scscf: [1.5, 1.6], icscf: [2.9, 1.6],
  ibcf: [0.3, 2.8], bgcf: [1.5, 2.8], pcscf: [2.9, 2.8],
  other: [0.1, 3.9], mgcf: [1.25, 3.9],
  agw: [1.95, 4.6], mgw: [0.3, 4.75], pstn: [1.1, 5.5],
};

export const diagram = {
  id: 'ims',
  title: 'IMS on top of the packet core',
  grid: {
    wide: { cols: 8, rows: 7, w: 1120, h: 720 },
    narrow: { cols: 4, rows: 11, w: 440, h: 860 },
  },
  nodes: {
    ue: { t: 'UE', s: 'Phone with an ISIM', gen: 'ran' },
    gnb: { t: 'gNB', s: '5G radio', gen: 'ran' },
    enb: { t: 'eNodeB', s: '4G radio', gen: 'ran' },
    amf: { t: 'AMF', s: 'Access & mobility', gen: '5g' },
    smf: { t: 'SMF', s: 'Sessions', gen: '5g' },
    upf: { t: 'UPF', s: 'User plane', gen: '5g' },
    pcf: { t: 'PCF', s: 'Policy', gen: '5g' },
    mme: { t: 'MME', s: 'Mobility', gen: '4g' },
    gw: { t: 'S-GW + P-GW', s: 'EPC gateways', gen: '4g', g: 'P-GW' },
    pcrf: { t: 'PCRF', s: 'Policy', gen: '4g' },
    pcscf: { t: 'P-CSCF', s: 'First SIP hop', gen: 'ims' },
    icscf: { t: 'I-CSCF', s: 'Entry point', gen: 'ims' },
    scscf: { t: 'S-CSCF', s: 'Session control', gen: 'ims' },
    hss: { t: 'HSS', s: 'IMS subscriptions', gen: 'ims' },
    tas: { t: 'TAS', s: 'Telephony services', gen: 'ims' },
    mrf: { t: 'MRF', s: 'Tones, conferences', gen: 'ims' },
    agw: { t: 'IMS-AGW', s: 'Media at the edge', gen: 'ims' },
    bgcf: { t: 'BGCF', s: 'Picks the breakout', gen: 'ims' },
    mgcf: { t: 'MGCF', s: 'SIP ↔ ISUP', gen: 'ims' },
    mgw: { t: 'IMS-MGW', s: 'RTP ↔ circuits', gen: 'ims' },
    ibcf: { t: 'IBCF', s: 'Border to others', gen: 'ims' },
    pstn: { t: 'PSTN', s: 'Circuit network', gen: 'ext' },
    other: { t: 'Other IMS', s: 'Another operator', gen: 'ext', g: 'IMS' },
  },
  layouts: {
    vonr: {
      wide: {
        ...IMS_WIDE,
        ue: [0, 6.25], gnb: [1.4, 6.25], upf: [2.6, 6.25],
        amf: [1.4, 5], smf: [3.6, 5], pcf: [5.6, 5],
      },
      narrow: {
        ...IMS_NARROW,
        amf: [0.2, 8], smf: [1.35, 6.95], pcf: [3, 8.45],
        gnb: [0.2, 9.3], upf: [1.8, 9.5], ue: [0.2, 10.25],
      },
      bands: BANDS,
    },
    volte: {
      wide: {
        ...IMS_WIDE,
        ue: [0, 6.25], enb: [1.4, 6.25], gw: [2.9, 6.25],
        mme: [1.4, 5], pcrf: [5.6, 5],
      },
      narrow: {
        ...IMS_NARROW,
        mme: [0.2, 8], pcrf: [3, 8.45],
        enb: [0.2, 9.3], gw: [2.2, 9.5], ue: [0.2, 10.25],
      },
      bands: BANDS,
    },
  },
  links: [
    // 5G access
    { a: 'ue', b: 'gnb', l: 'NR-Uu', k: 'radio', in: ['vonr'] },
    { a: 'gnb', b: 'amf', l: 'N2', k: 'control', in: ['vonr'] },
    { a: 'gnb', b: 'upf', l: 'N3', k: 'user', in: ['vonr'] },
    { a: 'amf', b: 'smf', l: 'N11', k: 'sbi', in: ['vonr'] },
    { a: 'smf', b: 'upf', l: 'N4', k: 'control', in: ['vonr'] },
    { a: 'smf', b: 'pcf', l: 'N7', k: 'sbi', in: ['vonr'] },
    { a: 'upf', b: 'pcscf', l: 'N6', k: 'user', in: ['vonr'] },
    { a: 'upf', b: 'agw', l: 'N6', k: 'user', in: ['vonr'], labelT: 0.7 },
    { a: 'pcscf', b: 'pcf', l: 'N5', k: 'sbi', in: ['vonr'] },
    // 4G access
    { a: 'ue', b: 'enb', l: 'LTE-Uu', k: 'radio', in: ['volte'] },
    { a: 'enb', b: 'mme', l: 'S1-MME', k: 'control', in: ['volte'] },
    { a: 'enb', b: 'gw', l: 'S1-U', k: 'user', in: ['volte'] },
    { a: 'mme', b: 'gw', l: 'S11', k: 'control', in: ['volte'] },
    { a: 'gw', b: 'pcrf', l: 'Gx', k: 'diameter', in: ['volte'] },
    { a: 'gw', b: 'pcscf', l: 'SGi', k: 'user', in: ['volte'] },
    { a: 'gw', b: 'agw', l: 'SGi', k: 'user', in: ['volte'], labelT: 0.7 },
    { a: 'pcscf', b: 'pcrf', l: 'Rx', k: 'diameter', in: ['volte'] },
    // IMS
    { a: 'pcscf', b: 'icscf', l: 'Mw', k: 'ims' },
    { a: 'icscf', b: 'scscf', l: 'Mw', k: 'ims' },
    { a: 'pcscf', b: 'scscf', l: 'Mw', k: 'ims', labelT: { wide: 0.38, narrow: 0.5 } },
    { a: 'icscf', b: 'hss', l: 'Cx', k: 'diameter' },
    { a: 'scscf', b: 'hss', l: 'Cx', k: 'diameter' },
    { a: 'scscf', b: 'tas', l: 'ISC', k: 'ims' },
    { a: 'tas', b: 'hss', l: 'Sh', k: 'diameter', labelT: 0.57 },
    { a: 'scscf', b: 'mrf', l: 'Mr', k: 'ims', curve: 100 },
    { a: 'pcscf', b: 'agw', l: 'Iq', k: 'ims' },
    { a: 'scscf', b: 'bgcf', l: 'Mi', k: 'ims', labelT: { wide: 0.62, narrow: 0.5 } },
    { a: 'bgcf', b: 'mgcf', l: 'Mj', k: 'ims' },
    { a: 'mgcf', b: 'mgw', l: 'Mn', k: 'ims' },
    { a: 'mgcf', b: 'pstn', l: 'ISUP', k: 'tdm', labelT: { wide: 0.5, narrow: 0.6 } },
    { a: 'scscf', b: 'ibcf', l: 'Mx', k: 'ims' },
    { a: 'ibcf', b: 'other', l: 'Ici', k: 'ims' },
  ],
};

const c228 = (clause) => ({ src: 'ts23228', clause });
const c002 = (clause) => ({ src: 'ts23002', clause });
const c501 = (clause) => ({ src: 'ts23501', clause });

const SIGNAL_UP = ['ue', 'gnb', 'upf', 'pcscf'];
const SIGNAL_DOWN = ['pcscf', 'upf', 'gnb', 'ue'];
const sip = (p, label, n = 1) => ({ p, k: 'ims', n, speed: 0.34, label });

export const scenes = [
  {
    id: 'on-top',
    k: 'ims',
    title: 'IMS sits on top of the packet core',
    layout: 'vonr',
    show: ['ue', 'gnb', 'amf', 'smf', 'upf', 'pcf', 'pcscf', 'icscf', 'scscf', 'hss', 'tas'],
    traffic: [sip(SIGNAL_UP, 'SIP')],
    d: 'Voice on 4G and 5G is not built into either core. It is a set of SIP servers, the IP Multimedia Subsystem (IMS), that the phone reaches over an ordinary IP connection. To the packet core, a call’s signalling is just packets to one more data network. That is why the same IMS serves 4G and 5G alike.',
    cites: [c228('4.0'), c228('4.1')],
  },
  {
    id: 'find-pcscf',
    k: 'control',
    title: 'First, find the P-CSCF',
    layout: 'vonr',
    focus: { nodes: ['smf', 'pcscf'] },
    traffic: [{ p: ['smf', 'amf', 'gnb', 'ue'], k: 'control', n: 1, speed: 0.34, label: 'P-CSCF address' }],
    d: 'The phone opens a separate PDU session (on 4G, a PDN connection) for IMS, with its own QoS flow for SIP signalling on the standardised 5QI 5. While that session is set up, the SMF picks a P-CSCF, from configuration or by asking the NRF, and gives the phone its address. The P-CSCF is the phone’s first contact point in IMS and stays its first hop for everything that follows.',
    cites: [c228('5.1.1'), c228('Y.1.1'), c501('5.16.3.11'), c228('Y.2.1.1'), c501('5.7.4')],
  },
  {
    id: 'register',
    k: 'ims',
    title: 'Registering: the I-CSCF finds an S-CSCF',
    layout: 'vonr',
    focus: { nodes: ['icscf', 'hss'], links: ['Cx'] },
    traffic: [
      sip([...SIGNAL_UP, 'icscf'], 'REGISTER'),
      { p: ['icscf', 'hss'], k: 'diameter', n: 1, speed: 0.34, phase: 0.45 },
    ],
    d: 'The phone sends a SIP REGISTER. The P-CSCF forwards it to the I-CSCF, the entry point of the home network. The I-CSCF asks the HSS over Cx whether this user may register and which S-CSCF should serve them, then passes the REGISTER to that S-CSCF.',
    cites: [c228('5.2.2.3'), c228('4.6.2'), c002('6a.7.1')],
  },
  {
    id: 'aka',
    k: 'ims',
    title: 'Proving who you are: IMS AKA',
    layout: 'vonr',
    focus: { nodes: ['scscf', 'ue'] },
    traffic: [
      { p: ['scscf', 'hss'], k: 'diameter', n: 1, speed: 0.34, label: 'Auth vectors' },
      sip(['scscf', 'icscf', ...SIGNAL_DOWN], '401 challenge'),
    ],
    d: 'The S-CSCF is the registrar, and it authenticates the user. It fetches authentication vectors from the HSS and answers the REGISTER with a challenge. The ISIM on the phone computes the response and registers again. The keys from this exchange set up IPsec security associations between the phone and the P-CSCF, which protect all later signalling.',
    cites: [{ src: 'ts33203', clause: '6.1.1' }, { src: 'ts33203', clause: '7.0' }, c228('4.6.3'), c228('4.6.1')],
  },
  {
    id: 'ifc',
    k: 'ims',
    title: 'The service profile brings in the TAS',
    layout: 'vonr',
    focus: { nodes: ['scscf', 'tas'], links: ['ISC', 'Sh'] },
    traffic: [
      { p: ['hss', 'scscf'], k: 'diameter', n: 1, speed: 0.34, label: 'Profile + iFC' },
      sip(['scscf', 'tas'], 'REGISTER', 1),
    ],
    d: 'Once the user is authenticated, the S-CSCF downloads their service profile from the HSS. It includes initial filter criteria (iFC): rules saying which application servers to involve, and in what order. For voice, that is the Telephony Application Server (TAS), which runs multimedia telephony and its supplementary services. The S-CSCF tells it about the registration over ISC, and the TAS reads its own data from the HSS over Sh.',
    cites: [c228('5.2.2.3'), c228('4.2.4'), c228('4.16.1'), c002('6a.7.16')],
  },
  {
    id: 'invite',
    k: 'ims',
    title: 'Making a call: offer and answer',
    layout: 'vonr',
    focus: { nodes: ['pcscf', 'scscf', 'tas'] },
    traffic: [sip([...SIGNAL_UP, 'scscf', 'tas'], 'INVITE (SDP offer)')],
    d: 'To call, the phone sends an INVITE carrying an SDP offer: the codecs and ports it proposes. It follows the path learned at registration, P-CSCF to S-CSCF, and the iFC route it through the TAS for services such as barring or forwarding. The answer comes back with the far end’s SDP. With preconditions, neither phone rings until the network has reserved resources for the media.',
    cites: [c228('4.6.3'), c228('4.16.3'), c228('5.4.8')],
  },
  {
    id: 'qos-5g',
    k: 'sbi',
    title: 'The P-CSCF asks for a voice-grade flow',
    layout: 'vonr',
    focus: { nodes: ['pcscf', 'pcf'], links: ['N5', 'N7'] },
    traffic: [
      { p: ['pcscf', 'pcf', 'smf'], k: 'sbi', n: 1, speed: 0.3, label: 'Media description' },
      { p: ['smf', 'amf', 'gnb'], k: 'control', n: 1, speed: 0.3, phase: 0.5, label: '5QI 1 flow' },
    ],
    d: 'IMS now tells the packet core what the call needs. The P-CSCF acts as an application function: it sends the negotiated media to the PCF over N5. The PCF turns that into policy for the SMF, and the network, not the phone, sets up a guaranteed-bit-rate QoS flow on 5QI 1, the standardised class for conversational voice. This is voice over NR (VoNR).',
    cites: [c228('4.6.1'), c228('Y.2.3.1'), c228('5.4.7.1a'), c501('5.7.4')],
  },
  {
    id: 'qos-4g',
    k: 'diameter',
    title: 'The same step on 4G (VoLTE)',
    layout: 'volte',
    show: ['ue', 'enb', 'mme', 'gw', 'pcrf', 'pcscf', 'icscf', 'scscf', 'hss', 'tas'],
    spawn: { enb: 'gnb', mme: 'amf', gw: 'upf', pcrf: 'pcf' },
    focus: { nodes: ['pcscf', 'pcrf'], links: ['Rx', 'Gx'] },
    traffic: [
      { p: ['pcscf', 'pcrf', 'gw'], k: 'diameter', n: 1, speed: 0.3, label: 'Media description' },
      { p: ['gw', 'mme', 'enb'], k: 'control', n: 1, speed: 0.3, phase: 0.5, label: 'QCI 1 bearer' },
    ],
    d: 'On 4G the IMS side is unchanged; only the packet core differs. The P-CSCF talks to the PCRF over Rx, the PCRF instructs the P-GW over Gx, and the network sets up a dedicated EPS bearer on QCI 1 for the voice. This is voice over LTE (VoLTE). The phone and the IMS servers do the same things in both cases.',
    cites: [c228('4.6.1'), c228('E.2.3.1'), { src: 'ts23203', clause: '6.1.7.2' }],
  },
  {
    id: 'media',
    k: 'media',
    title: 'Media takes a different path',
    layout: 'vonr',
    show: ['ue', 'gnb', 'amf', 'smf', 'upf', 'pcf', 'pcscf', 'icscf', 'scscf', 'hss', 'tas'],
    add: ['agw', 'mrf'],
    spawn: { gnb: 'enb', amf: 'mme', upf: 'gw', pcf: 'pcrf' },
    focus: { nodes: ['agw'], links: ['Iq'] },
    traffic: [
      { p: ['ue', 'gnb', 'upf', 'agw'], k: 'media', n: 4 },
      { p: ['pcscf', 'agw'], k: 'ims', n: 1, speed: 0.4, phase: 0.2 },
    ],
    d: 'SIP only sets the call up; the voice itself travels as RTP packets on the voice QoS flow, never through the CSCFs. The P-CSCF can steer the media through an IMS Access Gateway, which it controls over Iq, to translate addresses and police the flows. When a call needs tones, announcements or a conference bridge, the S-CSCF or TAS brings in the Multimedia Resource Function (MRF).',
    cites: [c228('G.3.2'), c002('6a.7.23'), c228('4.7'), c002('6a.7.14')],
  },
  {
    id: 'pstn',
    k: 'ims',
    title: 'Breaking out to the phone network',
    layout: 'vonr',
    add: ['bgcf', 'mgcf', 'mgw', 'pstn'],
    focus: { nodes: ['bgcf', 'mgcf'], links: ['Mi', 'Mj'] },
    traffic: [
      sip(['scscf', 'bgcf', 'mgcf', 'pstn'], 'INVITE → ISUP'),
      { p: ['agw', 'mgw', 'pstn'], k: 'media', n: 3, phase: 0.3 },
    ],
    d: 'If the number isn’t reachable over IP, the S-CSCF hands the INVITE to the Breakout Gateway Control Function (BGCF). The BGCF picks the network where the call should leave IMS and, if it is this one, an MGCF. The MGCF translates SIP to ISUP for the circuit-switched network, and controls an IMS media gateway that converts the RTP voice to circuit bearers.',
    cites: [c228('5.4.3'), c228('4.6.4'), c002('4a.7.2'), c002('4a.7.3')],
  },
  {
    id: 'interconnect',
    k: 'ims',
    title: 'Calling another operator’s IMS',
    layout: 'vonr',
    add: ['ibcf', 'other'],
    focus: { nodes: ['ibcf'], links: ['Mx', 'Ici'] },
    traffic: [sip(['scscf', 'ibcf', 'other'], 'INVITE')],
    d: 'Calls to another IMS network can stay in SIP end to end. They leave through an Interconnection Border Control Function (IBCF), which hides the internal topology, screens the signalling and controls a transition gateway for the media. Inbound, the IBCF is the entry point in place of the I-CSCF.',
    cites: [c228('4.14'), c002('4a.7.8'), c002('4a.7.9')],
  },
  {
    id: 'fallback',
    k: 'radio',
    title: 'When 5G radio can’t carry the voice',
    layout: 'vonr',
    focus: { nodes: ['gnb'] },
    traffic: [{ p: ['smf', 'amf', 'gnb'], k: 'control', n: 1, speed: 0.3, label: '5QI 1 flow?' }],
    d: 'Not every 5G network runs VoNR. If the gNB can’t set up the voice QoS flow, it can reject it and move the phone to LTE and the EPC by redirection or handover: EPS fallback. The call continues as VoLTE over the same IMS, because IMS doesn’t depend on the radio. The P-CSCF can ask the PCF to be told when this happens.',
    cites: [c501('5.16.3.10'), { src: 'ts23502', clause: '4.13.6.1' }, c228('Y.13')],
  },
];

export const compare = {
  scenes: ['qos-4g', 'qos-5g'],
  labels: ['VoLTE', 'VoNR'],
  title: 'What changes between VoLTE and VoNR',
  cites: [c228('Y.2.3.1'), c228('E.2.3.1'), c501('5.7.4'), { src: 'ts23203', clause: '6.1.7.2' }],
  columns: ['VoLTE (4G EPC)', 'VoNR (5G core)'],
  rows: [
    ['IMS servers', 'P-CSCF, I-CSCF, S-CSCF, TAS, HSS', 'The same, unchanged'],
    ['Where SIP rides', 'A PDN connection for IMS, QCI 5', 'A PDU session for IMS, 5QI 5'],
    ['P-CSCF address from', 'The P-GW, when the PDN connection is set up', 'The SMF, when the PDU session is set up'],
    ['P-CSCF asks for media QoS over', 'Rx (Diameter) to the PCRF', 'N5 (HTTP/2) to the PCF, or Rx'],
    ['Voice carried on', 'A dedicated EPS bearer, QCI 1', 'A GBR QoS flow, 5QI 1'],
  ],
};

export const takeaways = [
  'IMS is a set of SIP servers reached over an ordinary data connection, so the same IMS serves 4G and 5G.',
  'The P-CSCF is the phone’s first hop, the I-CSCF is the home entry point, and the S-CSCF registers the user and runs their sessions.',
  'The HSS holds the IMS subscription; its initial filter criteria decide which application servers, such as the TAS, see each request.',
  'The P-CSCF is where IMS meets the packet core: it asks the PCRF or PCF for the voice bearer or QoS flow.',
  'The BGCF and MGCF take calls out to the circuit-switched network; the IBCF borders other IMS networks.',
];

export const check = [
  {
    q: 'Which IMS function assigns an S-CSCF when a user registers?',
    options: ['The P-CSCF', 'The I-CSCF, after asking the HSS', 'The TAS', 'The SMF'],
    answer: 1,
    why: 'The I-CSCF queries the HSS over Cx and assigns the S-CSCF (TS 23.228 §4.6.2, §5.2.2.3).',
  },
  {
    q: 'How does the S-CSCF decide to involve the TAS?',
    options: ['The phone asks for it in the INVITE', 'Initial filter criteria in the user’s service profile', 'The PCF tells it to', 'It always forwards everything to every AS'],
    answer: 1,
    why: 'Filter information received from the HSS decides, per application server, whether the S-CSCF passes a request over ISC (TS 23.228 §4.2.4).',
  },
  {
    q: 'In VoNR, which interface does the P-CSCF use to request the voice QoS flow?',
    options: ['Gm', 'N5 to the PCF (or Rx)', 'Cx to the HSS', 'N4 to the UPF'],
    answer: 1,
    why: 'As an application function, the P-CSCF talks to the policy framework over Rx or N5 (TS 23.228 §4.6.1).',
  },
  {
    q: 'Which pair of functions takes a call from IMS to the PSTN?',
    options: ['IBCF and TrGW', 'BGCF and MGCF (with an IMS-MGW)', 'P-CSCF and IMS-AGW', 'S-CSCF and HSS'],
    answer: 1,
    why: 'The BGCF selects the breakout network and MGCF; the MGCF interworks with the PSTN and controls the media gateway (TS 23.228 §5.4.3).',
  },
];

export const links = [
  { label: 'Watch a VoLTE call, step by step', href: '#/flows?net=4g&session=voice' },
  { label: 'The same call on 5G SA (VoNR)', href: '#/flows?net=sa&session=voice' },
  { label: 'EPS fallback in the call-flow explorer', href: '#/flows?net=sa&session=voice&variant=voice-epsfb' },
];
