import * as fourgData from './fourg/data.js';
import * as fourgVoice from './fourg/voice.js';
import * as fourgVideo from './fourg/video.js';
import * as fourgSms from './fourg/sms.js';
import * as fourgMms from './fourg/mms.js';
import * as nsaData from './nsa/data.js';
import * as nsaVoice from './nsa/voice.js';
import * as nsaVideo from './nsa/video.js';
import * as nsaSms from './nsa/sms.js';
import * as nsaMms from './nsa/mms.js';
import * as saData from './sa/data.js';
import * as saVoice from './sa/voice.js';
import * as saVideo from './sa/video.js';
import * as saSms from './sa/sms.js';
import * as saMms from './sa/mms.js';

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
  nsa: {
    data: asFlow(nsaData),
    voice: asFlow(nsaVoice),
    video: asFlow(nsaVideo),
    sms: asFlow(nsaSms),
    mms: asFlow(nsaMms),
  },
  sa: {
    data: asFlow(saData),
    voice: asFlow(saVoice),
    video: asFlow(saVideo),
    sms: asFlow(saSms),
    mms: asFlow(saMms),
  },
};
