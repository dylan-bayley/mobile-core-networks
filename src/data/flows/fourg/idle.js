export const label = 'Idle mode & TAU';
export const blurb = 'What happens after the data stops: S1 release, idle camping, and a Tracking Area Update when the handset moves';

export const steps = [
  { id: 'inactivity-timer', t: 'User-inactivity timer expires', m: 'S1AP UE Context Release Request', p: ['enb', 'mme'], k: 'control',
    d: "After a configurable period with no traffic — typically 10–20 s on LTE — the eNodeB asks the MME to release the UE's S1 context, cause 'user inactivity'. Keeping a UE connected costs radio resources and battery; releasing it is the normal end of every burst of data." },
  { id: 'release-access-bearers', t: 'Release Access Bearers', m: 'S11 Release Access Bearers', p: ['mme', 'sgw'], rt: true, k: 'control',
    d: "The MME tells the S-GW to forget the eNodeB's S1-U TEIDs. The bearers themselves — and the UE's IP address at the P-GW — stay exactly as they were; only the radio leg is gone. This is the difference between ECM-IDLE and detached." },
  { id: 'ue-context-release', t: 'UE Context Release and RRC release', m: 'UE Context Release Cmd → RRC Release', p: ['mme', 'enb', 'ue'], k: 'control',
    d: 'The MME confirms; the eNodeB releases the RRC connection. The UE is now EMM-REGISTERED / ECM-IDLE: known to the network at Tracking-Area-list granularity, listening for paging on its DRX cycle, and otherwise silent.' },
  { id: 'idle-reselection', t: 'Cell reselection into a new Tracking Area', m: '(no signalling)', p: ['ue', 'enb'], k: 'radio',
    d: "Idle, the UE reselects cells on its own using broadcast system information — no signalling to the core at all. It only speaks up when it camps on a cell whose TAI is not in the TA list the MME gave it at attach." },
  { id: 'tau-request', t: 'Tracking Area Update Request', m: 'TAU Request', p: ['ue', 'enb', 'mme'], k: 'radio',
    d: 'The UE sets up an RRC connection and sends a NAS TAU Request with its GUTI and the last visited TAI. If the new eNodeB maps to a different MME pool, the new MME fetches the UE context from the old one over S10 (not shown); here the same MME serves both areas.',
    pitfall: 'Periodic TAU (timer T3412, often 54 min) fires even when the UE never moves. A network-wide TAU storm after an MME restart is a familiar outage pattern: every UE re-registers at once.' },
  { id: 'tau-hss', t: 'Update Location, only if the MME changed', m: 'S6a ULR / ULA', p: ['mme', 'hss'], rt: true, k: 'diameter',
    d: 'A same-MME TAU is a purely local update. Only when the serving MME changes does the HSS need to know — it then also sends a Cancel Location to the old MME so exactly one node claims the subscriber.' },
  { id: 'tau-sgw', t: 'S-GW update, if needed', m: 'S11 Modify Bearer Request', p: ['mme', 'sgw'], k: 'control',
    d: 'If the S-GW serving area changed too, the MME relocates the S-GW with a Create Session Request; otherwise a Modify Bearer Request just records the new serving MME and TAI. Either way the P-GW and the UE IP address are untouched.' },
  { id: 'tau-accept', t: 'TAU Accept with a new TA list', m: 'TAU Accept / Complete', p: ['mme', 'enb', 'ue'], rt: true, k: 'control',
    d: 'The MME returns a fresh TA list (and possibly a new GUTI). The UE drops back to idle — the whole exchange took one RRC connection and a few hundred milliseconds. Downlink data or a call for this UE now triggers paging across the new TA list.' },
  { id: 'idle-paging-note', t: 'What paging looks like from here', m: 'DDN → Paging → Service Request', p: ['sgw', 'mme', 'enb', 'ue'], k: 'control',
    d: 'When downlink data next arrives at the S-GW it sends a Downlink Data Notification; the MME pages every eNodeB in the TA list and the UE answers with a Service Request that rebuilds the S1-U leg. The terminating voice call flow walks through that sequence in full.' },
];

export const ambient = [];
