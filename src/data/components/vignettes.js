/* Short "what it does" animations for component pages. Each one is a few
   scenes on the 5G core lesson diagram (service-based layout), with a single
   message dot per scene. They are learning aids, not full call flows, and
   don't appear in the Flows explorer. */

const c502 = (clause) => ({ src: 'ts23502', clause });
const c501 = (clause) => ({ src: 'ts23501', clause });
const via = (a, b) => [a, `@${a}`, `@${b}`, b];
const msg = (p, label, k = 'sbi') => [{ p, k, n: 1, speed: 0.32, label }];

export const VIGNETTES = {
  nrf: {
    title: 'Register, then discover',
    show: ['amf', 'smf', 'nrf', 'ausf', 'udm', 'pcf'],
    steps: [
      {
        id: 'register',
        title: 'An SMF comes online and registers',
        traffic: msg(via('smf', 'nrf'), 'NFRegister'),
        d: 'When a network function instance starts, it sends its NF profile (type, services, capacity, slices it serves) to the NRF with Nnrf_NFManagement_NFRegister.',
        cites: [c502('4.17.1')],
      },
      {
        id: 'stored',
        title: 'The NRF stores the profile',
        focus: { nodes: ['nrf'] },
        d: 'The NRF stores the profile, marks the instance available and confirms. It keeps track of the health of registered functions and can notify subscribers when instances come and go.',
        cites: [c502('4.17.1'), c501('6.2.6')],
      },
      {
        id: 'discover',
        title: 'The AMF needs an SMF',
        traffic: msg(via('amf', 'nrf'), 'NFDiscovery'),
        d: 'To set up a session, the AMF asks the NRF for SMF instances matching what it needs (for example the slice and data network) with Nnrf_NFDiscovery_Request. The NRF checks that the AMF is allowed to discover them.',
        cites: [c502('4.17.4')],
      },
      {
        id: 'answer',
        title: 'The NRF answers',
        traffic: msg(via('nrf', 'amf'), 'NF profiles'),
        d: 'The NRF returns the matching SMF profiles, including their addresses.',
        cites: [c502('4.17.4')],
      },
      {
        id: 'call',
        title: 'Direct call to the chosen SMF',
        traffic: msg(via('amf', 'smf'), 'CreateSMContext'),
        d: 'The AMF picks one and calls its service directly, here Nsmf_PDUSession_CreateSMContext. The NRF is no longer involved.',
        cites: [c502('5.2.8.2.5')],
      },
    ],
  },
  nssf: {
    title: 'Choosing slices at registration',
    show: ['ue', 'gnb', 'amf', 'nssf', 'udm', 'nrf'],
    steps: [
      {
        id: 'request',
        title: 'The phone asks for slices',
        traffic: msg(['ue', 'gnb', 'amf'], 'Registration Request', 'control'),
        d: 'A registering phone can include a Requested NSSAI: the list of slices (S-NSSAIs) it wants.',
        cites: [c502('4.2.2.2.2')],
      },
      {
        id: 'subscribed',
        title: 'What is the subscriber allowed?',
        traffic: msg(via('amf', 'udm'), 'SDM Get'),
        d: 'The AMF fetches the subscription from the UDM, including the subscribed S-NSSAIs.',
        cites: [c502('4.2.2.2.2')],
      },
      {
        id: 'select',
        title: 'Ask the NSSF',
        traffic: msg(via('amf', 'nssf'), 'NSSelection Get'),
        d: 'If the AMF can’t decide on its own, it asks the NSSF (Nnssf_NSSelection_Get). The NSSF determines the Allowed NSSAI and which AMF set should serve those slices.',
        cites: [c502('4.2.2.2.3'), c501('6.2.14')],
      },
      {
        id: 'result',
        title: 'Allowed slices come back',
        traffic: msg(via('nssf', 'amf'), 'Allowed NSSAI'),
        d: 'If a different AMF set is needed, the registration is rerouted to it. Otherwise this AMF carries on.',
        cites: [c502('4.2.2.2.3')],
      },
      {
        id: 'accept',
        title: 'The phone learns its slices',
        traffic: msg(['amf', 'gnb', 'ue'], 'Registration Accept', 'control'),
        d: 'Registration Accept tells the phone its Allowed NSSAI. From now on it asks for PDU sessions only on those slices.',
        cites: [c502('4.2.2.2.2')],
      },
    ],
  },
  auth: {
    title: '5G AKA: proving who you are',
    show: ['ue', 'gnb', 'amf', 'ausf', 'udm', 'udr'],
    steps: [
      {
        id: 'start',
        title: 'The AMF starts authentication',
        traffic: msg(via('amf', 'ausf'), 'Authenticate (SUCI)'),
        d: 'The AMF, acting as the security anchor (SEAF), asks the AUSF to authenticate the phone, passing the concealed identity (SUCI), or the SUPI if the phone is already known from a valid 5G-GUTI.',
        cites: [{ src: 'ts33501', clause: '6.1.2' }, { src: 'ts33501', clause: '6.1.3.2' }],
      },
      {
        id: 'udm',
        title: 'The UDM builds a challenge',
        traffic: msg(via('ausf', 'udm'), 'UEAuthentication Get'),
        d: 'The AUSF asks the UDM for an authentication vector. The UDM de-conceals the SUCI into the permanent SUPI and generates the vector from the subscriber’s long-term key (the ARPF role that sits with the UDM).',
        cites: [{ src: 'ts33501', clause: '6.1.3.2' }, c501('6.2.7')],
      },
      {
        id: 'vector',
        title: 'The challenge goes to the AMF',
        traffic: msg(via('ausf', 'amf'), 'RAND, AUTN, HXRES*'),
        d: 'The AUSF keeps the expected response (XRES*) and gives the AMF the challenge plus a hashed version (HXRES*), so the AMF can check the answer without ever seeing the real one.',
        cites: [{ src: 'ts33501', clause: '6.1.3.2' }],
      },
      {
        id: 'challenge',
        title: 'The phone answers',
        traffic: [
          { p: ['amf', 'gnb', 'ue'], k: 'control', n: 1, speed: 0.32, label: 'RAND, AUTN' },
          { p: ['ue', 'gnb', 'amf'], k: 'control', n: 1, speed: 0.32, phase: 0.5, label: 'RES*' },
        ],
        d: 'The USIM checks AUTN (proving the network is genuine) and computes RES*. The AMF hashes it and compares it with HXRES*.',
        cites: [{ src: 'ts33501', clause: '6.1.3.2' }],
      },
      {
        id: 'confirm',
        title: 'The home network confirms',
        traffic: msg(via('amf', 'ausf'), 'RES*'),
        d: 'The AMF forwards RES* to the AUSF, which compares it with XRES*. The home network, not the visited AMF, makes the final call.',
        cites: [{ src: 'ts33501', clause: '6.1.3.2' }],
      },
    ],
  },
  policy: {
    title: 'Policy for a new session',
    show: ['smf', 'upf', 'pcf', 'udr', 'amf'],
    steps: [
      {
        id: 'create',
        title: 'The SMF asks for policy',
        traffic: msg(via('smf', 'pcf'), 'SMPolicyControl Create'),
        d: 'While setting up a PDU session, the SMF creates an SM policy association with the PCF (Npcf_SMPolicyControl_Create).',
        cites: [c502('4.16.4')],
      },
      {
        id: 'udr',
        title: 'The PCF checks policy data',
        traffic: msg(via('pcf', 'udr'), 'Nudr query'),
        d: 'If it doesn’t already have it, the PCF fetches the subscriber’s policy data from the UDR.',
        cites: [c502('4.16.4'), c501('6.2.4')],
      },
      {
        id: 'rules',
        title: 'Rules come back',
        traffic: msg(via('pcf', 'smf'), 'PCC rules'),
        d: 'The PCF answers with policy and charging control rules: which traffic gets which QoS, and how it is charged.',
        cites: [c502('4.16.4')],
      },
      {
        id: 'enforce',
        title: 'The SMF programs the UPF',
        traffic: msg(['smf', 'upf'], 'N4 rules', 'control'),
        d: 'The SMF turns the rules into packet detection, forwarding and QoS rules on the UPF over N4. The UPF enforces them on every packet.',
        cites: [c501('6.2.2'), c501('6.2.3')],
      },
    ],
  },
  scp: {
    title: 'Indirect communication through an SCP',
    show: ['amf', 'smf', 'nrf', 'scp', 'udm', 'pcf'],
    steps: [
      {
        id: 'send',
        title: 'The AMF sends to the SCP',
        traffic: msg(via('amf', 'scp'), 'request + criteria'),
        d: 'With delegated discovery, the AMF doesn’t look anything up itself. It sends the request to the SCP along with criteria describing the kind of producer it needs.',
        cites: [c502('4.17.9'), c501('6.2.19')],
      },
      {
        id: 'discover',
        title: 'The SCP discovers',
        traffic: msg(via('scp', 'nrf'), 'NFDiscovery'),
        d: 'The SCP asks the NRF for matching instances, or uses what it has cached.',
        cites: [c502('4.17.9')],
      },
      {
        id: 'forward',
        title: 'The SCP forwards',
        traffic: msg(via('scp', 'smf'), 'request'),
        d: 'The SCP picks a producer, here an SMF, and forwards the request. It can also do load balancing, overload control and authorisation checks along the way.',
        cites: [c502('4.17.9'), c501('6.2.19')],
      },
      {
        id: 'reply',
        title: 'The answer comes back the same way',
        traffic: msg(['smf', '@smf', '@scp', 'scp', '@scp', '@amf', 'amf'], 'response'),
        d: 'The response returns through the SCP to the AMF. For the AMF the result is the same as calling the SMF directly.',
        cites: [c502('4.17.9')],
      },
    ],
  },
  exposure: {
    title: 'An application subscribes to events',
    show: ['af', 'nef', 'amf', 'udm', 'udr'],
    steps: [
      {
        id: 'subscribe',
        title: 'The AF asks the NEF',
        traffic: msg(via('af', 'nef'), 'EventExposure Subscribe'),
        d: 'An external application function subscribes to an event about a device, such as reachability or location changes, through the NEF (Nnef_EventExposure_Subscribe).',
        cites: [c502('4.15.3.2.3')],
      },
      {
        id: 'translate',
        title: 'The NEF authorises and translates',
        traffic: msg(via('nef', 'amf'), 'Namf subscribe'),
        d: 'The NEF authorises the request, translates external identifiers into internal ones, and subscribes to the right network function. It may go directly to the AMF, or via the UDM.',
        cites: [c502('4.15.3.2.3'), c501('6.2.5')],
      },
      {
        id: 'event',
        title: 'The event happens',
        traffic: msg(via('amf', 'nef'), 'Notify'),
        d: 'When the event occurs, the AMF notifies the NEF.',
        cites: [c502('4.15.3.2.3')],
      },
      {
        id: 'deliver',
        title: 'The AF is told, in its own terms',
        traffic: msg(via('nef', 'af'), 'Notify (external IDs)'),
        d: 'The NEF passes the notification on to the AF using external identifiers, keeping internal details hidden.',
        cites: [c502('4.15.3.2.3'), c501('6.2.5')],
      },
    ],
  },
};
