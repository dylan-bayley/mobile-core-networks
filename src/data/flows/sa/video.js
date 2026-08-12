import { compose } from '../compose.js';
import { steps as voiceSteps, ambient } from './voice.js';
import { makeVideoDelta } from '../deltas/video.js';

export const label = 'Video call';
export const blurb = 'VoNR call setup, plus a second QoS Flow for the video stream';

export const steps = compose(
  voiceSteps,
  ...makeVideoDelta({
    qosLabel: '5QI 2',
    bearerAnchorId: 'n2-resource-setup',
    bearerStep: {
      id: 'video-qos-flow',
      t: 'Second QoS Flow for the video stream',
      m: 'N2 Request → RRC Reconfig (5QI 2)',
      p: ['amf', 'gnb', 'ue'],
      k: 'control',
      d: 'A second N2 PDU Session Resource Modify follows the first, this time for 5QI 2 — conversational video, GBR, a looser 150 ms delay budget than voice. The gNB admission-controls and radio-configures it exactly as it did the 5QI 1 flow.',
    },
  }),
);

export { ambient };
