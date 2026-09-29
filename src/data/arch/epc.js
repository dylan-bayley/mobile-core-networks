/* Lesson 1 — the 4G Evolved Packet Core (TS 23.401 §4.2.1), built up one
   element at a time, then split into control and user plane (CUPS,
   TS 23.214). */

const BANDS = {
  wide: { control: [0, 3.1], user: [3.4, 6] },
  narrow: { control: [0, 4.75], user: [5, 8] },
};

export const diagram = {
  id: 'epc',
  title: '4G EPC architecture',
  grid: {
    wide: { cols: 8, rows: 6, w: 1120, h: 620 },
    narrow: { cols: 4, rows: 8, w: 440, h: 800 },
  },
  nodes: {
    ue: { t: 'UE', s: 'Device + USIM', gen: 'ran' },
    enb: { t: 'eNodeB', s: 'LTE radio (E-UTRAN)', gen: 'ran' },
    pdn: { t: 'PDN', s: 'Packet data network', gen: 'ext' },
    mme: { t: 'MME', s: 'Mobility management', gen: '4g' },
    sgw: { t: 'S-GW', s: 'Serving gateway', gen: '4g' },
    pgw: { t: 'P-GW', s: 'PDN gateway', gen: '4g' },
    hss: { t: 'HSS', s: 'Subscriber server', gen: '4g' },
    pcrf: { t: 'PCRF', s: 'Policy & charging rules', gen: '4g' },
    ocs: { t: 'OCS', s: 'Online charging', gen: '4g' },
    eir: { t: 'EIR', s: 'Device identity check', gen: '4g' },
    sgwc: { t: 'SGW-C', s: 'S-GW control', gen: '4g' },
    sgwu: { t: 'SGW-U', s: 'S-GW user plane', gen: '4g' },
    pgwc: { t: 'PGW-C', s: 'P-GW control', gen: '4g' },
    pgwu: { t: 'PGW-U', s: 'P-GW user plane', gen: '4g' },
  },
  layouts: {
    epc: {
      wide: {
        eir: [0.6, 0.5], hss: [2.4, 0.5], pcrf: [5, 0.5], ocs: [6.7, 0.5],
        mme: [2.4, 2.1],
        ue: [0, 4.6], enb: [1.3, 4.6], sgw: [3.3, 4.6], pgw: [5, 4.6], pdn: [6.8, 4.6],
      },
      narrow: {
        eir: [0, 0.4], hss: [1.3, 0.4], pcrf: [2.6, 1.9], ocs: [3.1, 0.4],
        mme: [0.8, 2.3],
        ue: [0, 6.4], enb: [0.7, 5.5], sgw: [1.8, 6.6], pgw: [2.7, 5.5], pdn: [3.05, 7.2],
      },
      bands: BANDS,
    },
    cups: {
      extends: 'epc',
      hide: ['sgw', 'pgw'],
      wide: { sgwc: [3.3, 2.3], pgwc: [5, 2.3], sgwu: [3.3, 4.6], pgwu: [5, 4.6] },
      narrow: { sgwc: [1.8, 3.6], pgwc: [3.1, 3.6], sgwu: [1.8, 6.6], pgwu: [2.7, 5.5] },
    },
  },
  links: [
    { a: 'ue', b: 'enb', l: 'LTE-Uu', k: 'radio' },
    { a: 'enb', b: 'mme', l: 'S1-MME', k: 'control' },
    { a: 'enb', b: 'sgw', l: 'S1-U', k: 'user' },
    { a: 'mme', b: 'sgw', l: 'S11', k: 'control' },
    { a: 'sgw', b: 'pgw', l: 'S5', k: 'user' },
    { a: 'pgw', b: 'pdn', l: 'SGi', k: 'user' },
    { a: 'mme', b: 'hss', l: 'S6a', k: 'diameter' },
    { a: 'mme', b: 'eir', l: 'S13', k: 'diameter' },
    { a: 'pgw', b: 'pcrf', l: 'Gx', k: 'diameter' },
    { a: 'pgw', b: 'ocs', l: 'Gy', k: 'diameter', curve: -30 },
    { a: 'enb', b: 'sgwu', l: 'S1-U', k: 'user', in: ['cups'] },
    { a: 'mme', b: 'sgwc', l: 'S11', k: 'control', in: ['cups'] },
    { a: 'sgwc', b: 'sgwu', l: 'Sxa', k: 'control', in: ['cups'] },
    { a: 'pgwc', b: 'pgwu', l: 'Sxb', k: 'control', in: ['cups'] },
    { a: 'sgwc', b: 'pgwc', l: 'S5-C', k: 'control', in: ['cups'] },
    { a: 'sgwu', b: 'pgwu', l: 'S5-U', k: 'user', in: ['cups'] },
    { a: 'pgwu', b: 'pdn', l: 'SGi', k: 'user', in: ['cups'] },
    { a: 'pgwc', b: 'pcrf', l: 'Gx', k: 'diameter', in: ['cups'] },
    { a: 'pgwc', b: 'ocs', l: 'Gy', k: 'diameter', curve: -30, in: ['cups'] },
  ],
};

const c401 = (clause) => ({ src: 'ts23401', clause });

export const scenes = [
  {
    id: 'edges',
    k: 'radio',
    title: 'Start at the edges',
    layout: 'epc',
    show: ['ue', 'enb', 'pdn'],
    d: 'A 4G phone (the UE) talks over LTE radio to an eNodeB. The eNodeBs together make up the E-UTRAN, the radio network. At the far end is a packet data network (PDN), such as the internet or the operator’s IMS for voice. The Evolved Packet Core (EPC) connects the two.',
    cites: [c401('4.2.1'), c401('4.4.1')],
  },
  {
    id: 'mme',
    k: 'control',
    title: 'MME: the signalling brain',
    layout: 'epc',
    add: ['mme'],
    focus: { links: ['S1-MME'] },
    traffic: [{ p: ['ue', 'enb', 'mme'], k: 'control', n: 1, speed: 0.35 }],
    d: 'The Mobility Management Entity handles the device’s NAS signalling: attach, authentication, tracking where an idle phone is, paging it and managing mobility. It also chooses which gateways serve the device. It never carries user data.',
    cites: [c401('4.4.2'), c401('4.2.3')],
  },
  {
    id: 'gateways',
    k: 'user',
    title: 'S-GW and P-GW: the packet path',
    layout: 'epc',
    add: ['sgw', 'pgw'],
    focus: { links: ['S1-U', 'S5', 'SGi', 'S11'] },
    traffic: [{ p: ['ue', 'enb', 'sgw', 'pgw', 'pdn'], k: 'user', n: 4 }],
    d: 'Two gateways carry the packets. The Serving Gateway terminates S1-U from the radio network and anchors the device as it moves between eNodeBs. The PDN Gateway sits at the edge towards the data network (SGi). It allocates the device’s IP address and enforces policy per user. The MME controls the S-GW over S11.',
    cites: [c401('4.4.3.2'), c401('4.4.3.3'), c401('4.2.3')],
  },
  {
    id: 'hss',
    k: 'diameter',
    title: 'HSS: who the subscriber is',
    layout: 'epc',
    add: ['hss'],
    focus: { links: ['S6a'] },
    traffic: [{ p: ['mme', 'hss'], k: 'diameter', n: 1, speed: 0.4 }],
    d: 'The Home Subscriber Server is the master database for subscriptions and authentication. The MME fetches authentication vectors and the subscriber profile from it over S6a, using Diameter.',
    cites: [{ src: 'ts23002', clause: '4.1.1.1' }, c401('4.2.3')],
  },
  {
    id: 'pcc',
    k: 'diameter',
    title: 'PCRF and OCS: rules and credit',
    layout: 'epc',
    add: ['pcrf', 'ocs'],
    focus: { links: ['Gx', 'Gy'] },
    d: 'The PCRF decides QoS and charging rules and pushes them to the P-GW over Gx. The P-GW enforces them. For prepaid-style charging, the P-GW asks the Online Charging System for credit in real time over Gy.',
    cites: [c401('4.4.7.1'), { src: 'ts23203', clause: '6.2.1' }, { src: 'ts32240', clause: '4.3.2' }],
  },
  {
    id: 'eir',
    k: 'diameter',
    title: 'EIR: is this handset allowed?',
    layout: 'epc',
    add: ['eir'],
    focus: { links: ['S13'] },
    d: 'The Equipment Identity Register stores device identities (IMEIs). The MME can check a handset against it over S13, so a stolen or blocked device can be refused.',
    cites: [{ src: 'ts23002', clause: '4.1.1.4' }, c401('4.2.3')],
  },
  {
    id: 'planes',
    k: 'control',
    title: 'Two planes',
    layout: 'epc',
    traffic: [
      { p: ['ue', 'enb', 'sgw', 'pgw', 'pdn'], k: 'user', n: 5 },
      { p: ['enb', 'mme', 'sgw'], k: 'control', n: 1, speed: 0.3 },
    ],
    d: 'Signalling (the control plane) travels S1-MME, S11, S6a and Gx. Your packets (the user plane) travel S1-U, S5 and SGi through the two gateways. In classic 4G the gateways do both jobs: each S-GW and P-GW is one box handling its control and user plane together.',
    cites: [c401('4.2.3')],
  },
  {
    id: 'bearer',
    k: 'user',
    title: 'The EPS bearer',
    layout: 'epc',
    focus: { links: ['S1-U', 'S5'] },
    traffic: [{ p: ['ue', 'enb', 'sgw', 'pgw', 'pdn'], k: 'user', n: 8, speed: 0.3 }],
    d: 'Each flow of traffic rides an EPS bearer, a path with one QoS level, from the device to the P-GW. On S1-U and S5 the packets travel inside GTP-U tunnels, so the IP address stays the same while the device moves and the S-GW simply switches the tunnel.',
    cites: [c401('4.7.2'), c401('4.2.3')],
  },
  {
    id: 'cups',
    k: 'control',
    title: 'CUPS: splitting the gateways',
    layout: 'cups',
    show: ['ue', 'enb', 'pdn', 'mme', 'hss', 'pcrf', 'ocs', 'eir', 'sgwc', 'sgwu', 'pgwc', 'pgwu'],
    spawn: { sgwc: 'sgw', sgwu: 'sgw', pgwc: 'pgw', pgwu: 'pgw' },
    focus: { links: ['Sxa', 'Sxb'] },
    traffic: [{ p: ['ue', 'enb', 'sgwu', 'pgwu', 'pdn'], k: 'user', n: 4 }],
    d: 'Release 14 added CUPS (Control and User Plane Separation). Each gateway splits into a control part (SGW-C, PGW-C) and a user-plane part (SGW-U, PGW-U), linked by Sxa and Sxb. User-plane boxes can then scale and move closer to users on their own. The 5G SMF and UPF follow the same pattern.',
    cites: [{ src: 'ts23214', clause: '4.2.1' }, { src: 'ts23214', clause: '4.2.3' }],
  },
];

export const takeaways = [
  'The MME handles signalling and never carries user data.',
  'User data flows eNodeB → S-GW → P-GW → PDN inside GTP-U tunnels.',
  'The HSS holds subscribers, the PCRF makes policy decisions, the OCS handles online charging and the EIR checks devices.',
  'CUPS splits each gateway into a control part and a user-plane part, the same pattern as the 5G SMF and UPF.',
];

export const check = [
  {
    q: 'Which EPC element allocates the device’s IP address?',
    options: ['MME', 'S-GW', 'P-GW', 'HSS'],
    answer: 2,
    why: 'UE IP address allocation is a PDN Gateway function (TS 23.401 §4.4.3.3).',
  },
  {
    q: 'Which interface does the MME use to fetch subscription and authentication data?',
    options: ['S11', 'S6a', 'S1-MME', 'Gx'],
    answer: 1,
    why: 'S6a carries subscription and authentication data between the MME and the HSS (TS 23.401 §4.2.3).',
  },
  {
    q: 'A phone moves from one eNodeB to another. Which gateway anchors it so its tunnels just switch?',
    options: ['P-GW', 'S-GW', 'MME', 'PCRF'],
    answer: 1,
    why: 'The Serving GW is the local mobility anchor for inter-eNodeB handover (TS 23.401 §4.4.3.2).',
  },
];

export const links = [
  { label: 'Watch a 4G attach and default bearer', href: '#/flows?net=4g&session=data' },
  { label: 'Read about each EPC element', href: '#/components' },
];
