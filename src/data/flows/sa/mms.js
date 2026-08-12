import { compose } from '../compose.js';
import { steps as dataSteps } from './data.js';
import { steps as smsSteps } from './sms.js';
import { makeMmsDelta } from '../deltas/mms.js';

export const label = 'MMS';
export const blurb = 'Same MM1/MMSC mechanism as 4G, over a PDU Session instead of a PDN connection';

export const steps = compose(
  dataSteps,
  ...makeMmsDelta({
    smsSteps,
    notifyStepId: 'nas-mt-delivery',
    apnLabel: 'mms DNN',
    pdnAnchorId: 'user-plane-traffic',
    pdnPath: ['ue', 'gnb', 'upf'],
    trafficPath: ['ue', 'gnb', 'upf', 'inet'],
  }),
);

export const ambient = [{ afterId: 'mm1-submit', p: ['ue', 'gnb', 'upf', 'inet'], k: 'user' }];
