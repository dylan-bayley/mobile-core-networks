export const label = 'SMS';
export const blurb = 'Three ways a text reaches a handset over LTE';

export const steps = [
  { id: 'mo-sip-message', t: 'Mobile-originated: SIP MESSAGE', m: 'MESSAGE (RP-DATA)', p: ['ue', 'sbg', 'cscf'], k: 'ims',
    d: 'SMS over IP wraps the classic GSM message — the same RP-DATA and 140-octet TPDU the network has carried since 1992 — inside the body of a SIP MESSAGE request, sent over the QCI 5 IMS signalling bearer. Nothing above the transport layer changes, which is exactly why it was possible to keep SMS working when the CS domain went away.' },
  { id: 'isc-to-ipsmgw', t: 'iFC routes it to the IP-SM-GW', m: 'ISC MESSAGE', p: ['cscf', 'ipsmgw'], k: 'ims',
    d: 'An initial Filter Criteria matching the SMS content type sends the request to the IP-SM-GW rather than the MTAS. This node is the interworking function between IMS and the legacy messaging world; Ericsson ships it either standalone or as a function hosted on the MTAS.' },
  { id: 'submit-to-smsc', t: 'Submit to the SMS-C', m: 'MO-ForwardSM', p: ['ipsmgw', 'smsc'], k: 'diameter',
    d: 'IP-SM-GW unwraps the RP-DATA and submits it to the SMS-C over MAP or Diameter. The sender gets a 202 Accepted straight back; the actual delivery report arrives much later as a separate SIP MESSAGE. Note that the SMS-C is very often not an Ericsson node — messaging centres are commonly a different vendor to the core around them.' },
  { id: 'sri-for-sm', t: 'Where is the recipient?', m: 'SRI-for-SM', p: ['smsc', 'hss'], rt: true, k: 'diameter',
    d: 'The SMS-C asks the HSS for routing information: Send-Routing-Info-for-SM over MAP, or its Diameter equivalent on S6c. The HSS answers with the serving node address — an MME if the subscriber is on LTE, an MSC or SGSN if not. This single lookup is what decides which of the delivery paths below gets used.' },
  { id: 'delivery-sgd', t: 'Delivery over SGd', m: 'SGd MT-Forward-Short-Message', p: ['smsc', 'mme'], k: 'diameter',
    d: 'SMS in MME, standardised in Release 11: the SMS-C delivers straight to the MME over the SGd Diameter interface. No MSC anywhere in the path. This is what lets an operator run LTE with no circuit-switched domain at all, and it\'s the direction every network has been heading.' },
  { id: 'nas-delivery', t: 'NAS delivery to the handset', m: 'Downlink NAS Transport', p: ['mme', 'enb', 'ue'], rt: true, k: 'control',
    d: 'The MME encapsulates the short message in a NAS Downlink NAS Transport message — no bearer, no user plane, it rides the signalling connection. The UE acknowledges with an uplink NAS transport, and the delivery report walks the whole path back to the sender.' },
  { id: 'legacy-sgs', t: 'Legacy path: SMS over SGs', m: 'SGsAP Downlink Unitdata', p: ['smsc', 'msc', 'mme', 'enb', 'ue'], k: 'tdm',
    d: 'Before SGd, the MSC-S was the delivery node. The SMS-C hands the message over MAP, the MSC pushes it to the MME over SGs, and the MME turns it into the same NAS message. It only works if the UE did a combined EPS/IMSI attach so the MSC knows it exists — which is why an SGs association failure shows up as \'data works, texts don\'t\'.' },
  { id: 'mms-and-rcs-note', t: 'MMS and RCS are just data', m: 'MM1 over the mms APN', p: ['ue', 'enb', 'sgw', 'pgw', 'inet'], k: 'user',
    d: 'Neither of these uses any of the signalling above. MMS is an HTTP session to the MMSC over a separate mms APN with its own charging rules, and the notification that a message is waiting is itself an ordinary SMS — see the dedicated MMS flow for the full picture. RCS runs over IMS as another application server alongside the MTAS, using SIP and MSRP rather than the SMS transport layer.' },
];

export const ambient = [{ afterId: 'mms-and-rcs-note', p: ['ue', 'enb', 'sgw', 'pgw', 'inet'], k: 'user' }];
