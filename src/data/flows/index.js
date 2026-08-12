import * as fourgData from './fourg/data.js';
import * as fourgVoice from './fourg/voice.js';
import * as fourgVideo from './fourg/video.js';
import * as fourgSms from './fourg/sms.js';
import * as fourgMms from './fourg/mms.js';

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
    video: asFlow(fourgVideo),
    sms: asFlow(fourgSms),
    mms: asFlow(fourgMms),
  },
};
