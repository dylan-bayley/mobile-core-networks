export const label = 'SMS';
export const blurb = 'SMS over NAS via the AMF and SMSF — no IMS, no IP-SM-GW involved';

export const steps = [
  { id: 'mo-nas-sms', t: 'Mobile-originated: SMS over NAS', m: 'NAS Uplink Transport (SMS)', p: ['ue', 'gnb', 'amf'], k: 'control',
    d: "5G doesn't route SMS through IMS at all — it rides the same NAS signalling connection used for registration, wrapped in a NAS Transport message, exactly as 4G could do once SMS-in-MME shipped. The underlying RP-DATA and 140-octet TPDU are, once again, completely unchanged." },
  { id: 'amf-to-smsf', t: 'AMF hands off to the SMSF', m: 'Namf / Nsmsf', p: ['amf', 'smsf'], k: 'sbi',
    d: "The AMF doesn't interpret the SMS payload itself — it forwards it to the SMSF, the function that actually speaks the legacy messaging protocols on the network's behalf. This is the direct 5G analogue of the MME handing off to the IP-SM-GW, minus the IMS/SIP wrapping." },
  { id: 'submit-to-smsc-5g', t: 'Submit to the SMS-C', m: 'MO-ForwardSM', p: ['smsf', 'smsc'], k: 'diameter',
    d: 'SMSF submits to the SMS-C over SGd — 3GPP reused the same interface name and Diameter application 4G defined, just terminated by the SMSF instead of the MME. The SMS-C itself is often the exact same node serving both 4G and 5G subscribers.' },
  { id: 'sri-for-sm-5g', t: 'Where is the recipient?', m: 'SRI-for-SM', p: ['smsc', 'hss'], rt: true, k: 'diameter',
    d: 'The SMS-C asks the converged UDM/HSS for routing information, same as it would for a 4G or even 2G/3G subscriber. The answer this time is the serving AMF rather than an MME, MSC or SGSN.' },
  { id: 'mt-delivery-smsf', t: 'Delivery to the SMSF', m: 'MT-Forward-Short-Message', p: ['smsc', 'smsf'], k: 'diameter',
    d: 'SMS-C delivers to the serving SMSF over the same SGd interface used for mobile-originated submission.' },
  { id: 'nas-mt-delivery', t: 'NAS delivery to the handset', m: 'NAS Downlink Transport', p: ['smsf', 'amf', 'gnb', 'ue'], rt: true, k: 'control',
    d: 'SMSF hands the message to the AMF, which — exactly like the MME in 4G — encapsulates it in a NAS Downlink Transport message and delivers it over the existing signalling connection. No PDU Session, no user plane, no IMS. The UE acknowledges uplink and the delivery report walks back the same way.' },
  { id: 'mms-rcs-note-5g', t: 'MMS and RCS are still just data', m: 'MM1 over the mms DNN', p: ['ue', 'gnb', 'upf', 'inet'], k: 'user',
    d: 'MMS is an HTTP session to the MMSC over its own DNN, with the "message waiting" notification delivered by exactly the NAS mechanism above — see the dedicated MMS flow. RCS still runs over IMS through the same MTAS-adjacent application server used for 4G, using SIP and MSRP rather than any of the SMS transport described here.' },
];

export const ambient = [{ afterId: 'mms-rcs-note-5g', p: ['ue', 'gnb', 'upf', 'inet'], k: 'user' }];
