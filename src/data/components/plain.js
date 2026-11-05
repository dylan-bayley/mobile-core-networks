/* Plain-language explanations for newcomers, merged into each component by
   index.js. One analogy runs through all of them: the network is a hotel and
   the phone is the guest.

   Reception desk = AMF, concierge = SMF, corridors and lifts = UPF, guest
   register = UDM, ID check = AUSF, house rules = PCF, billing desk = CHF,
   staff directory = NRF.

   The analogy is a teaching device, not a specification statement. `job` and
   `without` restate what the component's cited sources already say; `limit`
   says where the analogy stops being true, so nobody learns something wrong.

     job      one line, what it is for
     analogy  the hotel picture
     without  what stops working if it is missing
     limit    optional: where the analogy breaks */

export const PLAIN = {
  gnb: {
    job: 'The base station: the radio link between your phone and the core.',
    analogy: 'The hotel’s front door and doorman. Guests arrive here, and the doorman passes them on to reception or the corridors.',
    without: 'The phone has no radio connection, so nothing else in the core can reach it.',
    limit: 'A doorman does not choose where you go next. The core makes those decisions.',
  },
  enb: {
    job: 'The 4G base station: the radio link between your phone and the core.',
    analogy: 'The same front door and doorman as the gNB, in the 4G building. Guests arrive here and are passed on to reception or the corridors.',
    without: 'The phone has no radio connection, so nothing else in the core can reach it.',
    limit: 'It does more than relay: it also manages handovers between cells.',
  },
  mme: {
    job: 'Checks phones in, finds them when needed, and sets up their connections.',
    analogy: 'The reception desk and concierge in one person. It checks you in, knows roughly which wing you are in, and arranges your services. The 5G core splits this job between the AMF and the SMF.',
    without: 'No phone could attach, be paged for a call, or have a data connection set up.',
    limit: 'It never carries the bags. Your data does not pass through the MME at all.',
  },
  sgw: {
    job: 'Anchors your data path on the radio side while you move around.',
    analogy: 'The lift bank near the front door. Wherever you go inside the hotel, your bags are routed through the same lift lobby, and only the last stretch changes.',
    without: 'Data would have to be re-routed end to end each time the phone moved between base stations.',
    limit: 'Unlike a lift, it also buffers messages for guests who are asleep (idle) until the desk wakes them.',
  },
  pgw: {
    job: 'Gives the phone its IP address and connects it to the internet.',
    analogy: 'The hotel’s main exit onto the street, with a doorman who hands you a street address and applies the house rules to everything going in or out.',
    without: 'The phone would have no IP address and no route to the internet or the operator’s services.',
    limit: 'The rules come from the PCRF. The P-GW only enforces them.',
  },
  hss: {
    job: 'The master record of every subscriber and their SIM credentials.',
    analogy: 'The guest register and the safe holding each guest’s ID details, in one book. In 5G the ID check, register and filing room are separate (AUSF, UDM, UDR).',
    without: 'The network would not know who a SIM belongs to, could not check it, and would not know which services it may use.',
  },
  pcrf: {
    job: 'Decides the speed, priority and charging rules for each session.',
    analogy: 'The house rules and your booking package. It decides what you are entitled to, and tells the main exit (P-GW) to enforce it.',
    without: 'Every session would get default treatment, and a voice call could not get a protected path.',
    limit: 'It only decides. The P-GW carries the rules out.',
  },
  ocs: {
    job: 'Checks and reserves credit before use, so prepaid works.',
    analogy: 'The billing desk with a prepaid card. Before each service it checks there is credit, sets some aside, and cuts you off at zero.',
    without: 'Prepaid credit could not be enforced in real time.',
    limit: 'In 5G the CHF takes over this role, and also produces the records for the bill.',
  },
  eir: {
    job: 'Checks a device has not been reported lost or stolen.',
    analogy: 'A check against the lost-and-stolen list when a guest arrives with a particular suitcase.',
    without: 'Blocked or stolen devices could not be refused by the network.',
    limit: 'It is optional, and checks the device (IMEI), not the SIM.',
  },
  pcscf: {
    job: 'The phone’s first stop for every call and text, and where voice quality is requested.',
    analogy: 'The line from your room phone to the hotel exchange. Every call you make or receive goes through it, and it is the part that asks the hotel for a protected, reliable line for a call.',
    without: 'The phone could not reach IMS, so no voice-over-4G or 5G calls, and no voice-grade QoS would be requested.',
    limit: 'It handles the call set-up messages. The voice itself travels over the packet core’s corridors (the UPF or P-GW).',
  },
  icscf: {
    job: 'The home network’s front desk for IMS: points each request at the right S-CSCF.',
    analogy: 'The hotel’s main switchboard number. It does not handle your call; it looks up which operator looks after you and passes you on.',
    without: 'Registrations and incoming calls would not know which S-CSCF serves which user.',
  },
  scscf: {
    job: 'Registers users and runs their calls, bringing in extra services as needed.',
    analogy: 'The operator who holds your account. It confirms you are a guest, knows which extras you have (such as call forwarding), and stays on every call to bring those in.',
    without: 'Users could not register for IMS services, and no call could be set up or given its services.',
    limit: 'The operator decides who to involve. The services themselves are run by application servers such as the TAS.',
  },
  tas: {
    job: 'Provides the telephony features: forwarding, waiting, barring.',
    analogy: 'The feature desk. Divert my calls, hold on, do not disturb: the operator hands the call here when your account says one of these applies.',
    without: 'Basic calls might connect, but features such as call forwarding, call waiting and barring would not work.',
  },
  mrf: {
    job: 'Plays announcements and tones, and mixes conference calls.',
    analogy: 'The hotel’s conference room and announcement system. It plays "the person you called is unavailable" and joins several people onto one call.',
    without: 'No network announcements, tones or conference calls.',
  },
  imsagw: {
    job: 'Guards the voice path at the edge of IMS.',
    analogy: 'The security checkpoint on the voice line, checking that what passes is actually the call that was set up.',
    without: 'The operator could not translate addresses or police the voice flows at the IMS edge.',
    limit: 'It is an edge component in some designs, not something every call needs.',
  },
  bgcf: {
    job: 'Chooses which exit a call takes to reach the older phone network.',
    analogy: 'The route planner at the outbound desk. When a guest dials an outside landline, it decides which exchange the call should leave through.',
    without: 'Calls from IMS to ordinary landlines and older mobile networks would have no way to choose their exit.',
    limit: 'It chooses the exit. The MGCF actually makes the hand-over.',
  },
  mgcf: {
    job: 'Translates call set-up between IMS and the older phone network.',
    analogy: 'The interpreter at the exit. IMS speaks SIP and the old landline speaks ISUP, so every message is translated as the call leaves.',
    without: 'IMS users could not call or be called by anyone still on the older circuit-switched network.',
    limit: 'The interpreter handles the set-up. A separate gateway (IMS-MGW) converts the voice itself.',
  },
  ibcf: {
    job: 'Guards the border between this operator’s IMS and other networks.',
    analogy: 'The security desk between two hotels’ phone systems. Every call to a partner passes through it, and it hides the layout of the building.',
    without: 'Calls to other operators’ IMS networks would cross the border unscreened, exposing internal details.',
  },
  amf: {
    job: 'Checks phones in and always knows where they are.',
    analogy: 'The reception desk. You check in once, and reception knows you are in the building and which wing you are in, and can find you when someone calls.',
    without: 'No phone could register, be reached for a call or text, or move between cells without losing its connection.',
    limit: 'Reception does not carry your luggage. That is the UPF’s job.',
  },
  smf: {
    job: 'Sets up each data connection and tells the UPF how to handle it.',
    analogy: 'The concierge. You ask for a service, such as internet access, and the concierge arranges it: gives you a room number (your IP address) and briefs the lift and corridor staff.',
    without: 'A phone could register but could never open a data session, so no web or apps.',
    limit: 'The concierge arranges things but never carries the bags. All the packets go through the UPF.',
  },
  upf: {
    job: 'Carries your actual data to and from the internet.',
    analogy: 'The corridors, lifts and taxi rank. Every bag you send out or receive travels this way, following the route the concierge set up.',
    without: 'Sessions could be set up on paper, but no data would flow.',
    limit: 'A lift does not read the label on your bag. The UPF does, to apply QoS, usage counting and policy rules.',
  },
  ausf: {
    job: 'Checks that a SIM is genuine, on behalf of the home network.',
    analogy: 'The ID check at the door. It confirms the guest’s passport is real before reception lets them in.',
    without: 'The network could not prove who is connecting, so it could not safely admit anyone.',
    limit: 'It does not hold the guest list. It asks the UDM for the credentials to check against.',
  },
  udm: {
    job: 'Holds each subscriber’s identity and plan, and who is serving them now.',
    analogy: 'The guest register: who you are, which package you booked, and which desk and concierge are currently looking after you.',
    without: 'The network would not know who a SIM belongs to or what it is allowed to do.',
    limit: 'The register is the logic. The data itself is kept in the UDR.',
  },
  udr: {
    job: 'The database behind the subscriber, policy and exposure functions.',
    analogy: 'The filing room behind the register. The staff who need records ask for them, but this is where the paper actually lives.',
    without: 'The functions that need stored data would have nowhere to keep or fetch it.',
  },
  pcf: {
    job: 'Decides the rules for each user: speed, priority and what is allowed.',
    analogy: 'The house rules and your booking package. It decides whether you get the premium suite, which services are included, and what happens if you overstay.',
    without: 'Every user would get the same default treatment, and a voice call could not get a protected, priority path.',
    limit: 'The PCF only decides. The SMF and UPF carry out the rules.',
  },
  bsf: {
    job: 'Remembers which PCF is looking after which session.',
    analogy: 'The note on the front desk saying which manager is handling which guest, so a visiting supplier knows who to ask.',
    without: 'With many PCFs, an application would not know which one to contact about a given user.',
  },
  chf: {
    job: 'Counts usage and charges for it, in real time.',
    analogy: 'The billing desk. It tallies what you use, can stop the minibar when your credit is spent, and produces the bill at checkout.',
    without: 'Usage could not be billed, and prepaid credit could not be enforced.',
  },
  nrf: {
    job: 'The directory: who offers which service, and where to find them.',
    analogy: 'The staff directory. When a new concierge starts they sign in, and anyone needing a concierge looks one up there.',
    without: 'Functions would have to be configured with each other’s addresses by hand, and could not scale or fail over on their own.',
  },
  nssf: {
    job: 'Picks which network slice, and which AMF, serves a phone.',
    analogy: 'Assigning a guest to a wing or room class: a business floor for some, a family floor for others, each run differently.',
    without: 'Every phone would land in the same one-size-fits-all service, with no slicing.',
  },
  scp: {
    job: 'Routes requests between network functions on their behalf.',
    analogy: 'The internal switchboard. Staff ask it to pass a message to the right colleague, and it handles the finding, balancing and retrying.',
    without: 'Network functions would call each other directly. This works, and is why the SCP is optional.',
  },
  nef: {
    job: 'A safe doorway for outside applications to use the network.',
    analogy: 'The concierge window for outside suppliers. A taxi firm or event organiser can ask for things or get notified, without being given the keys to the building.',
    without: 'Third parties could not securely ask the network for events or capabilities.',
  },
  af: {
    job: 'Any application asking the core for something specific.',
    analogy: 'A visiting service that asks the hotel for a favour, such as a conference organiser asking for a quiet, reliable meeting room.',
    without: 'Applications could not ask the network for special treatment, such as guaranteed quality for voice calls.',
    limit: 'The AF is not one product. It is a role that many applications can play.',
  },
  sepp: {
    job: 'Guards signalling between two operators’ networks.',
    analogy: 'The security desk between two hotels in the same group. Every message to a partner hotel goes through it, and it hides the layout of the building.',
    without: 'Roaming signalling would cross the border unprotected, exposing each operator’s internals.',
  },
  smsf: {
    job: 'Delivers text messages over the signalling connection.',
    analogy: 'The in-house message service. Notes are slipped through reception without needing a room or corridor.',
    without: 'SMS over NAS would not work, so texts would need to go over IMS instead.',
  },
  eir5g: {
    job: 'Checks a device has not been reported blocked.',
    analogy: 'A check against the lost-and-stolen list when a guest arrives with a particular suitcase.',
    without: 'Blocked or stolen devices could not be refused by the network.',
    limit: 'It is optional, and checks the device, not the SIM.',
  },
  n3iwf: {
    job: 'Lets phones reach the core through untrusted Wi-Fi.',
    analogy: 'A secure side entrance for guests arriving from outside the grounds. They come through a locked tunnel and are then treated like everyone else.',
    without: 'Phones could not use the 5G core over untrusted Wi-Fi.',
  },
  nwdaf: {
    job: 'Studies what the network is doing and makes predictions.',
    analogy: 'The hotel analyst, who watches occupancy and traffic and tells managers when to open another floor.',
    without: 'Other functions would lose analytics such as load forecasts. Nothing else would stop.',
  },
};
