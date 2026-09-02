import { fivegc } from './fivegc.js';
import { merge } from './fragments.js';

/* EPS fallback: the 5GC topology plus the slice of the EPC a call falls
   back onto. The eNodeB/MME/S-GW/P-GW sit in their own zone under the 5GC
   user plane; the P-GW is really the same combined SMF+PGW-C / UPF+PGW-U
   node the SA session used (that's what keeps the IP address stable), but
   it's drawn separately so the two paths are visible. */

const epcAnchor = {
  nodes: {
    enb: { cx: 196, cy: 470, w: 112, h: 52, t: 'eNodeB', s: 'E-UTRAN / RBS' },
    mme: { cx: 196, cy: 580, w: 132, h: 52, t: 'MME', s: 'SGSN-MME' },
    sgw: { cx: 370, cy: 470, w: 116, h: 52, t: 'S-GW', s: 'EPG' },
    pgw: { cx: 370, cy: 580, w: 124, h: 52, t: 'P-GW', s: 'PGW-C/U = SMF/UPF' },
  },
  links: [
    { a: 'ue', b: 'enb', l: 'LTE-Uu', k: 'radio', curve: 40, labelT: 0.4, lx: -22 },
    { a: 'enb', b: 'mme', l: 'S1-MME', k: 'control', curve: 0, lx: -30 },
    { a: 'enb', b: 'sgw', l: 'S1-U', k: 'user', curve: 0, ly: 22 },
    { a: 'mme', b: 'sgw', l: 'S11', k: 'control', curve: 0, labelT: 0.35, lx: 18 },
    { a: 'sgw', b: 'pgw', l: 'S5 / S8', k: 'user', curve: 0, lx: 30 },
    { a: 'mme', b: 'amf', l: 'N26', k: 'control', curve: -70, dash: '6 4', labelT: 0.45, lx: -30 },
    { a: 'pgw', b: 'sbg', l: 'SGi (ims)', k: 'user', curve: 0, labelT: 0.5 },
    { a: 'pgw', b: 'pcf', l: 'Gx', k: 'diameter', curve: 140, dash: '4 6', labelT: 0.85, lx: 14 },
  ],
  zones: [
    { x: 14, y: 404, w: 440, h: 212, rx: 10, fill: '#0f1424', label: 'EPC — LTE ANCHOR FOR EPS FALLBACK', labelX: 26, labelY: 422, labelColor: '#4a5a7d' },
  ],
};

export const epsfb = merge({ ...fivegc, id: 'epsfb', label: '5G SA — EPS fallback to EPC' }, epcAnchor);
