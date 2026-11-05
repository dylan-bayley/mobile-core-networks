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
import { PLAIN_FLOWS } from './plain.js';

const asFlow = (mod, flowId) => ({
  label: mod.label,
  blurb: mod.blurb,
  steps: mod.steps,
  ambient: mod.ambient ?? [],
  topologyId: mod.topologyId,
  plain: PLAIN_FLOWS[flowId] ?? null,
});

/** FLOWS[networkId][flowId]. Flow ids are session ids or session-variant ids (see sessions.js). */
export const FLOWS = {
  '4g': {
    data: asFlow(fourgData, 'data'),
    'data-idle': asFlow(fourgIdle, 'data-idle'),
    voice: asFlow(fourgVoice, 'voice'),
    'voice-mt': asFlow(fourgVoiceMt, 'voice-mt'),
    video: asFlow(fourgVideo, 'video'),
    sms: asFlow(fourgSms, 'sms'),
    mms: asFlow(fourgMms, 'mms'),
  },
  nsa: {
    data: asFlow(nsaData, 'data'),
    'data-idle': asFlow(nsaIdle, 'data-idle'),
    voice: asFlow(nsaVoice, 'voice'),
    'voice-mt': asFlow(nsaVoiceMt, 'voice-mt'),
    video: asFlow(nsaVideo, 'video'),
    sms: asFlow(nsaSms, 'sms'),
    mms: asFlow(nsaMms, 'mms'),
  },
  sa: {
    data: asFlow(saData, 'data'),
    'data-idle': asFlow(saIdle, 'data-idle'),
    voice: asFlow(saVoice, 'voice'),
    'voice-mt': asFlow(saVoiceMt, 'voice-mt'),
    'voice-epsfb': asFlow(saVoiceEpsfb, 'voice-epsfb'),
    video: asFlow(saVideo, 'video'),
    sms: asFlow(saSms, 'sms'),
    mms: asFlow(saMms, 'mms'),
  },
};
