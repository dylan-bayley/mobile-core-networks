import * as fourgData from './fourg/data.js';
import * as fourgVoice from './fourg/voice.js';
import * as fourgSms from './fourg/sms.js';

const asFlow = (mod, { topologyId } = {}) => ({
  label: mod.label,
  blurb: mod.blurb,
  steps: mod.steps,
  ambient: mod.ambient ?? [],
  topologyId,
});

export const FLOWS = {
  '4g': {
    data: asFlow(fourgData),
    voice: asFlow(fourgVoice),
    sms: asFlow(fourgSms),
  },
};
