import { imsCore, smsGateway, imsPstn, imsPstnLink, csDomain, messaging, merge } from './fragments.js';

const epcCore = {
  nodes: {
    ue: { cx: 64, cy: 310, w: 88, h: 52, t: 'UE', s: 'USIM / ISIM' },
    enb: { cx: 196, cy: 310, w: 112, h: 52, t: 'eNodeB', s: 'E-UTRAN / RBS' },
    mme: { cx: 250, cy: 175, w: 132, h: 56, t: 'MME', s: 'SGSN-MME' },
    eir: { cx: 170, cy: 80, w: 120, h: 56, t: 'EIR', s: 'IMEI register' },
    hss: { cx: 420, cy: 80, w: 144, h: 56, t: 'HSS', s: 'HSS-FE + CUDB' },
    pcrf: { cx: 640, cy: 80, w: 132, h: 56, t: 'PCRF', s: 'SAPC' },
    ocs: { cx: 860, cy: 80, w: 124, h: 56, t: 'OCS', s: 'Charging System' },
    sgw: { cx: 390, cy: 310, w: 116, h: 52, t: 'S-GW', s: 'EPG' },
    pgw: { cx: 570, cy: 310, w: 124, h: 52, t: 'P-GW', s: 'EPG / SAE-GW' },
    inet: { cx: 940, cy: 310, w: 112, h: 48, t: 'Internet', s: 'SGi / APN' },
  },
  links: [
    { a: 'ue', b: 'enb', l: 'LTE-Uu', k: 'radio', curve: 0 },
    { a: 'enb', b: 'mme', l: 'S1-MME', k: 'control', curve: 0 },
    { a: 'enb', b: 'sgw', l: 'S1-U', k: 'user', curve: 0 },
    { a: 'mme', b: 'eir', l: 'S13', k: 'diameter', curve: 0 },
    { a: 'mme', b: 'hss', l: 'S6a', k: 'diameter', curve: 0 },
    { a: 'mme', b: 'sgw', l: 'S11', k: 'control', curve: 0 },
    { a: 'sgw', b: 'pgw', l: 'S5 / S8', k: 'user', curve: 0 },
    { a: 'pgw', b: 'pcrf', l: 'Gx', k: 'diameter', curve: 0 },
    { a: 'pgw', b: 'ocs', l: 'Gy / Gz', k: 'diameter', curve: 30 },
    { a: 'pgw', b: 'inet', l: 'SGi', k: 'user', curve: 0 },
    { a: 'pgw', b: 'sbg', l: 'SGi (ims)', k: 'user', curve: 0 },
  ],
  zones: [
    { x: 14, y: 30, w: 1152, h: 180, rx: 10, fill: '#0a1120', label: 'CONTROL PLANE / SUBSCRIBER DATA', labelX: 26, labelY: 46, labelColor: '#41547a' },
    { x: 14, y: 240, w: 1152, h: 140, rx: 10, fill: '#0a1220', label: 'USER PLANE — BEARER PATH', labelX: 26, labelY: 258, labelColor: '#41547a' },
  ],
};

/** Seam links: connect the EPC core, IMS core and CS/messaging fragments together. */
const seams = {
  links: [
    { a: 'mme', b: 'smsc', l: 'SGd', k: 'diameter', curve: 45 },
    { a: 'mme', b: 'msc', l: 'SGs / Sv', k: 'tdm', curve: 0, dash: '5 5' },
    { a: 'ue', b: 'sbg', l: 'Gm', k: 'ims', curve: 160, dash: '6 6' },
    { a: 'sbg', b: 'pcrf', l: 'Rx', k: 'diameter', curve: -200 },
    { a: 'cscf', b: 'hss', l: 'Cx', k: 'diameter', curve: 120 },
    { a: 'mtas', b: 'hss', l: 'Sh', k: 'diameter', curve: 150, dash: '4 6' },
    { a: 'smsc', b: 'hss', l: 'S6c / MAP-C', k: 'diameter', curve: -40, dash: '4 6' },
    { a: 'smsc', b: 'ipsmgw', l: 'MAP / SGd', k: 'diameter', curve: 0 },
    { a: 'msc', b: 'smsc', l: 'MAP-E', k: 'tdm', curve: -300, dash: '5 5' },
  ],
};

export const epc = merge(
  { id: '4g', label: '4G LTE — EPC', viewBox: '0 0 1180 640', minWidth: 940 },
  epcCore,
  imsCore,
  smsGateway,
  imsPstn,
  imsPstnLink,
  csDomain,
  messaging,
  seams,
);
