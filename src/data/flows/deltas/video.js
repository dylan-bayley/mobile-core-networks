import { insertAfter, patch } from '../compose.js';

/**
 * Turns a voice-call flow into a video-call flow: one SIP dialog carries two
 * media streams, so the delta touches the SDP offer, the policy-control
 * request and the media step, and inserts one extra dedicated-resource step
 * for the video stream. Parameterised so 4G (QCI 2) and 5G SA (5QI 2) share
 * the same delta.
 */
export function makeVideoDelta({ qosLabel, bearerAnchorId, bearerStep, mediaId = 'media-flowing' }) {
  return [
    patch('invite-sdp-offer', (s) => ({
      m: 'INVITE (SDP a/v)',
      t: 'INVITE with audio + video SDP offer',
      d:
        `${s.d} A video call adds a second m=video line to the same offer — typically H.264 constrained baseline ` +
        'with its own RTP/RTCP ports. One SIP dialog, two media streams.',
    })),
    patch('rx-aar', (s) => ({
      d:
        `${s.d} With two m-lines the AAR carries two Media-Components, so the policy controller returns two rules ` +
        '— one for audio, one for video.',
    })),
    insertAfter(bearerAnchorId, { ...bearerStep, tag: 'video' }),
    patch(mediaId, (s) => ({
      m: 'RTP audio + video',
      d:
        `${s.d} The video stream rides its own ${qosLabel} resource: 150 ms delay budget, 10⁻³ loss rate, sized ` +
        "from the negotiated video bitrate rather than the audio codec's fixed rate.",
    })),
  ];
}
