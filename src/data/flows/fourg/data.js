export const label = 'Data session';
export const blurb = 'LTE attach through to a default bearer passing traffic';

export const steps = [
  { id: 'attach-request', t: 'RRC setup + Attach Request', m: 'Attach Request', p: ['ue', 'enb'], k: 'radio',
    d: 'The UE brings up an RRC connection, then sends the NAS Attach Request (IMSI, or a GUTI if it has one) with a PDN Connectivity Request piggybacked. Requested APN, UE network capability and PDN type all ride along.' },
  { id: 'initial-ue-message', t: 'S1AP Initial UE Message', m: 'Initial UE Message', p: ['enb', 'mme'], k: 'control',
    d: "The eNodeB picks an MME from its S1-flex pool using the relative capacity weights each MME advertises, and forwards the NAS payload over SCTP. In an Ericsson network the MME function lives inside the SGSN-MME — the same node also serves 2G/3G as an SGSN, which is why you'll find GPRS parameters in its config." },
  { id: 'auth-vectors', t: 'Authentication vectors', m: 'S6a AIR / AIA', p: ['mme', 'hss'], rt: true, k: 'diameter',
    d: 'MME asks for EPS authentication vectors: RAND, AUTN, XRES and KASME, derived from the subscriber key K. Ericsson splits this under the UDC architecture — HSS-FE is a stateless Diameter front end, the subscriber data itself sits in the CUDB.' },
  { id: 'eps-aka', t: 'EPS-AKA and NAS security', m: 'Auth + Security Mode', p: ['mme', 'enb', 'ue'], rt: true, k: 'control',
    d: 'Authentication Request/Response, then NAS Security Mode Command/Complete. Integrity protection and ciphering come up for NAS, and the eNodeB does the same for the access stratum using keys derived from KASME.' },
  { id: 'eir-check', t: 'Equipment identity check', m: 'S13 ECR / ECA', p: ['mme', 'eir'], rt: true, k: 'diameter',
    d: "If the MME doesn't already hold the IMEISV it sends a NAS Identity Request to get it, then checks the handset with the EIR. The ME-Identity-Check-Request carries the IMEI; the answer is an equipment status — white, grey or black. A blacklisted handset is rejected no matter how valid the SIM is." },
  { id: 'update-location', t: 'Update Location', m: 'S6a ULR / ULA', p: ['mme', 'hss'], rt: true, k: 'diameter',
    d: 'MME registers as the serving node. HSS returns the subscription profile: APN list and default APN, subscribed QCI and ARP, APN-AMBR and UE-AMBR, plus a statically allocated P-GW if the subscriber has one.' },
  { id: 'create-session-request', t: 'Create Session Request', m: 'S11 Create Session', p: ['mme', 'sgw'], k: 'control',
    d: 'MME resolves the gateways through DNS — TAI-FQDN for the S-GW, APN-FQDN for the P-GW — then sends GTP-C v2 Create Session Request carrying IMSI, APN, RAT type, bearer QoS and its own F-TEID.' },
  { id: 'create-session-pgw', t: 'Session request to the P-GW', m: 'S5 Create Session', p: ['sgw', 'pgw'], k: 'control',
    d: 'S-GW allocates its S1-U and S5-U TEIDs and relays the request. On Ericsson EPG the two gateways are usually one node in combined SAE-GW mode, so S5 becomes internal — worth knowing before you go hunting for it in a packet capture.' },
  { id: 'policy-decision', t: 'Policy decision', m: 'Gx CCR-I / CCA-I', p: ['pgw', 'pcrf'], rt: true, k: 'diameter',
    d: "P-GW allocates the UE's IP address and asks for policy. Ericsson SAPC answers with PCC rules: the default bearer QCI (8 or 9 for internet), APN-AMBR, gating status and charging keys." },
  { id: 'credit-control', t: 'Credit control', m: 'Gy CCR-I', p: ['pgw', 'ocs'], rt: true, k: 'diameter',
    d: 'For prepaid, the P-GW reserves quota per rating group from the online charging system and reports usage as it burns through it. Postpaid usage is written as CDRs over Gz instead.' },
  { id: 'create-session-response', t: 'Create Session Response', m: 'Create Session Rsp', p: ['pgw', 'sgw', 'mme'], k: 'control',
    d: "Comes back with the UE IP address, the P-GW's S5-U TEID, and Protocol Configuration Options. PCO is where the UE learns its DNS servers — and on the IMS APN, the P-CSCF address it will register against." },
  { id: 'ics-attach-accept', t: 'Initial Context Setup / Attach Accept', m: 'S1AP ICS Request', p: ['mme', 'enb', 'ue'], k: 'control',
    d: "MME hands the eNodeB the S-GW's S1-U TEID, the E-RAB QoS and the security context. The eNodeB sets up the data radio bearer with an RRC Connection Reconfiguration and replies with its own S1-U TEID." },
  { id: 'modify-bearer-request', t: 'Modify Bearer Request', m: 'S11 Modify Bearer', p: ['mme', 'sgw'], k: 'control',
    d: 'MME passes the eNodeB TEID down to the S-GW so downlink traffic knows where to land. The default EPS bearer is now up end to end.' },
  { id: 'user-plane-traffic', t: 'User plane carrying traffic', m: 'GTP-U payload', p: ['ue', 'enb', 'sgw', 'pgw', 'inet'], k: 'user',
    d: 'Traffic is tunnelled in GTP-U across S1-U and S5-U and breaks out at SGi. Default bearer, QCI 9, non-GBR, policed by the APN-AMBR. Each tunnel is identified by a TEID rather than the UE\'s IP — mismatched TEIDs are the classic cause of an attach that succeeds but passes no data.' },
];

export const ambient = [{ afterId: 'user-plane-traffic', p: ['ue', 'enb', 'sgw', 'pgw', 'inet'], k: 'user' }];
