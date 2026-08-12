import { insertAfter, byId } from '../compose.js';

/**
 * Turns a data-session flow into an MMS flow: MMS rides HTTP over its own
 * APN/DNN, not any of the SMS signalling — but the "message waiting"
 * notification really is an ordinary SMS, so this delta does a named lookup
 * of the real SMS flow's delivery step and reuses it verbatim rather than
 * re-describing (and risking diverging from) the mechanism.
 */
export function makeMmsDelta({ smsSteps, notifyStepId, apnLabel = 'mms APN', pdnAnchorId, pdnPath, trafficPath }) {
  const smsById = byId(smsSteps);
  const notifyStep = smsById[notifyStepId];

  return [
    insertAfter(
      pdnAnchorId,
      {
        id: 'mms-pdn',
        t: `Separate PDN to the ${apnLabel}`,
        m: 'PDN connectivity (mms)',
        p: pdnPath,
        k: 'control',
        tag: 'mms',
        d: `MMS traditionally gets its own PDN connection to a dedicated ${apnLabel}, kept apart from the internet APN so an operator can zero-rate or separately charge it. The bearer itself is an ordinary non-GBR default bearer — MMS is just HTTP, so it needs no special QoS treatment.`,
      },
      {
        id: 'mm1-submit',
        t: 'MM1 submit to the MMSC',
        m: 'POST /mms (MM1_submit.REQ)',
        p: trafficPath,
        k: 'user',
        tag: 'mms',
        d: 'The handset POSTs the multipart MIME message — headers plus the actual image/video/audio payload — to the MMSC over plain HTTP on the mms APN. The MMSC responds with an MM1_submit.RES and a message reference.',
      },
      {
        ...notifyStep,
        id: 'mms-notify',
        tag: 'mms',
        t: 'The notification is itself an SMS',
        m: 'MM1_notification (WAP push SMS)',
        d: `The MMSC tells the recipient a message is waiting by sending a WAP-push notification inside an ordinary SMS — delivered by exactly the mechanism described elsewhere in this explorer: ${notifyStep.d}`,
      },
      {
        id: 'mm1-retrieve',
        t: 'Handset retrieves the message body',
        m: 'GET (MM1_retrieve)',
        p: trafficPath,
        k: 'user',
        tag: 'mms',
        d: 'Tapping the notification triggers an HTTP GET back to the MMSC — again over the mms APN, again just data — which returns the full multipart message. Only now does the actual picture or video land on the handset.',
      },
    ),
  ];
}
