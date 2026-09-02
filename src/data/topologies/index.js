import { epc } from './epc.js';
import { nsa } from './nsa.js';
import { fivegc } from './fivegc.js';
import { epsfb } from './epsfb.js';

export const TOPOLOGIES = {
  [epc.id]: epc,
  [nsa.id]: nsa,
  [fivegc.id]: fivegc,
  [epsfb.id]: epsfb,
};
