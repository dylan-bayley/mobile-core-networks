import { epc } from './epc.js';

/* 5G NSA (EN-DC): the LTE anchor (eNodeB + full EPC control plane via the
   MME) is untouched — it's the same topology as `epc`, plus a secondary
   gNB reachable from the eNodeB over X2 and from the UE over its own NR
   radio leg, added purely for user-plane throughput. */

const gnb = { cx: 300, cy: 372, w: 104, h: 52, t: 'gNB', s: 'Secondary node (SgNB)' };

// Label positions (labelT / lx / ly) are hand-tuned so none of the three NR
// labels lands inside the eNodeB, gNB or S-GW boxes.
const nrLinks = [
  { a: 'ue', b: 'gnb', l: 'NR-Uu (SCG)', k: 'radio', curve: 50 },
  { a: 'enb', b: 'gnb', l: 'X2-C', k: 'control', curve: 0, lx: 28, ly: -2 },
  { a: 'gnb', b: 'sgw', l: 'S1-U (SCG)', k: 'user', curve: 0, labelT: 0.3, lx: 68, ly: 6 },
];

const userPlaneZoneNsa = {
  x: 14, y: 240, w: 1152, h: 168, rx: 10, fill: '#0a1220',
  label: 'USER PLANE — BEARER PATH (EN-DC)', labelX: 26, labelY: 258, labelColor: '#41547a',
};

export const nsa = {
  ...epc,
  id: 'nsa',
  label: '5G NSA — EN-DC',
  nodes: { ...epc.nodes, gnb },
  links: [...epc.links, ...nrLinks],
  zones: epc.zones.map((z) => (z.label === 'USER PLANE — BEARER PATH' ? userPlaneZoneNsa : z)),
};
