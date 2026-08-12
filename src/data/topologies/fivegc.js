import { imsCore, imsPstn, imsPstnLink, messaging, merge } from './fragments.js';

/* 5G SA: a fresh 5GC control/user-plane split (AMF+SMF control, UPF user
   plane), reusing the same IMS core and PSTN-breakout fragments as 4G/NSA
   unchanged. The node id "hss" is kept for the UDM so the IMS fragment's
   Cx/Sh links resolve without redefinition — a converged HSS/UDM front end
   is exactly why that's a reasonable simplification, not just a shortcut. */

const fiveGcCore = {
  nodes: {
    ue: { cx: 64, cy: 310, w: 88, h: 52, t: 'UE', s: 'USIM / 5G-capable ME' },
    gnb: { cx: 196, cy: 310, w: 112, h: 52, t: 'gNB', s: 'NR / 5G-AN' },
    amf: { cx: 250, cy: 175, w: 132, h: 56, t: 'AMF', s: 'Access & Mobility Mgmt' },
    smf: { cx: 460, cy: 175, w: 124, h: 56, t: 'SMF', s: 'Session Mgmt Function' },
    smsf: { cx: 900, cy: 175, w: 120, h: 56, t: 'SMSF', s: 'SMS Function' },
    eir: { cx: 170, cy: 80, w: 120, h: 56, t: '5G-EIR', s: 'Equipment Identity Register' },
    ausf: { cx: 377, cy: 80, w: 116, h: 56, t: 'AUSF', s: 'Authentication Server Function' },
    hss: { cx: 584, cy: 80, w: 144, h: 56, t: 'UDM / HSS', s: 'UDM + UDR (+ legacy HSS-FE)' },
    pcf: { cx: 791, cy: 80, w: 124, h: 56, t: 'PCF', s: 'Policy Control Function' },
    chf: { cx: 998, cy: 80, w: 124, h: 56, t: 'CHF', s: 'Converged Charging' },
    upf: { cx: 480, cy: 310, w: 128, h: 52, t: 'UPF', s: 'User Plane Function' },
    inet: { cx: 940, cy: 310, w: 112, h: 48, t: 'Internet', s: 'N6 / DN' },
  },
  links: [
    { a: 'ue', b: 'gnb', l: 'NR-Uu', k: 'radio', curve: 0 },
    { a: 'gnb', b: 'amf', l: 'N2', k: 'control', curve: 0 },
    { a: 'gnb', b: 'upf', l: 'N3', k: 'user', curve: 0 },
    { a: 'amf', b: 'eir', l: 'N17', k: 'sbi', curve: 0 },
    { a: 'amf', b: 'hss', l: 'N8', k: 'sbi', curve: 0 },
    { a: 'amf', b: 'ausf', l: 'N12', k: 'sbi', curve: -20 },
    { a: 'ausf', b: 'hss', l: 'N13', k: 'sbi', curve: 0 },
    { a: 'amf', b: 'smf', l: 'N11', k: 'sbi', curve: 0 },
    { a: 'smf', b: 'upf', l: 'N4', k: 'control', curve: 0 },
    { a: 'smf', b: 'pcf', l: 'N7', k: 'sbi', curve: 0 },
    { a: 'smf', b: 'hss', l: 'N10', k: 'sbi', curve: 40 },
    { a: 'smf', b: 'chf', l: 'Nchf', k: 'sbi', curve: 30 },
    { a: 'upf', b: 'inet', l: 'N6', k: 'user', curve: 0 },
    { a: 'amf', b: 'smsf', l: 'Namf / Nsmsf (SMS)', k: 'sbi', curve: 0 },
    { a: 'smsf', b: 'smsc', l: 'SGd', k: 'diameter', curve: 0 },
  ],
  zones: [
    { x: 14, y: 30, w: 1152, h: 180, rx: 10, fill: '#0a1120', label: 'CONTROL PLANE / SUBSCRIBER DATA (5GC)', labelX: 26, labelY: 46, labelColor: '#41547a' },
    { x: 14, y: 240, w: 1152, h: 140, rx: 10, fill: '#0a1220', label: 'USER PLANE — N3 / N4 / N6', labelX: 26, labelY: 258, labelColor: '#41547a' },
  ],
};

const seams = {
  links: [
    { a: 'ue', b: 'sbg', l: 'Gm', k: 'ims', curve: 160, dash: '6 6' },
    { a: 'upf', b: 'sbg', l: 'N6 (ims)', k: 'user', curve: 0 },
    { a: 'sbg', b: 'pcf', l: 'N5', k: 'sbi', curve: -220 },
    { a: 'cscf', b: 'hss', l: 'Cx', k: 'diameter', curve: 90 },
    { a: 'mtas', b: 'hss', l: 'Sh', k: 'diameter', curve: 130, dash: '4 6' },
    { a: 'smsc', b: 'hss', l: 'S6c / MAP-C', k: 'diameter', curve: -60, dash: '4 6' },
  ],
};

export const fivegc = merge(
  { id: 'sa', label: '5G SA — 5GC', viewBox: '0 0 1180 640', minWidth: 940 },
  fiveGcCore,
  imsCore,
  imsPstn,
  imsPstnLink,
  messaging,
  seams,
);
