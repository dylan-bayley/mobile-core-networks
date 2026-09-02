export const label = 'Idle mode & registration update';
export const blurb = 'AN release, CM-IDLE camping, and a Mobility Registration Update — 5G folds TAU into the Registration procedure';

const fourg = (id) => ({ net: '4g', flow: 'data-idle', id });

export const steps = [
  { id: 'an-release', t: 'User-inactivity → AN Release', m: 'N2 UE Context Release Request', p: ['gnb', 'amf'], k: 'control', analog: fourg('inactivity-timer'),
    d: "When the gNB's inactivity timer expires it asks the AMF to release the UE's N2 context. 5G offers a cheaper alternative first: RRC_INACTIVE, where the gNB parks the UE with its context kept and N2/N3 still up. The core sees nothing, and resuming is faster than a full Service Request." },
  { id: 'n4-deactivate-up', t: 'User plane deactivated at the UPF', m: 'Nsmf_PDUSession_UpdateSMContext → N4', p: ['amf', 'smf', 'upf'], k: 'control', analog: fourg('release-access-bearers'),
    d: "The AMF tells the SMF the access is going away; the SMF removes the gNB's N3 tunnel endpoint from the UPF over N4 and tells it to buffer or report downlink packets. The PDU Session and the UE's IP address persist — only the N3 leg is gone. Same split as 4G's Release Access Bearers, with the SMF in the middle." },
  { id: 'an-release-cmd', t: 'UE Context Release and RRC Release', m: 'UE Context Release Cmd → RRC Release', p: ['amf', 'gnb', 'ue'], k: 'control', analog: fourg('ue-context-release'),
    d: 'The AMF confirms; the gNB releases RRC. The UE is RM-REGISTERED / CM-IDLE: camped, listening for paging on its DRX cycle, silent otherwise.' },
  { id: 'idle-reselection-5g', t: 'Cell reselection into a new Tracking Area', m: '(no signalling)', p: ['ue', 'gnb'], k: 'radio', analog: fourg('idle-reselection'),
    d: "Idle, the UE reselects cells from broadcast system information alone. It stays silent until it camps on a cell whose TAI is outside its registration area — 5G's name for the TA list." },
  { id: 'mobility-reg-update', t: 'Mobility Registration Update', m: 'Registration Request (mobility)', p: ['ue', 'gnb', 'amf'], k: 'radio', analog: fourg('tau-request'),
    d: "5G folds TAU into the Registration procedure: the UE sends a Registration Request of type 'mobility registration updating' with its 5G-GUTI. If the AMF changed, the new AMF fetches the UE context from the old one over N14.",
    pitfall: 'Periodic registration (T3512) plays the same role as T3412 in LTE — and an AMF restart produces the same re-registration storm.' },
  { id: 'reg-update-udm', t: 'UDM update, only if the AMF changed', m: 'Nudm_UECM_Registration', p: ['amf', 'hss'], rt: true, k: 'sbi', analog: fourg('tau-hss'),
    d: 'Only when the serving AMF changes does the UDM record the new one and deregister the old — the SBI equivalent of Update Location plus Cancel Location.' },
  { id: 'reg-update-smf', t: 'SMF told about the new area', m: 'Nsmf_PDUSession_UpdateSMContext', p: ['amf', 'smf'], k: 'sbi', analog: fourg('tau-sgw'),
    d: "The AMF tells each SMF about the new area and which PDU Sessions the UE wants kept active. If a UPF closer to the new area would serve better, the SMF can re-anchor the user plane — the 5G equivalent of an S-GW relocation, and just as invisible to the UE." },
  { id: 'reg-accept-update', t: 'Registration Accept with a new area', m: 'Registration Accept / Complete', p: ['amf', 'gnb', 'ue'], rt: true, k: 'control', analog: fourg('tau-accept'),
    d: 'The AMF returns a new registration area (and possibly a new 5G-GUTI). The UE drops back to idle.' },
  { id: 'idle-paging-note-5g', t: 'What paging looks like from here', m: 'N4 Report → N1N2 → Paging', p: ['upf', 'smf', 'amf', 'gnb', 'ue'], k: 'control', analog: fourg('idle-paging-note'),
    d: 'Downlink data at the UPF becomes an N4 report to the SMF, an N1N2MessageTransfer to the AMF, N2 Paging to every gNB in the registration area, and a Service Request from the UE that rebuilds N3. The terminating voice call flow walks through it in full.' },
];

export const ambient = [];
