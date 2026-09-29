/* The Learn path: five architecture lessons, then the Flows explorer. The
   order matters — each lesson assumes the one before it. Scenes and
   diagrams live in the per-lesson modules and are attached in ./index.js. */
export const LESSON_META = [
  {
    id: 'epc',
    n: 1,
    title: 'The 4G core (EPC)',
    short: '4G EPC',
    blurb: 'Eight boxes that carried the first all-IP mobile network: who does signalling, who carries packets, and who holds the rules.',
    minutes: 6,
  },
  {
    id: '5gc',
    n: 2,
    title: 'The 5G core (5GC)',
    short: '5G core',
    blurb: 'The same jobs split into network functions that offer services to each other over HTTP, then drawn the classic way for comparison.',
    minutes: 9,
  },
  {
    id: 'interworking',
    n: 3,
    title: 'Running 4G and 5G together',
    short: 'Interworking',
    blurb: 'How one subscriber moves between the EPC and the 5GC: combined nodes, and the N26 link between MME and AMF.',
    minutes: 5,
  },
  {
    id: 'sa-nsa',
    n: 4,
    title: '5G SA vs NSA',
    short: 'SA vs NSA',
    blurb: 'Non-standalone adds 5G radio to a 4G core; standalone swaps the core too. See where the user plane flows in each.',
    minutes: 7,
  },
  {
    id: 'ims',
    n: 5,
    title: 'IMS: voice over any core',
    short: 'IMS',
    blurb: 'The SIP servers that carry voice over 4G and 5G: registration, service triggers, the voice bearer, and the way out to other networks.',
    minutes: 9,
  },
];

export const lessonMeta = (id) => LESSON_META.find((l) => l.id === id) ?? null;
