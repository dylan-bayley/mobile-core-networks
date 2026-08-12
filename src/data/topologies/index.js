import { epc } from './epc.js';
import { nsa } from './nsa.js';
import { fivegc } from './fivegc.js';

export const TOPOLOGIES = {
  '4g': epc,
  nsa,
  sa: fivegc,
};
