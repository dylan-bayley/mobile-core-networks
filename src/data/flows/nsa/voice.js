import { compose } from '../compose.js';
import { steps as baseSteps, ambient } from '../fourg/voice.js';
import { makeNrLegReleaseDelta } from '../deltas/endc.js';

export const label = 'Voice call';
export const blurb = 'VoLTE on the LTE anchor — the NR secondary plays no part in the call itself';

export const steps = compose(
  baseSteps,
  ...makeNrLegReleaseDelta({ beforeId: 'sip-register', afterId: 'release-srvcc' }),
);

export { ambient };
