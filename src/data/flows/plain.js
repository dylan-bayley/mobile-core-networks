/* Plain-language explanations for each call flow, keyed by flow id and merged
   into the flow by index.js. Same hotel analogy as the component pages
   (src/data/components/plain.js): the network is a hotel and the phone is the
   guest. Each entry is written to hold on 4G, NSA and SA alike; the technical
   differences between the networks are in the flow's own blurb and steps.

   The analogy is a teaching device, not a specification statement. `job` and
   `without` restate what the flow already shows; `limit` says where the
   analogy stops being true.

     job      one line, what the flow achieves
     analogy  the hotel picture
     without  what stops working if this procedure never happened
     limit    optional: where the analogy breaks */

export const PLAIN_FLOWS = {
  data: {
    job: 'The phone joins the network and gets a connection it can send data over.',
    analogy: 'A guest checks in at reception, is identified against the register, and is given a room key and a street address. From then on bags can move through the corridors.',
    without: 'The phone has no identity on the network and no data path, so nothing it sends would go anywhere.',
    limit: 'Check-in is a conversation between many systems, not one desk, and the phone is re-verified on later visits.',
  },
  'data-idle': {
    job: 'When data stops, the radio link is released and the phone is found again when needed.',
    analogy: 'The guest goes quiet in their room. The doorman stops watching, but reception keeps their room wing on file, and updates it if they move to another wing.',
    without: 'The radio link would stay up for every phone all day, or the network would not know where to find an idle phone.',
    limit: 'The phone, not reception, decides when it has moved far enough to report a new wing.',
  },
  voice: {
    job: 'The phone registers for voice, sets up a call and gets a protected audio path.',
    analogy: 'The guest signs in at the hotel telephone exchange, dials a number, and the operator reserves a clear lane in the corridors so the conversation is not stuck behind bags.',
    without: 'Voice would have to compete with ordinary data and could be choppy, and the call could not be arranged.',
    limit: 'The exchange is a separate system on top of the hotel; the voice itself does not pass through it.',
  },
  'voice-mt': {
    job: 'A call arrives for an idle phone, which is found, woken up and connected.',
    analogy: 'A caller phones the hotel for a guest who is resting. Reception pages them, they come to the desk, and the call is then connected as normal.',
    without: 'Calls could only be received while the phone was already busy with data.',
  },
  'voice-epsfb': {
    job: 'The call starts on 5G, but is moved to 4G to carry the voice.',
    analogy: 'The guest asks the new hotel to place a call, but its telephone exchange is not ready, so the guest is walked next door to the older building to make it.',
    without: 'On a 5G network without voice support, the call would fail instead of continuing on LTE.',
    limit: 'The move is done by the network, not the guest.',
  },
  video: {
    job: 'A video call is a voice call with a second protected lane for the video.',
    analogy: 'The same call through the telephone exchange, but the operator reserves a second clear lane for the pictures.',
    without: 'The video would share a lane with ordinary downloads and could stutter.',
  },
  sms: {
    job: 'A text message is delivered to the phone through the network’s message centre.',
    analogy: 'A note is handed to the front desk, which passes it to the guest, who acknowledges it. The note itself is tiny compared with a bag.',
    without: 'Texts would have no route to or from the phone.',
    limit: 'There is more than one way for the note to travel, depending on the network.',
  },
  mms: {
    job: 'A picture message is fetched over an ordinary data connection after a text announces it.',
    analogy: 'The desk sends a note saying a parcel has arrived. The guest then collects the parcel from the post room using the normal corridors.',
    without: 'A picture message could not be announced or collected.',
  },
};
