import { compose } from '../compose.js';
import { steps as voiceSteps, ambient } from './voice.js';
import { makeVideoDelta } from '../deltas/video.js';

export const label = 'Video call';
export const blurb = 'VoLTE call setup, plus a second dedicated bearer for the video stream';

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
      d: 'A second Create Bearer Request follows the first, this time for QCI 2 — conversational video, GBR, a looser 150 ms delay budget than voice but still guaranteed bit rate. The eNodeB admission-controls and radio-configures it exactly as it did the QCI 1 bearer.',
    },
  }),
);

export { ambient };
