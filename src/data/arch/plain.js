/* Plain-language explanations for each Learn scene, merged into the scene by
   index.js. They use the same hotel analogy as the component pages
   (src/data/components/plain.js): the network is a hotel and the phone is the
   guest.

   Reception desk = AMF, concierge = SMF, corridors and lifts = UPF, guest
   register = UDM, ID check = AUSF, house rules = PCF, billing desk = CHF,
   staff directory = NRF, front door = base station.

   The analogy is a teaching device, not a specification statement. `job` and
   `without` restate what the scene and its cited sources already say; `limit`
   says where the analogy stops being true. Keys are "<lessonId>/<sceneId>".

     job      one line, what this scene is about
     analogy  the hotel picture
     without  what stops working if this part is missing
     limit    optional: where the analogy breaks */

export const PLAIN_SCENES = {
  /* ---------------------------------------------------------------- 4G core */
  'epc/edges': {
    job: 'A 4G phone reaches the internet through a radio network and a packet core.',
    analogy: 'The guest walks in through the front door (the eNodeB), and the hotel behind it (the EPC) gets them to the street on the other side (the internet or voice network).',
    without: 'Without the core, the radio link would lead nowhere: there is no way to reach the internet or IMS.',
    limit: 'A real hotel has one front door per guest at a time; a phone can be served by different eNodeBs as it moves.',
  },
  'epc/mme': {
    job: 'The MME handles the phone’s signalling and never touches its data.',
    analogy: 'The reception desk and concierge in one: it checks guests in, knows roughly which wing they are in, rings their room, and chooses which lifts they use.',
    without: 'No phone could attach, be found when a call arrives, or have its connection set up.',
    limit: 'It never carries the bags: user data does not pass through the MME.',
  },
  'epc/gateways': {
    job: 'Two gateways carry the packets: one follows the phone, one faces the internet.',
    analogy: 'The lifts near the front door (S-GW) stay put as the guest changes rooms; the lift to the street (P-GW) is where the guest gets a street address.',
    without: 'No user data would flow, and the phone would lose its IP address each time it moved.',
    limit: 'The gateways do not decide anything on their own; the MME tells the S-GW what to do.',
  },
  'epc/hss': {
    job: 'The HSS is the master record of who the subscriber is and how to verify them.',
    analogy: 'The guest register in the back office: reception checks it to confirm the booking and fetches the ID-check details.',
    without: 'The MME could not verify the phone or find out what the subscriber is allowed to do.',
  },
  'epc/pcc': {
    job: 'The PCRF sets the rules and the OCS tracks the credit for a data session.',
    analogy: 'The house rules (PCRF) say which guests get express lifts, and the billing desk (OCS) says how much credit is left on the tab.',
    without: 'Every session would get the same treatment, and prepaid credit could not be checked in real time.',
    limit: 'Rules are only enforced by the P-GW; the PCRF just sends them.',
  },
  'epc/eir': {
    job: 'The EIR lets the network refuse a stolen or blocked handset.',
    analogy: 'A list at the front desk of luggage tags that are barred, checked against the guest’s bags on arrival.',
    without: 'A stolen handset with a valid SIM could still use the network.',
    limit: 'It checks the handset, not the person or the SIM.',
  },
  'epc/planes': {
    job: 'Signalling and user data travel on separate paths through the 4G core.',
    analogy: 'Staff phone calls between desks are one network of corridors; the guest’s luggage moves on a separate service route.',
    without: 'Without the split, you could not tell which links carry control messages and which carry traffic.',
    limit: 'In classic 4G each gateway still does both jobs in one box, so the split is logical, not physical.',
  },
  'epc/bearer': {
    job: 'A bearer is a path through the network with one quality level.',
    analogy: 'A numbered lane in the corridor: the voice lane is kept clear, the bulk-luggage lane is slower.',
    without: 'All traffic would share one treatment, so calls and downloads would compete.',
    limit: 'The packets travel inside tunnels (GTP-U), which a lane does not capture; the tunnel is what lets the address stay the same as the phone moves.',
  },
  'epc/cups': {
    job: 'CUPS splits each gateway into a control part and a user-plane part.',
    analogy: 'The lift operator’s office and the lift shaft become separate: you can add shafts near the entrances without moving the office.',
    without: 'Operators would have to scale and place control and user-plane hardware together.',
    limit: 'It is an optional upgrade added in Release 14, not how every 4G network started.',
  },

  /* ---------------------------------------------------------------- 5G core */
  '5gc/edges': {
    job: 'The 5G core sits between the 5G radio and the data networks.',
    analogy: 'The guest comes through the front door (gNB); everything behind it, up to the street, is the hotel (the 5GC).',
    without: 'The radio would have nowhere to send the phone’s traffic.',
  },
  '5gc/amf': {
    job: 'The AMF is the front door of the core: it handles registration and mobility.',
    analogy: 'The reception desk: it checks you in, tracks roughly where you are, and passes requests for services to the concierge.',
    without: 'No phone could register or be reached, and no session request would get through.',
    limit: 'Reception does not carry any luggage: user data does not pass through the AMF.',
  },
  '5gc/smf-upf': {
    job: 'The SMF sets up the session; the UPF moves the packets.',
    analogy: 'The concierge arranges your route and your street address; the corridors and lifts (UPF) take your bags.',
    without: 'No data session could be created, and nothing would forward your packets.',
    limit: 'In real networks one SMF directs many UPFs, and a session can be moved between them.',
  },
  '5gc/subscriber': {
    job: 'UDM, AUSF and UDR hold the subscription, check the identity and store the data.',
    analogy: 'The guest register (UDM), the ID check (AUSF) and the filing cabinet behind them (UDR).',
    without: 'The network could not prove who the phone is or look up what the subscriber may do.',
  },
  '5gc/policy': {
    job: 'The PCF decides the rules for a session and the CHF counts what it costs.',
    analogy: 'The house rules (which guests get fast lifts) and the billing desk (how much has been used).',
    without: 'Sessions would get no tailored treatment and usage could not be charged.',
  },
  '5gc/plumbing': {
    job: 'NRF, NSSF and SCP help functions find each other and the right slice.',
    analogy: 'The staff directory (NRF) says who can do what, the floor planner (NSSF) picks the right wing for a guest, and an optional switchboard (SCP) passes requests along.',
    without: 'Functions would have to be configured by hand with the address of every other function.',
  },
  '5gc/exposure': {
    job: 'The NEF lets outside applications influence the core without seeing inside it.',
    analogy: 'A visitors’ desk: outside companies ask there, and staff translate the request and keep the building layout private. Trusted partners may go straight to the back office.',
    without: 'Outside applications would need direct access to internal functions, or could not ask at all.',
  },
  '5gc/roaming': {
    job: 'The SEPP guards the border when signalling crosses to another operator.',
    analogy: 'A security gate on the road between two hotel chains: messages are checked on the way in and out and the inside layout is hidden.',
    without: 'Another operator’s messages would reach internal functions unfiltered.',
  },
  '5gc/sba': {
    job: 'Core functions offer named services to each other over a shared bus.',
    analogy: 'Instead of a phone line between every pair of desks, staff post a request on the internal intranet and the right desk answers.',
    without: 'Every pair of functions would need its own fixed link.',
    limit: 'The intranet is still HTTP/2 messages between real functions, each of which has to be authorised.',
  },
  '5gc/refpoint': {
    job: 'The same core can be drawn with a numbered link between each pair of functions.',
    analogy: 'The same hotel shown as a wiring plan rather than a service board: nothing has moved, only the drawing.',
    without: 'Specifications and traces that cite “N11” or “N8” would be hard to follow.',
    limit: 'It leaves out the NRF, NEF and UDR because they would connect to almost everything.',
  },
  '5gc/planes': {
    job: 'Control messages stay in the core; your packets only pass the gNB and the UPF.',
    analogy: 'The staff talk to each other upstairs, while your luggage only goes through the front door and the corridors.',
    without: 'You could not put the corridors near the guests while keeping the desks in one place.',
  },
  '5gc/slices': {
    job: 'A slice is a logical network inside the core, and a phone can use several.',
    analogy: 'Separate wings of the hotel for different kinds of guests, each with its own concierge and corridors, but sharing one reception.',
    without: 'Every kind of traffic would share the same network treatment.',
    limit: 'Wings are physical; slices are logical, and may share the same hardware.',
  },
  '5gc/ghost': {
    job: 'This is the 4G core for comparison, before it is mapped to 5G.',
    analogy: 'The hotel’s older floor plan, with fewer, bigger desks, shown behind the new one.',
    without: 'You could not see where each 5G function came from.',
  },
  '5gc/analog': {
    job: 'The 4G boxes split into smaller 5G functions with much the same jobs.',
    analogy: 'One overworked desk becomes several specialist desks. The jobs are the same; the org chart is finer.',
    without: 'You would have to learn the 5G functions from scratch rather than from what you know of 4G.',
    limit: 'The mapping is a guide, not one-to-one: some 4G roles are shared by several 5G functions.',
  },

  /* --------------------------------------------------- 4G and 5G together */
  'interworking/two-cores': {
    job: 'Operators run 4G and 5G side by side, and phones move between them.',
    analogy: 'The old hotel and the new hotel share a street, and a guest may walk between them with the same booking.',
    without: 'A phone leaving 5G coverage would lose its connection instead of continuing on LTE.',
  },
  'interworking/combined': {
    job: 'Combined nodes act as part of both cores so the session keeps its anchor.',
    analogy: 'A single side door that both buildings use: whichever way the guest enters, they come out at the same street address.',
    without: 'The phone’s IP address could change when it moves between 4G and 5G.',
    limit: 'The combined nodes are optional, used where interworking is needed.',
  },
  'interworking/on-lte': {
    job: 'On LTE the packets go through the S-GW to the combined user-plane node.',
    analogy: 'The guest is in the old building, but their bags are still collected at the shared side door.',
    without: 'The 4G side would not see the combined node as a gateway it could use.',
  },
  'interworking/on-nr': {
    job: 'After moving to 5G the packets reach the same anchor and the IP address survives.',
    analogy: 'The guest moves to the new building and bags go to the same side door, so nothing needs re-sending.',
    without: 'The ongoing session would have to restart with a new address.',
  },
  'interworking/n26': {
    job: 'With N26 the 4G and 5G signalling nodes hand the phone’s context to each other.',
    analogy: 'The two reception desks phone each other and pass on the guest’s file before they arrive.',
    without: 'Handovers between 4G and 5G would pause service while the phone starts over.',
    limit: 'N26 is optional, and not every operator turns it on.',
  },
  'interworking/no-n26': {
    job: 'Without N26 the phone re-registers, but still reaches the same anchor.',
    analogy: 'The new reception desk never calls the old one, but the guest register says which concierge has their booking.',
    without: 'The phone would lose its session each time it changed between 4G and 5G.',
    limit: 'It is simpler to deploy but service is interrupted for longer.',
  },

  /* ------------------------------------------------------------- SA vs NSA */
  'sa-nsa/endc': {
    job: 'In NSA, a phone uses a 4G and a 5G base station together on a 4G core.',
    analogy: 'The guest enters by the old front door, and a new side entrance adds extra capacity, but the hotel behind is still the old one.',
    without: 'Operators could not add 5G radio capacity before building a 5G core.',
  },
  'sa-nsa/anchor': {
    job: 'LTE holds the control plane, and the 5G radio cannot work without it.',
    analogy: 'Only the old front door talks to reception; the side entrance just carries bags and takes its instructions from the doorman.',
    without: 'The 5G radio would have no way to reach the core, so the phone could not use it.',
  },
  'sa-nsa/opt3': {
    job: 'Option 3: the 4G node receives the traffic and splits it between the two radios.',
    analogy: 'All bags arrive at the old door, and the doorman sends some round to the side entrance.',
    without: 'The 5G radio would have no data to send in this arrangement.',
    limit: 'Because the LTE node must handle all 5G traffic, it can become the bottleneck.',
  },
  'sa-nsa/opt3a': {
    job: 'Option 3a: the core sends some bearers straight to the 5G base station.',
    analogy: 'Bags for the side entrance are delivered there directly by the corridors; nothing is relayed by the doorman.',
    without: 'All traffic would have to go through the LTE node first.',
  },
  'sa-nsa/opt3x': {
    job: 'Option 3x: the 5G base station receives the traffic and splits it.',
    analogy: 'All bags arrive at the new side entrance, which sends a few round to the old door if needed.',
    without: 'The 4G node would carry 5G-scale traffic.',
    limit: '“3x” is industry shorthand; 3GPP just names the bearer types.',
  },
  'sa-nsa/opt2': {
    job: 'In SA, the 5G base station talks directly to the 5G core.',
    analogy: 'The new building has its own front door and reception, and no longer depends on the old one.',
    without: 'The phone could not use 5G-only features, as there would be no 5G core to provide them.',
  },
  'sa-nsa/opt2-data': {
    job: 'SA unlocks slicing, 5G QoS, a service-based core and voice over NR.',
    analogy: 'NSA bolts a bigger entrance onto the old hotel; SA is the new hotel with all its new facilities.',
    without: 'The network would give 5G speed but none of the 5G-system features.',
  },

  /* ------------------------------------------------------------------- IMS */
  'ims/on-top': {
    job: 'Voice runs on SIP servers that sit on top of the packet core.',
    analogy: 'The hotel’s own telephone exchange: guests reach it through the usual corridors, which treat the calls as just more traffic.',
    without: 'Neither the 4G nor the 5G core would be able to place a voice call by itself.',
    limit: 'The exchange is a separate system, not part of the hotel building.',
  },
  'ims/find-pcscf': {
    job: 'The phone gets its own IMS data session and learns the address of its first contact.',
    analogy: 'On arrival the guest is handed the extension of the switchboard operator they must always call first.',
    without: 'The phone would have no way to reach IMS.',
  },
  'ims/register': {
    job: 'Registration passes through the P-CSCF and I-CSCF to find the right S-CSCF.',
    analogy: 'The operator passes the guest’s sign-in to the head switchboard, which looks up in the register which supervisor handles them.',
    without: 'The network would not know which server should handle the user’s calls.',
  },
  'ims/aka': {
    job: 'The S-CSCF challenges the phone, which proves itself with its SIM.',
    analogy: 'The supervisor asks a question only the guest’s key card can answer, then both agree a private code for later calls.',
    without: 'Anyone could register as any user.',
  },
  'ims/ifc': {
    job: 'The user’s service profile tells the S-CSCF which application servers to involve.',
    analogy: 'The guest’s file lists the extras they have: voicemail, call forwarding. The supervisor makes sure those desks are told.',
    without: 'Calls would work, but services such as forwarding or barring would not.',
  },
  'ims/invite': {
    job: 'An INVITE offers a call and carries the codecs the caller can use.',
    analogy: 'The guest tells the operator who they want and which languages they can speak, and the operator passes that on, via any services.',
    without: 'No call could be offered or answered.',
  },
  'ims/qos-5g': {
    job: 'IMS asks the 5G core to reserve a voice-grade flow for the call.',
    analogy: 'The switchboard tells the house rules desk, which tells the corridors to keep a clear lane for this call.',
    without: 'Voice would share a lane with downloads and could be choppy.',
    limit: 'The phone does not ask for the lane; the network sets it up.',
  },
  'ims/qos-4g': {
    job: 'On 4G the same step reserves a dedicated bearer for the voice.',
    analogy: 'The same request, to the older rules desk, which reserves a lane in the older corridors.',
    without: 'Calls on LTE would compete with other traffic.',
  },
  'ims/media': {
    job: 'SIP sets the call up, but the voice travels separately as RTP.',
    analogy: 'The switchboard arranges the call, but then steps aside: the conversation goes down the reserved corridor, not through the switchboard.',
    without: 'The signalling servers would have to carry every call’s audio.',
  },
  'ims/pstn': {
    job: 'Calls to ordinary phone numbers leave IMS through gateways.',
    analogy: 'A translator at the hotel’s back door converts the call to the language of the old city phone network.',
    without: 'IMS users could not call people on the older phone network.',
  },
  'ims/interconnect': {
    job: 'Calls to another operator’s IMS leave and enter through border controllers.',
    analogy: 'A guarded gate between two hotels’ phone exchanges, hiding the internal layout of each.',
    without: 'Calls between operators would reveal their internal topology or be unscreened.',
  },
  'ims/fallback': {
    job: 'If 5G cannot carry the voice, the call moves to LTE and continues.',
    analogy: 'The guest is walked to the older building to make the call, which is still on the same telephone exchange.',
    without: 'On a 5G network without voice support, calls would fail.',
  },

  /* ------------------------------------------------------------------- SIP */
  'sip/not-http': {
    job: 'SIP looks like HTTP but sets up sessions rather than fetching documents.',
    analogy: 'It is a conversation to arrange a meeting, not the meeting itself.',
    without: 'There would be no standard way for two phones to agree a call.',
    limit: 'SIP never carries the voice; that goes separately.',
  },
  'sip/three-way': {
    job: 'A call is set up by INVITE, 180 Ringing, 200 OK and ACK.',
    analogy: 'You ask, they say “ringing”, they say “got it”, and you say “thanks”, so both know the call is on.',
    without: 'The caller could not be sure the answer arrived over an unreliable network.',
  },
  'sip/media-and-bye': {
    job: 'The voice flows as RTP; either side ends the call with a BYE.',
    analogy: 'Once the meeting begins the secretaries go quiet, until someone says goodbye.',
    without: 'There would be no way to hang up cleanly.',
  },
  'sip/anatomy': {
    job: 'An INVITE has a request line, headers and a body describing the media.',
    analogy: 'A letter with an address on the envelope, routing labels, and the proposal inside.',
    without: 'Servers would not know where to send the message or how to match replies.',
  },
  'sip/dialog': {
    job: 'A transaction is one exchange; a dialog is the whole call between two phones.',
    analogy: 'A transaction is one question and its answer; a dialog is the whole conversation, identified by a shared reference number.',
    without: 'Messages in a trace could not be tied to the right call.',
  },
  'sip/methods': {
    job: 'SIP has six core methods, and extensions add more that IMS relies on.',
    analogy: 'The basic verbs (ask, confirm, hang up) plus extra verbs added over time.',
    without: 'Phones and servers could not agree which extensions they could use.',
  },
  'sip/offer-answer': {
    job: 'SDP carries an offer of codecs and ports, and the answer picks from it.',
    analogy: 'One side lists the languages and the mailbox it can use; the other picks one both understand.',
    without: 'The two phones would not know where to send the voice or how to encode it.',
  },
  'sip/mobile-codecs': {
    job: 'Mobile calls use the 3GPP speech codecs, with dynamic payload numbers.',
    analogy: 'A phrasebook where the numbers only mean something because this particular letter says so.',
    without: 'A trace’s payload numbers would be meaningless without the rtpmap lines.',
  },
  'sip/proxies': {
    job: 'Phones register where they are, and proxies route calls to that address.',
    analogy: 'Guests leave their room number at the front desk, and operators use that to forward calls.',
    without: 'A caller would have to know the other phone’s current address.',
  },
  'sip/routing': {
    job: 'The INVITE goes via the proxy, and later messages may skip it unless it asks to stay.',
    analogy: 'The operator connects the first call, then steps aside unless they ask to listen in for the rest.',
    without: 'Responses and later requests would not know which route to follow.',
    limit: 'The IMS P-CSCF always stays in the path.',
  },
  'sip/cancel': {
    job: 'CANCEL abandons a call that has not been answered yet.',
    analogy: 'Hanging up while it is still ringing: you can’t say goodbye to someone who hasn’t picked up.',
    without: 'The far phone would keep ringing.',
  },
  'sip/failures': {
    job: 'Final responses from 300 to 699 explain why a request failed.',
    analogy: 'The operator’s reply: “busy”, “not here”, “cancelled”, “no common language”.',
    without: 'A failed call would give no clue to the cause.',
    limit: 'Some codes, such as 401, only ask you to try again with credentials.',
  },
  'sip/ims-register': {
    job: 'IMS registration is SIP REGISTER with an IMS AKA challenge.',
    analogy: 'The sign-in at the switchboard, with the key-card check from the register.',
    without: 'The network could not trust who is calling.',
  },
  'sip/ims-headers': {
    job: 'IMS adds headers that let the network vouch for the caller and fix the route.',
    analogy: 'The operator stamps each call with a verified caller ID and notes the route to follow.',
    without: 'The caller could claim any identity, and later requests might bypass the right servers.',
  },
  'sip/preconditions': {
    job: 'Preconditions make sure the voice path exists before the far phone rings.',
    analogy: 'The corridor lane is reserved before the phone rings, so the first words are not lost.',
    without: 'The first words of a call could be lost.',
  },
  'sip/ring-and-answer': {
    job: 'When both sides are ready, the far phone rings, answers, and voice flows.',
    analogy: 'Once the lane is clear the bell rings; when answered, the conversation runs along the reserved corridor.',
    without: 'The call would not start in a controlled way.',
    limit: 'The same SIP works over 4G and 5G; only the lane underneath changes.',
  },
};
