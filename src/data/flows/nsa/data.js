import { compose } from '../compose.js';
import { steps as baseSteps } from '../fourg/data.js';
import { makeEndcAdditionDelta } from '../deltas/endc.js';

export const label = 'Data session';
export const blurb = 'LTE attach and control plane, with a secondary NR cell added for the user-plane bearer';

export const steps = compose(baseSteps, ...makeEndcAdditionDelta({ afterId: 'modify-bearer-request' }));

export const ambient = [{ afterId: 'user-plane-traffic', p: ['ue', 'gnb', 'sgw', 'pgw', 'inet'], k: 'user' }];
