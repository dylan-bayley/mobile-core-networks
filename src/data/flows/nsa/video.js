import { compose } from '../compose.js';
import { steps as voiceSteps, ambient } from './voice.js';
import { makeVideoDelta } from '../deltas/video.js';

export const label = 'Video call';
export const blurb = 'VoLTE-style call setup on the LTE anchor, plus a second dedicated bearer for video';

export const steps = compose(
  voiceSteps,
  ...makeVideoDelta({
    qosLabel: 'QCI 2',
    bearerAnchorId: 'e-rab-setup',
    bearerStep: {
      id: 'video-bearer',
      t: 'Second dedicated bearer for the video stream',
      m: 'Create Bearer (QCI 2)',
      p: ['pgw', 'sgw', 'mme'],
      k: 'control',
      d: 'Exactly as on 4G: a second Create Bearer Request for QCI 2 follows the first. The NR secondary — already released for the call — has no role in either bearer.',
    },
  }),
);

export { ambient };
