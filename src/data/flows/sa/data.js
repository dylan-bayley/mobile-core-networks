export const label = 'Data session';
export const blurb = 'Registration, PDU Session Establishment and a QoS Flow carrying traffic — no EPC involved at all';

export const steps = [
  { id: 'reg-request', t: 'RRC setup + Registration Request', m: 'Registration Request', p: ['ue', 'gnb'], k: 'radio',
    d: 'The UE brings up an RRC connection to the gNB and sends the NAS Registration Request — a SUCI (the encrypted IMSI equivalent) if this is the first registration, or a 5G-GUTI if it has one from before. Requested NSSAI (which network slices) rides along too.' },
  { id: 'n2-initial-ue-message', t: 'N2 Initial UE Message', m: 'N2 Initial UE Message', p: ['gnb', 'amf'], k: 'control',
    d: "The gNB picks an AMF — from the 5G-GUTI if the UE has one, otherwise round-robin or by requested slice — and forwards the NAS payload over NGAP. Ericsson's dual-mode 5G Core runs the AMF as a function alongside the MME on the same platform, much like the SGSN-MME did for 2G/3G/4G." },
  { id: 'primary-auth', t: 'Primary authentication', m: 'Nausf_UEAuthentication', p: ['amf', 'ausf'], rt: true, k: 'sbi',
    d: '5G-AKA: the AMF asks the AUSF to authenticate the subscriber; the AUSF in turn pulls a 5G HE AV from the UDM over Nudm_UEAuthentication, computes HXRES*, and hands the AMF what it needs to challenge the UE. Splitting AUSF out from the UDM is new in 5G — in 4G, the HSS did this itself.' },
  { id: 'nas-security', t: '5G-AKA and NAS security', m: 'Auth + Security Mode', p: ['amf', 'gnb', 'ue'], rt: true, k: 'control',
    d: 'Authentication Request/Response over NAS, then NAS Security Mode Command/Complete brings up integrity and ciphering — functionally identical in shape to 4G, just running 5G-AKA instead of EPS-AKA underneath.' },
  { id: 'eir-check-5g', t: 'Equipment identity check', m: 'N17', p: ['amf', 'eir'], rt: true, k: 'sbi',
    d: 'The AMF checks the PEI (the IMEISV equivalent) against the 5G-EIR over N17 — a service-based call rather than a Diameter S13 exchange, but the same white/grey/black verdict as 4G, often the same physical CUDB-backed platform underneath.' },
  { id: 'udm-registration', t: 'Registration with the UDM', m: 'Nudm_UECM + Nudm_SDM', p: ['amf', 'hss'], rt: true, k: 'sbi',
    d: "AMF registers itself as the subscriber's serving AMF (Nudm_UECM_Registration) and pulls the access-and-mobility subscription data (Nudm_SDM_Get) — subscribed slices, RFSP index, mobility restrictions. This is the direct analogue of 4G's Update Location, just SBI instead of Diameter S6a." },
  { id: 'pdu-session-request', t: 'PDU Session Establishment Request', m: 'PDU Session Establishment Request', p: ['ue', 'gnb', 'amf'], k: 'control',
    d: 'Once registered, the UE asks for a PDU Session — the direct successor to the PDN Connectivity Request — naming a DNN (the APN equivalent) and requested S-NSSAI. This can piggyback on registration or come later; here it comes right after.' },
  { id: 'create-sm-context', t: 'AMF selects an SMF', m: 'Nsmf_PDUSession_CreateSMContext', p: ['amf', 'smf'], k: 'sbi',
    d: 'The AMF picks an SMF (via NRF discovery or local configuration) for the requested DNN/slice and forwards the request. From here the SMF owns this PDU Session end to end.' },
  { id: 'sm-policy-decision', t: 'Policy decision', m: 'Npcf_SMPolicyControl', p: ['smf', 'pcf'], rt: true, k: 'sbi',
    d: 'SMF establishes an SM Policy Association with the PCF, which returns PCC rules — the default QoS Flow (5QI 9 for internet), session-AMBR and charging instructions. Same job as 4G\'s Gx exchange, converged into one unified policy function.' },
  { id: 'n4-session-establishment', t: 'N4 Session Establishment', m: 'PFCP Session Establishment', p: ['smf', 'upf'], k: 'control',
    d: "SMF programs the UPF over N4/PFCP with packet detection, forwarding and QoS enforcement rules (PDR/FAR/QER) for this session, and allocates the UE's IP address. This is the CUPS split made explicit: the SMF never touches a user packet." },
  { id: 'charging-chf', t: 'Charging', m: 'Nchf_ConvergedCharging', p: ['smf', 'chf'], rt: true, k: 'sbi',
    d: "SMF opens a charging session with the CHF — one converged interface for both prepaid and postpaid, replacing 4G's separate Gy (online) and Gz (offline CDR) paths to the OCS." },
  { id: 'n2-pdu-session-resource-setup', t: 'N2 PDU Session Resource Setup', m: 'N2 Request → RRC Reconfig', p: ['amf', 'gnb', 'ue'], k: 'control',
    d: "AMF sends the gNB an N2 PDU Session Request carrying the QoS profile; the gNB admission-controls it and configures the radio with an RRC Reconfiguration, establishing a Data Radio Bearer mapped to the new QoS Flow. Functionally this is 4G's Initial Context Setup, wearing 5G's naming." },
  { id: 'n4-session-modification', t: 'N4 Session Modification', m: 'PFCP Session Modification', p: ['smf', 'upf'], k: 'control',
    d: "The gNB's N3 tunnel endpoint (its TEID) is passed back up through the AMF to the SMF, which pushes it into the UPF over N4 so downlink traffic knows where to land — the direct analogue of 4G's Modify Bearer Request." },
  { id: 'user-plane-traffic', t: 'User plane carrying traffic', m: 'GTP-U payload (N3)', p: ['ue', 'gnb', 'upf', 'inet'], k: 'user',
    d: 'Traffic is tunnelled in GTP-U over N3 from the gNB to the UPF, and breaks out to the data network over N6. Default QoS Flow, 5QI 9, non-GBR, policed by the session-AMBR — the same shape as 4G\'s default bearer, just with the S-GW and P-GW\'s jobs collapsed into one UPF.' },
];

export const ambient = [{ afterId: 'user-plane-traffic', p: ['ue', 'gnb', 'upf', 'inet'], k: 'user' }];
