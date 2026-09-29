/* Lesson 4 — 5G non-standalone (EN-DC, "option 3" family) vs standalone
   ("option 2"). Bearer types and interfaces are from TS 37.340; the option
   numbers come from TR 38.801 and the GSMA migration white paper. */

export const diagram = {
  id: 'nsa',
  title: '5G NSA and SA architectures',
  grid: {
    wide: { cols: 8, rows: 6, w: 1120, h: 620 },
    narrow: { cols: 4, rows: 8, w: 440, h: 800 },
  },
  nodes: {
    ue: { t: 'UE', s: '5G phone', gen: 'ran' },
    enb: { t: 'eNodeB', s: 'Master node (LTE)', gen: 'ran' },
    engnb: { t: 'en-gNB', s: 'Secondary node (NR)', gen: 'ran', g: 'en-gNB' },
    gnb: { t: 'gNB', s: '5G radio', gen: 'ran' },
    mme: { t: 'MME', s: '4G core', gen: '4g' },
    sgw: { t: 'S-GW', s: '4G core', gen: '4g' },
    pgw: { t: 'P-GW', s: '4G core', gen: '4g' },
    amf: { t: 'AMF', s: '5G core', gen: '5g' },
    smf: { t: 'SMF', s: '5G core', gen: '5g' },
    upf: { t: 'UPF', s: '5G core', gen: '5g' },
    dn: { t: 'Internet', s: 'Data network', gen: 'ext' },
  },
  layouts: {
    opt3: {
      wide: {
        mme: [1.9, 0.7], sgw: [3.9, 2.5], pgw: [5.5, 2.5], dn: [7.1, 2.5],
        enb: [1.9, 3.6], engnb: [1.9, 5.3], ue: [0.3, 4.45],
      },
      narrow: {
        mme: [0.5, 0.5], dn: [3.1, 0.5], pgw: [3.1, 2.1], sgw: [1.8, 3.1],
        enb: [0.5, 4.8], engnb: [2.5, 5.7], ue: [1.4, 7.3],
      },
    },
    opt3a: { extends: 'opt3' },
    opt3x: { extends: 'opt3' },
    opt2: {
      wide: {
        amf: [1.9, 0.7], smf: [3.9, 0.7], upf: [4.7, 2.5], dn: [7.1, 2.5],
        gnb: [1.9, 4.45], ue: [0.3, 4.45],
      },
      narrow: {
        amf: [0.5, 0.5], smf: [1.8, 1.5], upf: [3.1, 2.1], dn: [3.1, 0.5],
        gnb: [1.5, 5.3], ue: [1.4, 7.3],
      },
    },
  },
  links: [
    { a: 'ue', b: 'enb', l: 'LTE-Uu', k: 'radio', in: ['opt3', 'opt3a', 'opt3x'] },
    { a: 'ue', b: 'engnb', l: 'NR-Uu', k: 'radio', in: ['opt3', 'opt3a', 'opt3x'] },
    { a: 'enb', b: 'engnb', l: 'X2-C / X2-U', k: 'control', in: ['opt3', 'opt3a', 'opt3x'] },
    { a: 'enb', b: 'mme', l: 'S1-MME', k: 'control', in: ['opt3', 'opt3a', 'opt3x'] },
    { a: 'enb', b: 'sgw', l: 'S1-U', k: 'user', in: ['opt3', 'opt3a'] },
    { a: 'engnb', b: 'sgw', l: 'S1-U', k: 'user', in: ['opt3a', 'opt3x'] },
    { a: 'mme', b: 'sgw', l: 'S11', k: 'control', in: ['opt3', 'opt3a', 'opt3x'] },
    { a: 'sgw', b: 'pgw', l: 'S5', k: 'user', in: ['opt3', 'opt3a', 'opt3x'] },
    { a: 'pgw', b: 'dn', l: 'SGi', k: 'user', in: ['opt3', 'opt3a', 'opt3x'] },
    { a: 'ue', b: 'gnb', l: 'NR-Uu', k: 'radio', in: ['opt2'] },
    { a: 'gnb', b: 'amf', l: 'N2', k: 'control', in: ['opt2'] },
    { a: 'gnb', b: 'upf', l: 'N3', k: 'user', in: ['opt2'] },
    { a: 'amf', b: 'smf', l: 'N11', k: 'sbi', in: ['opt2'] },
    { a: 'smf', b: 'upf', l: 'N4', k: 'control', in: ['opt2'] },
    { a: 'upf', b: 'dn', l: 'N6', k: 'user', in: ['opt2'] },
  ],
};

const c340 = (clause) => ({ src: 'ts37340', clause });
const GSMA = { src: 'gsma5g', clause: '§3.1' };
const OPT3_NODES = ['ue', 'enb', 'engnb', 'mme', 'sgw', 'pgw', 'dn'];
const DL = ['dn', 'pgw', 'sgw'];

export const scenes = [
  {
    id: 'endc',
    k: 'radio',
    title: 'NSA: 5G radio on a 4G core',
    layout: 'opt3',
    show: OPT3_NODES,
    d: 'In non-standalone 5G the phone connects to an LTE eNodeB and a 5G en-gNB at the same time. This is E-UTRA–NR Dual Connectivity (EN-DC). The eNodeB is the master node, the en-gNB is the secondary node, and the core is still the 4G EPC. The GSMA and 3GPP call this deployment “option 3”.',
    cites: [c340('4.1.2'), GSMA, { src: 'tr38801' }],
  },
  {
    id: 'anchor',
    k: 'control',
    title: 'LTE holds the control plane',
    layout: 'opt3',
    focus: { links: ['S1-MME', 'X2-C / X2-U'] },
    traffic: [{ p: ['ue', 'enb', 'mme'], k: 'control', n: 1, speed: 0.35 }],
    d: 'Only the master node signals to the core: S1-MME ends at the eNodeB, and the two radio nodes coordinate over X2-C. The en-gNB never talks to the MME, and the phone has a single RRC state, anchored on LTE. That is why it is called non-standalone: here the 5G radio can’t work without the LTE anchor.',
    cites: [c340('4.3.1.2'), c340('4.2.1')],
  },
  {
    id: 'opt3',
    k: 'user',
    title: 'Option 3: the eNodeB splits the traffic',
    layout: 'opt3',
    focus: { nodes: ['enb'] },
    traffic: [
      { p: [...DL, 'enb', 'ue'], k: 'user', n: 3 },
      { p: [...DL, 'enb', 'engnb', 'ue'], k: 'user', n: 3, phase: 0.12 },
    ],
    d: 'TS 37.340 lets each bearer end in either radio node. In the variant usually called option 3, S1-U ends at the eNodeB. It splits the traffic, sending some over LTE and forwarding the rest over X2-U to the en-gNB for NR (an MN-terminated split bearer). The catch is that the LTE node must carry all of the 5G traffic.',
    cites: [c340('4.2.2'), c340('4.3.2.1'), c340('4.3.2.2')],
  },
  {
    id: 'opt3a',
    k: 'user',
    title: 'Option 3a: the core splits it',
    layout: 'opt3a',
    focus: { links: ['S1-U'] },
    traffic: [
      { p: [...DL, 'enb', 'ue'], k: 'user', n: 2 },
      { p: [...DL, 'engnb', 'ue'], k: 'user', n: 4, phase: 0.1 },
    ],
    d: 'In option 3a the en-gNB gets its own S1-U to the S-GW. The core sends some bearers straight to the en-gNB (SCG bearers, NR only) and others to the eNodeB, so no traffic is split inside the radio network.',
    cites: [c340('4.3.2.2'), c340('4.2.2'), { src: 'tr38801' }],
  },
  {
    id: 'opt3x',
    k: 'user',
    title: 'Option 3x: the en-gNB splits it',
    layout: 'opt3x',
    focus: { nodes: ['engnb'] },
    traffic: [
      { p: [...DL, 'engnb', 'ue'], k: 'user', n: 4 },
      { p: [...DL, 'engnb', 'enb', 'ue'], k: 'user', n: 2, phase: 0.2 },
    ],
    d: 'Option 3x reverses option 3. S1-U ends at the en-gNB, which sends most traffic over NR and can pass some back over X2-U to the eNodeB (an SN-terminated split bearer). The LTE node no longer carries 5G-scale traffic. “3x” is industry shorthand: 3GPP only names the bearer types.',
    cites: [c340('4.2.2'), c340('4.3.2.1')],
  },
  {
    id: 'opt2',
    k: 'control',
    title: 'SA: 5G radio on a 5G core',
    layout: 'opt2',
    show: ['ue', 'gnb', 'amf', 'smf', 'upf', 'dn'],
    spawn: { gnb: 'engnb', amf: 'mme', smf: 'mme', upf: 'pgw' },
    traffic: [{ p: ['ue', 'gnb', 'amf'], k: 'control', n: 1, speed: 0.35 }],
    d: 'In standalone 5G (option 2) the gNB connects directly to the 5G core: N2 to the AMF for signalling, N3 to the UPF for packets. There is no LTE anchor, and the phone runs 5G NAS with the AMF.',
    cites: [GSMA, { src: 'ts23501', clause: '4.2.3' }, { src: 'ts38300' }],
  },
  {
    id: 'opt2-data',
    k: 'user',
    title: 'What SA unlocks',
    layout: 'opt2',
    traffic: [
      { p: ['dn', 'upf', 'gnb', 'ue'], k: 'user', n: 5 },
      { p: ['smf', 'upf'], k: 'control', n: 1, speed: 0.4 },
    ],
    d: 'Packets now run UPF → gNB → phone, and the SMF steers the UPF. Only a 5G core brings the 5G-system features: network slicing, QoS flows identified by a 5QI, a service-based control plane and voice over NR. NSA gives 5G radio capacity; SA gives the whole 5G system.',
    cites: [{ src: 'ts23501', clause: '5.15' }, { src: 'ts23501', clause: '4.2.3' }],
  },
];

export const compare = {
  scenes: ['opt3x', 'opt2-data'],
  labels: ['NSA', 'SA'],
  title: 'What changes between NSA and SA',
  cites: [GSMA, c340('4.1.2'), { src: 'ts23501', clause: '4.2.3' }],
  columns: ['NSA (option 3, EN-DC)', 'SA (option 2)'],
  rows: [
    ['Core network', '4G EPC: MME, S-GW, P-GW', '5G core: AMF, SMF, UPF and the rest'],
    ['Radio', 'LTE master + NR secondary, both at once', 'NR only'],
    ['Signalling anchor', 'eNodeB over S1-MME; 4G (EPS) NAS with the MME', 'gNB over N2; 5G NAS with the AMF'],
    ['What 5G adds', 'Extra user-plane capacity on NR', 'The full 5G system'],
    ['Network slicing', 'No (slicing is a 5G-system feature)', 'Yes: S-NSSAI, chosen with the NSSF'],
    ['Voice', 'VoLTE on the LTE leg', 'VoNR, or EPS fallback to VoLTE'],
  ],
};

export const options = {
  cites: [GSMA, { src: 'gsma5g', clause: '§8.2' }, c340('4.1')],
  columns: ['Option', 'Core', 'Radio', 'Mode'],
  rows: [
    ['1', 'EPC', 'LTE eNodeB', 'Standalone (4G as it was)'],
    ['2', '5GC', 'NR gNB', 'Standalone'],
    ['3', 'EPC', 'LTE eNodeB master + NR en-gNB secondary', 'Non-standalone (EN-DC)'],
    ['4', '5GC', 'NR gNB master + LTE ng-eNB secondary', 'Non-standalone (NE-DC)'],
    ['5', '5GC', 'LTE ng-eNB', 'Standalone'],
    ['7', '5GC', 'LTE ng-eNB master + NR gNB secondary', 'Non-standalone (NGEN-DC)'],
  ],
};

export const takeaways = [
  'NSA adds 5G radio to LTE and the 4G core. SA pairs 5G radio with the 5G core.',
  'In EN-DC the LTE eNodeB is the master: it holds the signalling link to the core, and the en-gNB adds capacity.',
  'Options 3, 3a and 3x differ only in where the user data is split.',
  'Slicing, 5G QoS and VoNR need the 5G core, which means SA.',
];

export const check = [
  {
    q: 'In EN-DC (option 3), which node terminates S1-MME?',
    options: ['The en-gNB', 'The eNodeB (master node)', 'Both', 'The AMF'],
    answer: 1,
    why: 'In EN-DC, S1-MME is terminated in the master node (the eNodeB) and the master and secondary nodes are linked by X2-C (TS 37.340 §4.3.1.2).',
  },
  {
    q: 'Which deployment connects NR radio to the 5G core with no LTE anchor?',
    options: ['Option 3', 'Option 3x', 'Option 2', 'Option 7'],
    answer: 2,
    why: 'Option 2 is standalone NR with the 5GC (GSMA Road to 5G, §3.1).',
  },
  {
    q: 'In option 3x, where does the S1-U user plane from the core end?',
    options: ['At the eNodeB', 'At the en-gNB', 'At the MME', 'At the UPF'],
    answer: 1,
    why: 'Option 3x uses an SN-terminated split bearer: S1-U ends in the secondary node (the en-gNB), which can forward part of the traffic to the eNodeB over X2-U (TS 37.340 §4.2.2, §4.3.2).',
  },
];

export const links = [
  { label: 'Watch EN-DC add the 5G leg (NSA data)', href: '#/flows?net=nsa&session=data' },
  { label: 'Compare with a 5G SA data session', href: '#/flows?net=sa&session=data' },
];
