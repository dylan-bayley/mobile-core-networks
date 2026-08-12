import { compose } from '../compose.js';
import { steps as dataSteps } from './data.js';
import { steps as smsSteps } from './sms.js';
import { makeMmsDelta } from '../deltas/mms.js';

export const label = 'MMS';
export const blurb = 'A dedicated APN, plain HTTP to the MMSC, and a notification that is itself an SMS';

export const steps = compose(
  dataSteps,
  ...makeMmsDelta({
    smsSteps,
    notifyStepId: 'nas-delivery',
    pdnAnchorId: 'user-plane-traffic',
    pdnPath: ['ue', 'enb', 'sgw', 'pgw'],
    trafficPath: ['ue', 'enb', 'sgw', 'pgw', 'inet'],
  }),
);

export const ambient = [{ afterId: 'mm1-submit', p: ['ue', 'enb', 'sgw', 'pgw', 'inet'], k: 'user' }];
