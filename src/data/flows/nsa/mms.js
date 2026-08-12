import { compose } from '../compose.js';
import { steps as dataSteps } from './data.js';
import { steps as smsSteps } from '../fourg/sms.js';
import { makeMmsDelta } from '../deltas/mms.js';

export const label = 'MMS';
export const blurb = 'Same MM1/MMSC mechanism as 4G, riding whichever bearer is active once EN-DC is up';

export const steps = compose(
  dataSteps,
  ...makeMmsDelta({
    smsSteps,
    notifyStepId: 'nas-delivery',
    pdnAnchorId: 'user-plane-traffic',
    pdnPath: ['ue', 'enb', 'sgw', 'pgw'],
    trafficPath: ['ue', 'gnb', 'sgw', 'pgw', 'inet'],
  }),
);

export const ambient = [{ afterId: 'mm1-submit', p: ['ue', 'gnb', 'sgw', 'pgw', 'inet'], k: 'user' }];
