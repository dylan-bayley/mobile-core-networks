/* Lesson 3 — EPC and 5GC side by side, following the non-roaming
   interworking architecture of TS 23.501 §4.3.1 (Figure 4.3.1-1). */

const BANDS = {
  wide: { control: [0, 3], user: [3.3, 6] },
  narrow: { control: [0, 4.2], user: [4.45, 8] },
};

export const diagram = {
  id: 'iw',
  title: 'EPC and 5GC interworking',
  grid: {
    wide: { cols: 8, rows: 6, w: 1120, h: 620 },
    narrow: { cols: 4, rows: 8, w: 440, h: 800 },
  },
  nodes: {
    ue4: { t: 'UE', s: 'on LTE', gen: 'ran' },
    ue5: { t: 'UE', s: 'on 5G NR', gen: 'ran' },
    enb: { t: 'E-UTRAN', s: '4G radio', gen: 'ran', g: 'E-UTRAN' },
    gnb: { t: 'NG-RAN', s: '5G radio', gen: 'ran', g: 'NG-RAN' },
    mme: { t: 'MME', s: '4G mobility', gen: '4g' },
    sgw: { t: 'S-GW', s: 'Serving gateway', gen: '4g' },
    amf: { t: 'AMF', s: '5G access & mobility', gen: '5g' },
    smf: { t: 'SMF + PGW-C', s: 'Combined control', gen: '5g', g: 'SMF' },
    upf: { t: 'UPF + PGW-U', s: 'Combined user plane', gen: '5g', g: 'UPF' },
    hss: { t: 'HSS + UDM', s: 'Combined subscriber data', gen: '5g', g: 'UDM' },
    pcf: { t: 'PCF', s: 'Policy', gen: '5g' },
    dn: { t: 'DN', s: 'Data network', gen: 'ext' },
  },
  layouts: {
    iw: {
      wide: {
        hss: [3.5, 0.45], pcf: [5.6, 0.45],
        mme: [1.2, 1.9], smf: [3.5, 2.2], amf: [5.8, 1.9],
        sgw: [1.8, 3.4], upf: [3.5, 4.3], dn: [3.5, 5.3],
        enb: [0.5, 4.3], gnb: [6.5, 4.3],
        ue4: [0.5, 5.3], ue5: [6.5, 5.3],
      },
      narrow: {
        hss: [1.5, 0.35], pcf: [3.1, 0.35],
        mme: [0.4, 1.7], amf: [2.6, 1.7],
        smf: [1.5, 3.1],
        sgw: [0.5, 4.9], upf: [1.5, 5.9], dn: [1.5, 7.3],
        enb: [0.3, 6.3], gnb: [2.7, 6.3],
        ue4: [0.3, 7.2], ue5: [2.7, 7.2],
      },
      bands: BANDS,
    },
  },
  links: [
    { a: 'ue4', b: 'enb', l: 'LTE-Uu', k: 'radio' },
    { a: 'ue5', b: 'gnb', l: 'NR-Uu', k: 'radio' },
    { a: 'enb', b: 'mme', l: 'S1-MME', k: 'control' },
    { a: 'enb', b: 'sgw', l: 'S1-U', k: 'user' },
    { a: 'mme', b: 'sgw', l: 'S11', k: 'control' },
    { a: 'sgw', b: 'smf', l: 'S5-C', k: 'control' },
    { a: 'sgw', b: 'upf', l: 'S5-U', k: 'user' },
    { a: 'mme', b: 'hss', l: 'S6a', k: 'diameter' },
    { a: 'mme', b: 'amf', l: 'N26', k: 'control', curve: -120 },
    { a: 'gnb', b: 'amf', l: 'N2', k: 'control' },
    { a: 'gnb', b: 'upf', l: 'N3', k: 'user' },
    { a: 'smf', b: 'upf', l: 'N4', k: 'control' },
    { a: 'amf', b: 'smf', l: 'N11', k: 'sbi' },
    { a: 'amf', b: 'hss', l: 'N8', k: 'sbi' },
    { a: 'smf', b: 'hss', l: 'N10', k: 'sbi' },
    { a: 'smf', b: 'pcf', l: 'N7', k: 'sbi' },
    { a: 'amf', b: 'pcf', l: 'N15', k: 'sbi' },
    { a: 'upf', b: 'dn', l: 'N6', k: 'user' },
  ],
};

const c501 = (clause) => ({ src: 'ts23501', clause });
const c502 = (clause) => ({ src: 'ts23502', clause });
const CORE = ['ue4', 'ue5', 'enb', 'gnb', 'mme', 'sgw', 'amf', 'dn'];

export const scenes = [
  {
    id: 'two-cores',
    k: 'control',
    title: 'Two cores, one subscriber',
    layout: 'iw',
    show: CORE,
    d: 'Operators run 4G and 5G side by side for years. A 5G phone camps on 5G where there is coverage and falls back to LTE elsewhere. On LTE it is served by an MME and S-GW; on 5G by an AMF. The question is how the phone keeps its sessions when it moves between the two.',
    cites: [c501('4.3.1'), c501('5.17.2.1')],
  },
  {
    id: 'combined',
    k: 'sbi',
    title: 'Combined nodes',
    layout: 'iw',
    add: ['smf', 'upf', 'hss', 'pcf'],
    focus: { nodes: ['smf', 'upf', 'hss'] },
    d: 'The answer is nodes that belong to both cores. SMF + PGW-C and UPF + PGW-U act as the SMF and UPF towards 5G and as the P-GW towards 4G, so the session is anchored in the same place (with the same IP address) on either radio. HSS + UDM holds the subscriber for both. 3GPP makes these combined nodes optional, used for devices and subscriptions that need interworking.',
    cites: [c501('4.3.1')],
  },
  {
    id: 'on-lte',
    k: 'user',
    title: 'On LTE…',
    layout: 'iw',
    traffic: [{ p: ['ue4', 'enb', 'sgw', 'upf', 'dn'], k: 'user', n: 4 }],
    focus: { links: ['S1-U', 'S5-U', 'N6'] },
    d: 'On LTE the device’s packets go eNodeB → S-GW → UPF + PGW-U. To the 4G side, that combined node is simply a P-GW on S5.',
    cites: [c501('4.3.1')],
  },
  {
    id: 'on-nr',
    k: 'user',
    title: '…and on 5G, same anchor',
    layout: 'iw',
    traffic: [{ p: ['ue5', 'gnb', 'upf', 'dn'], k: 'user', n: 4 }],
    focus: { links: ['N3', 'N6'] },
    d: 'After the device moves to 5G, the packets arrive over N3 at the same UPF + PGW-U, which is still the anchor towards the data network. The S-GW drops out of the path, but the session and IP address survive.',
    cites: [c501('4.3.1'), c501('5.17.2.1')],
  },
  {
    id: 'n26',
    k: 'control',
    title: 'N26: MME ↔ AMF',
    layout: 'iw',
    focus: { links: ['N26'] },
    traffic: [{ p: ['mme', 'amf'], k: 'control', n: 1, speed: 0.35 }],
    d: 'With N26, the MME and AMF hand the device’s context directly to each other. That allows proper handovers between 4G and 5G with little interruption. N26 supports a subset of the MME-to-MME S10 functions, and supporting it is optional.',
    cites: [c501('4.3.1'), c502('4.11.1'), c501('5.17.2.2')],
  },
  {
    id: 'no-n26',
    k: 'control',
    title: 'Without N26',
    layout: 'iw',
    focus: { nodes: ['hss', 'smf'] },
    traffic: [{ p: ['amf', 'hss'], k: 'sbi', n: 1, speed: 0.35 }],
    d: 'Without N26 the two cores never talk directly. The device re-registers or re-attaches on the other side. It keeps its session because the HSS + UDM remembers which SMF + PGW-C is serving it, so the new core can reach the same anchor. It is simpler to deploy, but moving between 4G and 5G interrupts service more.',
    cites: [c502('4.11.2'), c501('5.17.2.3')],
  },
];

export const takeaways = [
  'Combined nodes (SMF + PGW-C, UPF + PGW-U, HSS + UDM) belong to both cores at once.',
  'The session anchor, and so the IP address, stays put while the radio changes.',
  'N26 lets the MME and AMF hand over context directly. Without it the device re-registers.',
];

export const check = [
  {
    q: 'What does the UPF + PGW-U look like to an S-GW?',
    options: ['An MME', 'A P-GW on S5', 'An AMF on N26', 'An eNodeB'],
    answer: 1,
    why: 'The combined node acts as the PGW-U, so the S-GW reaches it over S5-U (TS 23.501 §4.3.1).',
  },
  {
    q: 'Which interface lets the MME and AMF transfer a device’s context?',
    options: ['N2', 'S6a', 'N26', 'N11'],
    answer: 2,
    why: 'N26 is the inter-core interface between MME and AMF. It is optional and a subset of S10 (TS 23.501 §4.3.1).',
  },
  {
    q: 'True or false: interworking between 4G and 5G is impossible without N26.',
    options: ['True', 'False'],
    answer: 1,
    why: 'TS 23.502 §4.11.2 defines interworking procedures without N26. The device re-registers and the HSS + UDM points the new core at the same SMF + PGW-C.',
  },
];

export const links = [
  { label: 'Watch EPS fallback for a 5G voice call', href: '#/flows?net=sa&session=voice&variant=voice-epsfb' },
];
