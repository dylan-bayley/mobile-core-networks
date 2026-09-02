import * as fourgData from './fourg/data.js';
import * as fourgIdle from './fourg/idle.js';
import * as fourgVoice from './fourg/voice.js';
import * as fourgVoiceMt from './fourg/voice-mt.js';
import * as fourgVideo from './fourg/video.js';
import * as fourgSms from './fourg/sms.js';
import * as fourgMms from './fourg/mms.js';
import * as nsaData from './nsa/data.js';
import * as nsaIdle from './nsa/idle.js';
import * as nsaVoice from './nsa/voice.js';
import * as nsaVoiceMt from './nsa/voice-mt.js';
import * as nsaVideo from './nsa/video.js';
import * as nsaSms from './nsa/sms.js';
import * as nsaMms from './nsa/mms.js';
import * as saData from './sa/data.js';
import * as saIdle from './sa/idle.js';
import * as saVoice from './sa/voice.js';
import * as saVoiceMt from './sa/voice-mt.js';
import * as saVoiceEpsfb from './sa/voice-epsfb.js';
import * as saVideo from './sa/video.js';
import * as saSms from './sa/sms.js';
import * as saMms from './sa/mms.js';

const asFlow = (mod) => ({
  label: mod.label,
  blurb: mod.blurb,
  steps: mod.steps,
  ambient: mod.ambient ?? [],
  topologyId: mod.topologyId,
});

/** FLOWS[networkId][flowId]. Flow ids are session ids or session-variant ids (see sessions.js). */
export const FLOWS = {
  '4g': {
    data: asFlow(fourgData),
    'data-idle': asFlow(fourgIdle),
    voice: asFlow(fourgVoice),
    'voice-mt': asFlow(fourgVoiceMt),
    video: asFlow(fourgVideo),
    sms: asFlow(fourgSms),
    mms: asFlow(fourgMms),
  },
  nsa: {
    data: asFlow(nsaData),
    'data-idle': asFlow(nsaIdle),
    voice: asFlow(nsaVoice),
    'voice-mt': asFlow(nsaVoiceMt),
    video: asFlow(nsaVideo),
    sms: asFlow(nsaSms),
    mms: asFlow(nsaMms),
  },
  sa: {
    data: asFlow(saData),
    'data-idle': asFlow(saIdle),
    voice: asFlow(saVoice),
    'voice-mt': asFlow(saVoiceMt),
    'voice-epsfb': asFlow(saVoiceEpsfb),
    video: asFlow(saVideo),
    sms: asFlow(saSms),
    mms: asFlow(saMms),
  },
};
