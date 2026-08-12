import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ------------------------------------------------------------------
   4G core (EPC + IMS) call-flow explorer — Ericsson node naming
   Scenarios: data session, VoLTE call, SMS/messaging
   ------------------------------------------------------------------ */

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const K = {
  radio:    { c: "#f5b544", n: "Radio / NAS" },
  control:  { c: "#4fb3ff", n: "GTP-C / S1AP" },
  diameter: { c: "#ff6fae", n: "Diameter / MAP" },
  ims:      { c: "#b08cff", n: "SIP" },
  user:     { c: "#3fd6a0", n: "User plane" },
  media:    { c: "#ff8a5c", n: "Voice media" },
  tdm:      { c: "#8fa3bf", n: "Legacy / CS domain" },
};

const BG = "#070b14";
const PANEL = "#0d1424";
const EDGE = "#1e2a42";

/* ---------------------------- topology ---------------------------- */

const NODES = {
  ue:     { cx: 64,   cy: 310, w: 88,  h: 52, t: "UE",       s: "USIM / ISIM" },
  enb:    { cx: 196,  cy: 310, w: 112, h: 52, t: "eNodeB",   s: "E-UTRAN / RBS" },
  mme:    { cx: 250,  cy: 175, w: 132, h: 56, t: "MME",      s: "SGSN-MME" },
  eir:    { cx: 170,  cy: 80,  w: 120, h: 56, t: "EIR",      s: "IMEI register" },
  hss:    { cx: 420,  cy: 80,  w: 144, h: 56, t: "HSS",      s: "HSS-FE + CUDB" },
  pcrf:   { cx: 640,  cy: 80,  w: 132, h: 56, t: "PCRF",     s: "SAPC" },
  ocs:    { cx: 860,  cy: 80,  w: 124, h: 56, t: "OCS",      s: "Charging System" },
  smsc:   { cx: 1090, cy: 175, w: 140, h: 56, t: "SMS-C",    s: "SMS-SC / GMSC" },
  sgw:    { cx: 390,  cy: 310, w: 116, h: 52, t: "S-GW",     s: "EPG" },
  pgw:    { cx: 570,  cy: 310, w: 124, h: 52, t: "P-GW",     s: "EPG / SAE-GW" },
  inet:   { cx: 940,  cy: 310, w: 112, h: 48, t: "Internet", s: "SGi / APN" },
  sbg:    { cx: 560,  cy: 460, w: 146, h: 56, t: "P-CSCF",   s: "SBG + IMS-AGW" },
  cscf:   { cx: 740,  cy: 460, w: 132, h: 56, t: "I/S-CSCF", s: "CSCF" },
  mtas:   { cx: 920,  cy: 460, w: 132, h: 56, t: "TAS",      s: "MTAS (MMTel)" },
  ipsmgw: { cx: 1090, cy: 460, w: 150, h: 56, t: "IP-SM-GW", s: "SMS over IP" },
  msc:    { cx: 390,  cy: 580, w: 140, h: 52, t: "MSC-S",    s: "CSFB / SRVCC" },
  mgcf:   { cx: 740,  cy: 580, w: 150, h: 52, t: "MGCF",     s: "M-MGw" },
  pstn:   { cx: 920,  cy: 580, w: 112, h: 48, t: "PSTN",     s: "ISUP / BICC" },
};

const LINKS = [
  { a: "ue",   b: "enb",    l: "LTE-Uu",      k: "radio",    curve: 0 },
  { a: "enb",  b: "mme",    l: "S1-MME",      k: "control",  curve: 0 },
  { a: "enb",  b: "sgw",    l: "S1-U",        k: "user",     curve: 0 },
  { a: "mme",  b: "eir",    l: "S13",         k: "diameter", curve: 0 },
  { a: "mme",  b: "hss",    l: "S6a",         k: "diameter", curve: 0 },
  { a: "mme",  b: "sgw",    l: "S11",         k: "control",  curve: 0 },
  { a: "mme",  b: "smsc",   l: "SGd",         k: "diameter", curve: 45 },
  { a: "mme",  b: "msc",    l: "SGs / Sv",    k: "tdm",      curve: 0, dash: "5 5" },
  { a: "sgw",  b: "pgw",    l: "S5 / S8",     k: "user",     curve: 0 },
  { a: "pgw",  b: "pcrf",   l: "Gx",          k: "diameter", curve: 0 },
  { a: "pgw",  b: "ocs",    l: "Gy / Gz",     k: "diameter", curve: 30 },
  { a: "pgw",  b: "inet",   l: "SGi",         k: "user",     curve: 0 },
  { a: "pgw",  b: "sbg",    l: "SGi (ims)",   k: "user",     curve: 0 },
  { a: "ue",   b: "sbg",    l: "Gm",          k: "ims",      curve: 160, dash: "6 6" },
  { a: "sbg",  b: "pcrf",   l: "Rx",          k: "diameter", curve: -200 },
  { a: "sbg",  b: "cscf",   l: "Mw",          k: "ims",      curve: 0 },
  { a: "cscf", b: "mtas",   l: "ISC",         k: "ims",      curve: 0 },
  { a: "cscf", b: "ipsmgw", l: "ISC (SMS)",   k: "ims",      curve: 140 },
  { a: "cscf", b: "hss",    l: "Cx",          k: "diameter", curve: 120 },
  { a: "mtas", b: "hss",    l: "Sh",          k: "diameter", curve: 150, dash: "4 6" },
  { a: "smsc", b: "hss",    l: "S6c / MAP-C", k: "diameter", curve: -40, dash: "4 6" },
  { a: "smsc", b: "ipsmgw", l: "MAP / SGd",   k: "diameter", curve: 0 },
  { a: "msc",  b: "smsc",   l: "MAP-E",       k: "tdm",      curve: -300, dash: "5 5" },
  { a: "cscf", b: "mgcf",   l: "Mj",          k: "ims",      curve: 0 },
  { a: "mgcf", b: "pstn",   l: "ISUP",        k: "tdm",      curve: 0 },
];

/* ---------------------------- scenarios --------------------------- */

const DATA_STEPS = [
  { t: "RRC setup + Attach Request", m: "Attach Request", p: ["ue", "enb"], k: "radio",
    d: "The UE brings up an RRC connection, then sends the NAS Attach Request (IMSI, or a GUTI if it has one) with a PDN Connectivity Request piggybacked. Requested APN, UE network capability and PDN type all ride along." },
  { t: "S1AP Initial UE Message", m: "Initial UE Message", p: ["enb", "mme"], k: "control",
    d: "The eNodeB picks an MME from its S1-flex pool using the relative capacity weights each MME advertises, and forwards the NAS payload over SCTP. In an Ericsson network the MME function lives inside the SGSN-MME — the same node also serves 2G/3G as an SGSN, which is why you'll find GPRS parameters in its config." },
  { t: "Authentication vectors", m: "S6a AIR / AIA", p: ["mme", "hss"], rt: true, k: "diameter",
    d: "MME asks for EPS authentication vectors: RAND, AUTN, XRES and KASME, derived from the subscriber key K. Ericsson splits this under the UDC architecture — HSS-FE is a stateless Diameter front end, the subscriber data itself sits in the CUDB." },
  { t: "EPS-AKA and NAS security", m: "Auth + Security Mode", p: ["mme", "enb", "ue"], rt: true, k: "control",
    d: "Authentication Request/Response, then NAS Security Mode Command/Complete. Integrity protection and ciphering come up for NAS, and the eNodeB does the same for the access stratum using keys derived from KASME." },
  { t: "Equipment identity check", m: "S13 ECR / ECA", p: ["mme", "eir"], rt: true, k: "diameter",
    d: "If the MME doesn't already hold the IMEISV it sends a NAS Identity Request to get it, then checks the handset with the EIR. The ME-Identity-Check-Request carries the IMEI; the answer is an equipment status — white, grey or black. A blacklisted handset is rejected no matter how valid the SIM is." },
  { t: "Update Location", m: "S6a ULR / ULA", p: ["mme", "hss"], rt: true, k: "diameter",
    d: "MME registers as the serving node. HSS returns the subscription profile: APN list and default APN, subscribed QCI and ARP, APN-AMBR and UE-AMBR, plus a statically allocated P-GW if the subscriber has one." },
  { t: "Create Session Request", m: "S11 Create Session", p: ["mme", "sgw"], k: "control",
    d: "MME resolves the gateways through DNS — TAI-FQDN for the S-GW, APN-FQDN for the P-GW — then sends GTP-C v2 Create Session Request carrying IMSI, APN, RAT type, bearer QoS and its own F-TEID." },
  { t: "Session request to the P-GW", m: "S5 Create Session", p: ["sgw", "pgw"], k: "control",
    d: "S-GW allocates its S1-U and S5-U TEIDs and relays the request. On Ericsson EPG the two gateways are usually one node in combined SAE-GW mode, so S5 becomes internal — worth knowing before you go hunting for it in a packet capture." },
  { t: "Policy decision", m: "Gx CCR-I / CCA-I", p: ["pgw", "pcrf"], rt: true, k: "diameter",
    d: "P-GW allocates the UE's IP address and asks for policy. Ericsson SAPC answers with PCC rules: the default bearer QCI (8 or 9 for internet), APN-AMBR, gating status and charging keys." },
  { t: "Credit control", m: "Gy CCR-I", p: ["pgw", "ocs"], rt: true, k: "diameter",
    d: "For prepaid, the P-GW reserves quota per rating group from the online charging system and reports usage as it burns through it. Postpaid usage is written as CDRs over Gz instead." },
  { t: "Create Session Response", m: "Create Session Rsp", p: ["pgw", "sgw", "mme"], k: "control",
    d: "Comes back with the UE IP address, the P-GW's S5-U TEID, and Protocol Configuration Options. PCO is where the UE learns its DNS servers — and on the IMS APN, the P-CSCF address it will register against." },
  { t: "Initial Context Setup / Attach Accept", m: "S1AP ICS Request", p: ["mme", "enb", "ue"], k: "control",
    d: "MME hands the eNodeB the S-GW's S1-U TEID, the E-RAB QoS and the security context. The eNodeB sets up the data radio bearer with an RRC Connection Reconfiguration and replies with its own S1-U TEID." },
  { t: "Modify Bearer Request", m: "S11 Modify Bearer", p: ["mme", "sgw"], k: "control",
    d: "MME passes the eNodeB TEID down to the S-GW so downlink traffic knows where to land. The default EPS bearer is now up end to end." },
  { t: "User plane carrying traffic", m: "GTP-U payload", p: ["ue", "enb", "sgw", "pgw", "inet"], k: "user",
    d: "Traffic is tunnelled in GTP-U across S1-U and S5-U and breaks out at SGi. Default bearer, QCI 9, non-GBR, policed by the APN-AMBR. Each tunnel is identified by a TEID rather than the UE's IP — mismatched TEIDs are the classic cause of an attach that succeeds but passes no data." },
];

const VOLTE_STEPS = [
  { t: "Second PDN to the ims APN", m: "IMS PDN connectivity", p: ["ue", "enb", "sgw", "pgw"], k: "control",
    d: "VoLTE needs its own PDN connection to the ims APN, with a default bearer on QCI 5 — non-GBR, priority 1 — reserved for SIP. The P-CSCF address is returned to the UE in the PCO of the Create Session Response." },
  { t: "SIP REGISTER", m: "REGISTER", p: ["ue", "sbg"], k: "ims",
    d: "The UE registers over the QCI 5 bearer. Gm terminates on the Ericsson SBG, which hosts the P-CSCF signalling function alongside the IMS-AGW that will later handle the media." },
  { t: "S-CSCF assignment", m: "Mw + Cx UAR / UAA", p: ["sbg", "cscf", "hss"], rt: true, k: "ims",
    d: "P-CSCF forwards to the I-CSCF, which queries the HSS over Cx to select an S-CSCF for this subscriber. Ericsson runs I-CSCF and S-CSCF as one CSCF node, virtualised as part of Cloud IMS." },
  { t: "IMS-AKA challenge", m: "401 → REGISTER → 200 OK", p: ["cscf", "sbg", "ue"], rt: true, k: "ims",
    d: "S-CSCF challenges with a 401; the UE computes the response on its ISIM and re-REGISTERs. S-CSCF then downloads the service profile with Cx SAR/SAA, and IPsec security associations come up on Gm." },
  { t: "Third-party REGISTER", m: "ISC REGISTER", p: ["cscf", "mtas"], k: "ims",
    d: "Initial Filter Criteria in the service profile trigger a third-party REGISTER towards the MTAS, Ericsson's MMTel application server. MTAS pulls the telephony data it needs — diversion, barring, CLI presentation — from the HSS over Sh." },
  { t: "INVITE with SDP offer", m: "INVITE (SDP)", p: ["ue", "sbg", "cscf"], k: "ims",
    d: "A-party sends INVITE with an SDP offer: AMR or AMR-WB codec, RTP and RTCP ports, and preconditions required so the phone can't ring before a media bearer exists." },
  { t: "Originating services and routing", m: "iFC → MTAS → ENUM", p: ["cscf", "mtas"], rt: true, k: "ims",
    d: "MTAS applies originating MMTel services, then the dialled E.164 number is resolved through ENUM/DNS. On-net it routes to the terminating S-CSCF; off-net it heads for another operator or the PSTN." },
  { t: "183 Session Progress", m: "183 (SDP answer)", p: ["cscf", "sbg"], k: "ims",
    d: "The far end answers with its SDP. Codec and media addresses are agreed, so the network now knows exactly how much bandwidth to reserve and for which 5-tuple." },
  { t: "Media authorisation", m: "Rx AAR / AAA", p: ["sbg", "pcrf"], rt: true, k: "diameter",
    d: "P-CSCF passes the negotiated media description to the PCRF over Rx. This is the hinge between IMS and the packet core — SAPC turns a SIP session description into a policy decision." },
  { t: "PCC rule pushed to the P-GW", m: "Gx RAR / RAA", p: ["pcrf", "pgw"], rt: true, k: "diameter",
    d: "SAPC sends an unsolicited Re-Auth Request installing a rule for a dedicated GBR bearer: QCI 1, ARP per operator policy, GBR and MBR sized from the codec, and a TFT matching the RTP flow." },
  { t: "Create Bearer Request", m: "Create Bearer Req", p: ["pgw", "sgw", "mme"], k: "control",
    d: "The P-GW initiates the dedicated bearer downwards through S5 and S11. Note the direction: unlike attach, the network pushes this one, not the UE." },
  { t: "E-RAB setup on the radio", m: "E-RAB Setup Request", p: ["mme", "enb", "ue"], k: "control",
    d: "The eNodeB admission-controls the GBR bearer and reconfigures the radio: dedicated bearer on QCI 1, RoHC to compress the IP/UDP/RTP header, and typically semi-persistent scheduling or TTI bundling at cell edge." },
  { t: "Alerting and answer", m: "180 → 200 OK → ACK", p: ["ue", "sbg", "cscf"], rt: true, k: "ims",
    d: "With preconditions met the far end can ring. 180 Ringing, then 200 OK and ACK. All of this signalling stays on the QCI 5 bearer, separate from the voice itself." },
  { t: "Voice media flowing", m: "RTP / RTCP", p: ["ue", "enb", "sgw", "pgw", "sbg"], k: "media",
    d: "RTP rides the QCI 1 dedicated bearer: 100 ms packet delay budget, 10⁻² loss rate, guaranteed bit rate. Media passes through the SBG's IMS-AGW for topology hiding and transcoding where the far end needs it." },
  { t: "PSTN breakout, if off-net", m: "SIP → ISUP", p: ["cscf", "mgcf", "pstn"], k: "tdm",
    d: "For a fixed or legacy mobile number, the MGCF interworks SIP to ISUP or BICC and the Ericsson M-MGw handles the media, transcoding AMR to G.711." },
  { t: "Release — and SRVCC", m: "BYE → Rx STR → Delete Bearer", p: ["ue", "sbg", "pcrf"], k: "ims",
    d: "BYE triggers an Rx Session Termination, SAPC withdraws the rule over Gx and the QCI 1 bearer is deleted; QCI 5 stays up for the next call. If the UE runs out of LTE coverage mid-call, the MME triggers SRVCC over Sv and the MSC-S continues the call on WCDMA or GSM." },
];

const SMS_STEPS = [
  { t: "Mobile-originated: SIP MESSAGE", m: "MESSAGE (RP-DATA)", p: ["ue", "sbg", "cscf"], k: "ims",
    d: "SMS over IP wraps the classic GSM message — the same RP-DATA and 140-octet TPDU the network has carried since 1992 — inside the body of a SIP MESSAGE request, sent over the QCI 5 IMS signalling bearer. Nothing above the transport layer changes, which is exactly why it was possible to keep SMS working when the CS domain went away." },
  { t: "iFC routes it to the IP-SM-GW", m: "ISC MESSAGE", p: ["cscf", "ipsmgw"], k: "ims",
    d: "An initial Filter Criteria matching the SMS content type sends the request to the IP-SM-GW rather than the MTAS. This node is the interworking function between IMS and the legacy messaging world; Ericsson ships it either standalone or as a function hosted on the MTAS." },
  { t: "Submit to the SMS-C", m: "MO-ForwardSM", p: ["ipsmgw", "smsc"], k: "diameter",
    d: "IP-SM-GW unwraps the RP-DATA and submits it to the SMS-C over MAP or Diameter. The sender gets a 202 Accepted straight back; the actual delivery report arrives much later as a separate SIP MESSAGE. Note that the SMS-C is very often not an Ericsson node — messaging centres are commonly a different vendor to the core around them." },
  { t: "Where is the recipient?", m: "SRI-for-SM", p: ["smsc", "hss"], rt: true, k: "diameter",
    d: "The SMS-C asks the HSS for routing information: Send-Routing-Info-for-SM over MAP, or its Diameter equivalent on S6c. The HSS answers with the serving node address — an MME if the subscriber is on LTE, an MSC or SGSN if not. This single lookup is what decides which of the delivery paths below gets used." },
  { t: "Delivery over SGd", m: "SGd MT-Forward-Short-Message", p: ["smsc", "mme"], k: "diameter",
    d: "SMS in MME, standardised in Release 11: the SMS-C delivers straight to the MME over the SGd Diameter interface. No MSC anywhere in the path. This is what lets an operator run LTE with no circuit-switched domain at all, and it's the direction every network has been heading." },
  { t: "NAS delivery to the handset", m: "Downlink NAS Transport", p: ["mme", "enb", "ue"], rt: true, k: "control",
    d: "The MME encapsulates the short message in a NAS Downlink NAS Transport message — no bearer, no user plane, it rides the signalling connection. The UE acknowledges with an uplink NAS transport, and the delivery report walks the whole path back to the sender." },
  { t: "Legacy path: SMS over SGs", m: "SGsAP Downlink Unitdata", p: ["smsc", "msc", "mme", "enb", "ue"], k: "tdm",
    d: "Before SGd, the MSC-S was the delivery node. The SMS-C hands the message over MAP, the MSC pushes it to the MME over SGs, and the MME turns it into the same NAS message. It only works if the UE did a combined EPS/IMSI attach so the MSC knows it exists — which is why an SGs association failure shows up as 'data works, texts don't'." },
  { t: "MMS and RCS are just data", m: "MM1 over the mms APN", p: ["ue", "enb", "sgw", "pgw", "inet"], k: "user",
    d: "Neither of these uses any of the signalling above. MMS is an HTTP session to the MMSC over a separate mms APN with its own charging rules, and the notification that a message is waiting is itself an ordinary SMS. RCS runs over IMS as another application server alongside the MTAS, using SIP and MSRP rather than the SMS transport layer." },
];

const SCENARIOS = {
  data: {
    label: "Data session",
    blurb: "LTE attach through to a default bearer passing traffic",
    steps: DATA_STEPS,
    flows: [{ after: 13, p: ["ue", "enb", "sgw", "pgw", "inet"], k: "user" }],
  },
  volte: {
    label: "VoLTE call",
    blurb: "IMS registration, call setup and a dedicated QCI 1 bearer",
    steps: VOLTE_STEPS,
    flows: [{ after: 13, p: ["ue", "enb", "sgw", "pgw", "sbg"], k: "media" }],
  },
  sms: {
    label: "Messaging",
    blurb: "Three ways a text reaches a handset, plus MMS and RCS",
    steps: SMS_STEPS,
    flows: [{ after: 7, p: ["ue", "enb", "sgw", "pgw", "inet"], k: "user" }],
  },
};

/* ---------------------------- geometry ---------------------------- */

const ctr = (id) => ({ x: NODES[id].cx, y: NODES[id].cy });

const control = (p0, p1, curve) => {
  const dx = p1.x - p0.x, dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: (p0.x + p1.x) / 2 + (-dy / len) * curve, y: (p0.y + p1.y) / 2 + (dx / len) * curve };
};

const bez = (p0, c, p1, t) => ({
  x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * c.x + t * t * p1.x,
  y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * c.y + t * t * p1.y,
});

const linkFor = (a, b) => LINKS.find((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));

const linkPathD = (l) => {
  const p0 = ctr(l.a), p1 = ctr(l.b), c = control(p0, p1, l.curve);
  return `M ${p0.x} ${p0.y} Q ${c.x} ${c.y} ${p1.x} ${p1.y}`;
};

const linkMid = (l) => {
  const p0 = ctr(l.a), p1 = ctr(l.b), c = control(p0, p1, l.curve);
  return bez(p0, c, p1, 0.5);
};

const pointOnRoute = (route, t) => {
  const hops = route.length - 1;
  const raw = Math.min(t, 0.999999) * hops;
  const i = Math.floor(raw);
  const local = raw - i;
  const from = route[i], to = route[i + 1];
  const l = linkFor(from, to);
  const p0 = ctr(from), p1 = ctr(to);
  const c = l ? control(ctr(l.a), ctr(l.b), l.curve) : control(p0, p1, 0);
  return bez(p0, c, p1, local);
};

const routeLinks = (route) => {
  const out = [];
  for (let i = 0; i < route.length - 1; i++) {
    const l = linkFor(route[i], route[i + 1]);
    if (l) out.push(l);
  }
  return out;
};

/* ---------------------------- reference --------------------------- */

const NODE_MAP = [
  ["MME / SGSN", "SGSN-MME (vSGSN-MME)", "One node for LTE and 2G/3G packet control"],
  ["S-GW / P-GW", "EPG — Evolved Packet Gateway", "Usually combined SAE-GW; vEPG when virtualised"],
  ["CUPS split", "EPG-C + EPG-U over Sx (PFCP)", "Becomes Packet Core Controller / Gateway in 5G"],
  ["HSS", "HSS-FE + CUDB", "UDC: stateless front end, data in the central database"],
  ["EIR", "EIR, typically on the CUDB platform", "S13 from the MME, Gf from the SGSN, N17 in 5G"],
  ["PCRF", "SAPC — Service-Aware Policy Controller", "Becomes the PCF in 5G SA"],
  ["OCS", "Charging System / CCN", "Gy online, Gz offline CDRs"],
  ["DRA", "DSC — Diameter Signalling Controller", "Routes S6a, S13, Gx, Rx, SGd between realms"],
  ["P-CSCF / IMS-AGW / IBCF", "SBG — Session Border Gateway", "Access and interconnect borders"],
  ["I-CSCF / S-CSCF", "CSCF (Cloud IMS)", "Registration and iFC-based service triggering"],
  ["MMTel TAS", "MTAS", "Supplementary services, ENUM-based routing"],
  ["IP-SM-GW", "Standalone, or an MTAS function", "Bridges SIP MESSAGE to the MAP/SGd world"],
  ["SMS-SC / SMS-GMSC", "Messaging portfolio SMS-C", "Frequently a different vendor to the core"],
  ["MRF", "MRS — Media Resource System", "Announcements, conferencing, tones"],
  ["MGCF / IM-MGW", "MGCF + M-MGw", "SIP to ISUP/BICC and AMR to G.711"],
  ["MSC Server", "MSC-S Blade Cluster", "CSFB over SGs, SRVCC over Sv, legacy SMS"],
  ["Management", "ENM — Ericsson Network Manager", "Successor to OSS-RC"],
];

const QCI = [
  ["1", "GBR", "Conversational voice", "100 ms · 10⁻²"],
  ["2", "GBR", "Conversational video", "150 ms · 10⁻³"],
  ["5", "Non-GBR", "IMS signalling", "100 ms · 10⁻⁶"],
  ["8", "Non-GBR", "Premium best effort", "300 ms · 10⁻⁶"],
  ["9", "Non-GBR", "Default internet bearer", "300 ms · 10⁻⁶"],
];

const EIR_STATUS = [
  ["White", "#3fd6a0", "Known good, or not on any list. Attach proceeds."],
  ["Grey", "#f5b544", "Allowed through, but logged. Used for tracking suspect or non-type-approved handsets."],
  ["Black", "#ff6fae", "Barred. The MME rejects the attach — emergency calls are still allowed."],
];

/* ---------------------------- component --------------------------- */

export default function EpcExplorer() {
  const [scenario, setScenario] = useState("data");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [focus, setFocus] = useState(true);
  const [showRef, setShowRef] = useState(false);
  const [clock, setClock] = useState(0);

  const sc = SCENARIOS[scenario];
  const steps = sc.steps;
  const cur = steps[step];
  const listRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
    }
  }, []);

  useEffect(() => {
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      setClock((c) => c + dt);
      if (playing) {
        setProgress((p) => {
          const dur = ((cur.rt ? 3.4 : 2.2) + (cur.p.length - 2) * 0.5) / speed;
          const next = p + dt / dur;
          if (next >= 1) {
            if (step < steps.length - 1) { setStep((s) => s + 1); return 0; }
            setPlaying(false);
            return 1;
          }
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, step, steps.length, cur]);

  useEffect(() => {
    const el = listRef.current && listRef.current.querySelector(`[data-step="${step}"]`);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }, [step]);

  const go = useCallback((i) => { setStep(i); setProgress(0); }, []);
  const switchScenario = (key) => { setScenario(key); setStep(0); setProgress(0); setPlaying(true); };

  const t = cur.rt ? (progress < 0.5 ? progress * 2 : (1 - progress) * 2) : progress;
  const pos = pointOnRoute(cur.p, t);

  const activeLinks = useMemo(() => new Set(routeLinks(cur.p)), [cur]);
  const activeNodes = useMemo(() => new Set(cur.p), [cur]);
  const litNodes = useMemo(() => {
    const s = new Set();
    for (let i = 0; i <= step; i++) steps[i].p.forEach((n) => s.add(n));
    return s;
  }, [step, steps]);

  const flows = sc.flows.filter((f) => step >= f.after);
  const accent = K[cur.k].c;

  return (
    <div style={{ background: BG, fontFamily: SANS, color: "#dbe4f3", minHeight: "100%" }} className="w-full">
      <div className="mx-auto max-w-6xl px-4 py-5">

        <header className="mb-4">
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: "#63799c" }}>
            EPC · IMS · MESSAGING · ERICSSON NODE NAMING
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            How a 4G core actually carries a session
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#8ea1bf" }}>
            Watch the signalling walk the reference points, one message at a time.
          </p>
        </header>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {Object.keys(SCENARIOS).map((key) => {
            const on = key === scenario;
            return (
              <button
                key={key}
                onClick={() => switchScenario(key)}
                className="rounded px-3 py-2 text-sm"
                style={{
                  background: on ? "#152441" : PANEL,
                  border: `1px solid ${on ? "#3d6ba8" : EDGE}`,
                  color: on ? "#ffffff" : "#8ea1bf",
                  fontWeight: on ? 600 : 400,
                }}
              >
                {SCENARIOS[key].label}
                <span className="ml-2 hidden sm:inline" style={{ fontFamily: MONO, fontSize: 11, color: "#63799c" }}>
                  {SCENARIOS[key].steps.length}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setFocus((f) => !f)}
            className="ml-auto rounded px-3 py-2 text-xs"
            style={{ background: PANEL, border: `1px solid ${EDGE}`, color: focus ? "#dbe4f3" : "#63799c", fontFamily: MONO }}
          >
            {focus ? "◉" : "○"} dim inactive
          </button>
        </div>

        <div className="overflow-x-auto rounded" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
          <svg viewBox="0 0 1180 640" style={{ minWidth: 940, width: "100%", display: "block" }}>
            <defs>
              <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <g opacity="0.55">
              <rect x="14" y="30" width="1152" height="180" rx="10" fill="#0a1120" />
              <rect x="14" y="240" width="1152" height="140" rx="10" fill="#0a1220" />
              <rect x="470" y="404" width="696" height="212" rx="10" fill="#100c22" />
            </g>
            <g style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em" }}>
              <text x="26" y="46" fill="#41547a">CONTROL PLANE / SUBSCRIBER DATA / MESSAGING</text>
              <text x="26" y="258" fill="#41547a">USER PLANE — BEARER PATH</text>
              <text x="482" y="422" fill="#544a7d">IMS — VoLTE AND SMS OVER IP</text>
            </g>

            {LINKS.map((l, i) => {
              const on = activeLinks.has(l);
              const col = on ? K[cur.k].c : K[l.k].c;
              const op = on ? 0.95 : focus ? 0.16 : 0.34;
              const mid = linkMid(l);
              return (
                <g key={i}>
                  <path
                    d={linkPathD(l)}
                    fill="none"
                    stroke={col}
                    strokeWidth={on ? 2.4 : 1.2}
                    strokeDasharray={l.dash || undefined}
                    opacity={op}
                    filter={on ? "url(#glow)" : undefined}
                  />
                  <text
                    x={mid.x}
                    y={mid.y - 5}
                    textAnchor="middle"
                    style={{ fontFamily: MONO, fontSize: 10 }}
                    fill={on ? "#ffffff" : "#6d82a5"}
                    opacity={on ? 1 : focus ? 0.3 : 0.6}
                  >
                    {l.l}
                  </text>
                </g>
              );
            })}

            {flows.map((f, fi) => (
              <g key={`f${fi}`}>
                {[0, 1, 2, 3].map((d) => {
                  const tt = (clock * 0.28 + d / 4) % 1;
                  const p = pointOnRoute(f.p, tt);
                  return <circle key={d} cx={p.x} cy={p.y} r={3.5} fill={K[f.k].c} opacity={0.75} />;
                })}
              </g>
            ))}

            {Object.keys(NODES).map((id) => {
              const n = NODES[id];
              const on = activeNodes.has(id);
              const lit = litNodes.has(id);
              const stroke = on ? accent : lit ? "#33507d" : EDGE;
              const dim = focus && !on && !lit ? 0.42 : 1;
              return (
                <g key={id} opacity={dim}>
                  {on && (
                    <rect
                      x={n.cx - n.w / 2 - 5} y={n.cy - n.h / 2 - 5}
                      width={n.w + 10} height={n.h + 10} rx={12}
                      fill="none" stroke={accent} strokeWidth="1" opacity="0.45" filter="url(#glow)"
                    />
                  )}
                  <rect
                    x={n.cx - n.w / 2} y={n.cy - n.h / 2}
                    width={n.w} height={n.h} rx={9}
                    fill={on ? "#16233d" : "#0f1830"}
                    stroke={stroke} strokeWidth={on ? 1.8 : 1}
                  />
                  <text x={n.cx} y={n.cy - 5} textAnchor="middle"
                    style={{ fontSize: 13, fontWeight: 600, fontFamily: SANS }}
                    fill={on ? "#ffffff" : lit ? "#c6d4ea" : "#8ea1bf"}>
                    {n.t}
                  </text>
                  <text x={n.cx} y={n.cy + 12} textAnchor="middle"
                    style={{ fontSize: 10, fontFamily: MONO }}
                    fill={on ? accent : "#63799c"}>
                    {n.s}
                  </text>
                </g>
              );
            })}

            <g>
              <circle cx={pos.x} cy={pos.y} r={7} fill={accent} filter="url(#glow)" />
              <circle cx={pos.x} cy={pos.y} r={13} fill="none" stroke={accent} strokeWidth="1" opacity={0.35} />
              <rect
                x={pos.x - (cur.m.length * 3.4 + 12)} y={pos.y - 34}
                width={cur.m.length * 6.8 + 24} height={20} rx={5}
                fill="#0a1324" stroke={accent} strokeWidth="1" />
              <text x={pos.x} y={pos.y - 20} textAnchor="middle"
                style={{ fontFamily: MONO, fontSize: 11 }} fill="#ffffff">
                {cur.m}
              </text>
            </g>
          </svg>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={() => go(Math.max(0, step - 1))} disabled={step === 0}
            className="rounded px-3 py-2 text-sm disabled:opacity-30"
            style={{ background: PANEL, border: `1px solid ${EDGE}`, color: "#dbe4f3", fontFamily: MONO }}>
            ← prev
          </button>
          <button onClick={() => setPlaying((p) => !p)}
            className="rounded px-4 py-2 text-sm font-semibold"
            style={{
              background: playing ? "#1c2f52" : accent,
              border: `1px solid ${playing ? "#3d6ba8" : accent}`,
              color: playing ? "#dbe4f3" : "#06101f",
            }}>
            {playing ? "Pause" : step === steps.length - 1 && progress >= 1 ? "Replay" : "Play"}
          </button>
          <button onClick={() => go(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}
            className="rounded px-3 py-2 text-sm disabled:opacity-30"
            style={{ background: PANEL, border: `1px solid ${EDGE}`, color: "#dbe4f3", fontFamily: MONO }}>
            next →
          </button>
          <button onClick={() => { go(0); setPlaying(true); }}
            className="rounded px-3 py-2 text-sm"
            style={{ background: PANEL, border: `1px solid ${EDGE}`, color: "#8ea1bf", fontFamily: MONO }}>
            restart
          </button>
          <div className="ml-auto flex items-center gap-1">
            {[0.5, 1, 2].map((s) => (
              <button key={s} onClick={() => setSpeed(s)}
                className="rounded px-2 py-1 text-xs"
                style={{
                  background: speed === s ? "#152441" : "transparent",
                  border: `1px solid ${speed === s ? "#3d6ba8" : EDGE}`,
                  color: speed === s ? "#ffffff" : "#63799c", fontFamily: MONO,
                }}>
                {s}×
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded" style={{ background: "#111c31" }}>
          <div style={{ width: `${((step + progress) / steps.length) * 100}%`, background: accent, height: "100%" }} />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: MONO, fontSize: 11, color: accent }}>
                {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
              </span>
              <span className="rounded px-2 py-0.5" style={{ fontFamily: MONO, fontSize: 10, color: accent, border: `1px solid ${accent}55` }}>
                {K[cur.k].n}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-white">{cur.t}</h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "#a8b8d4" }}>{cur.d}</p>
            <p className="mt-3" style={{ fontFamily: MONO, fontSize: 11, color: "#63799c" }}>
              {cur.p.map((n) => NODES[n].t).join(cur.rt ? "  ⇄  " : "  →  ")}
            </p>
          </div>

          <div className="lg:col-span-2 rounded" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
            <div className="px-3 py-2" style={{ borderBottom: `1px solid ${EDGE}`, fontFamily: MONO, fontSize: 11, color: "#63799c" }}>
              {sc.blurb}
            </div>
            <div ref={listRef} className="max-h-64 overflow-y-auto p-1">
              {steps.map((s, i) => {
                const on = i === step;
                return (
                  <button key={i} data-step={i} onClick={() => go(i)}
                    className="flex w-full items-start gap-2 rounded px-2 py-1.5 text-left"
                    style={{ background: on ? "#152441" : "transparent", opacity: i <= step ? 1 : 0.5 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: on ? K[s.k].c : "#4d618a", paddingTop: 2 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs leading-snug" style={{ color: on ? "#ffffff" : "#8ea1bf" }}>
                      {s.t}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 rounded px-3 py-2" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
          {Object.keys(K).map((k) => (
            <span key={k} className="flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 10, color: "#8ea1bf" }}>
              <span style={{ width: 10, height: 3, background: K[k].c, display: "inline-block", borderRadius: 2 }} />
              {K[k].n}
            </span>
          ))}
        </div>

        <button onClick={() => setShowRef((r) => !r)}
          className="mt-3 w-full rounded px-3 py-2 text-left text-sm"
          style={{ background: PANEL, border: `1px solid ${EDGE}`, color: "#8ea1bf", fontFamily: MONO }}>
          {showRef ? "▾" : "▸"} node naming, QCI values and how the EIR decides
        </button>

        {showRef && (
          <div className="mt-2 grid gap-3 lg:grid-cols-3">
            <div className="rounded p-3" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
              <h3 style={{ fontFamily: MONO, fontSize: 11, color: "#63799c", letterSpacing: "0.12em" }}>NODE NAMING</h3>
              <div className="mt-2 max-h-80 space-y-2 overflow-y-auto pr-1">
                {NODE_MAP.map((row, i) => (
                  <div key={i} className="text-xs" style={{ borderBottom: `1px solid #131d33`, paddingBottom: 6 }}>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span style={{ color: "#8ea1bf" }}>{row[0]}</span>
                      <span style={{ color: "#3d5178" }}>→</span>
                      <span className="font-semibold" style={{ color: "#e6edfa" }}>{row[1]}</span>
                    </div>
                    <div style={{ color: "#63799c", fontSize: 11 }}>{row[2]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded p-3" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
              <h3 style={{ fontFamily: MONO, fontSize: 11, color: "#63799c", letterSpacing: "0.12em" }}>QCI VALUES YOU'LL MEET DAILY</h3>
              <div className="mt-2 space-y-2">
                {QCI.map((row, i) => (
                  <div key={i} className="flex items-baseline gap-3 text-xs" style={{ borderBottom: `1px solid #131d33`, paddingBottom: 6 }}>
                    <span style={{ fontFamily: MONO, color: row[0] === "1" ? K.media.c : row[0] === "5" ? K.ims.c : K.user.c, fontSize: 13, fontWeight: 700, width: 18 }}>{row[0]}</span>
                    <span className="flex-1">
                      <span style={{ color: "#e6edfa" }}>{row[2]}</span>
                      <span style={{ color: "#63799c" }}> · {row[1]}</span>
                    </span>
                    <span style={{ fontFamily: MONO, color: "#63799c" }}>{row[3]}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed" style={{ color: "#8ea1bf" }}>
                A VoLTE handset holds three bearers at once: QCI 9 for internet, QCI 5 for SIP on the ims APN,
                and QCI 1 brought up only for the duration of a call. SMS needs none of them — it rides NAS signalling.
              </p>
            </div>

            <div className="rounded p-3" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
              <h3 style={{ fontFamily: MONO, fontSize: 11, color: "#63799c", letterSpacing: "0.12em" }}>EIR — EQUIPMENT STATUS</h3>
              <div className="mt-2 space-y-2">
                {EIR_STATUS.map((row, i) => (
                  <div key={i} className="text-xs" style={{ borderBottom: `1px solid #131d33`, paddingBottom: 6 }}>
                    <span style={{ fontFamily: MONO, color: row[1], fontWeight: 700 }}>{row[0]}</span>
                    <div style={{ color: "#a8b8d4" }}>{row[2]}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed" style={{ color: "#8ea1bf" }}>
                The check is a config choice, not a given: whether it runs at attach, at TAU, or per APN, and what happens
                when the EIR is unreachable — fail open and let everyone on, or fail closed and bar them. Getting that
                wrong is how an EIR outage becomes a national outage.
              </p>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "#8ea1bf" }}>
                The IMEISV is useful beyond blocking. Because the last two digits are the software version, operators key
                device-specific policy off it — which handsets are allowed VoLTE, which need a workaround for a known
                radio bug. Australian carriers share a blocked-IMEI register, so a barred handset stays barred across networks.
              </p>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs leading-relaxed" style={{ color: "#4d618a" }}>
          Roaming swaps S5 for S8 with the P-GW in the home network. CUPS splits the EPG into EPG-C and EPG-U over Sx,
          which is the same control/user separation you'll meet again as SMF and UPF in 5G — where the EIR becomes the
          5G-EIR on N17, and SMS keeps working over NAS through the AMF and an SMSF.
        </p>
      </div>
    </div>
  );
}
