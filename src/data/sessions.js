/**
 * Session groups shown in the selector. A group with `variants` fans out to
 * several flows (each variant id is a FLOWS key); a group without variants
 * is itself the flow id. The first variant is the default.
 *
 * `tagline` is a one-sentence, plain-language description for newcomers.
 * `path` orders flows into a suggested learning sequence (lower first).
 */
export const DEFAULT_FLOW = 'data';

export const SESSIONS = [
  {
    id: 'voice',
    label: 'Voice call',
    tagline: 'Making and receiving calls over IMS.',
    variants: [
      { id: 'voice', label: 'Originating call', path: 3, tagline: 'Registering with IMS and setting up a call the phone makes.' },
      { id: 'voice-mt', label: 'Terminating call (paging)', path: 4, tagline: 'Finding a sleeping phone and delivering a call to it.' },
      { id: 'voice-epsfb', label: 'EPS fallback', path: 8, tagline: '5G SA hands the call to 4G to actually carry it.' },
    ],
  },
  { id: 'video', label: 'Video call', path: 7, tagline: 'A voice call plus a second media stream.' },
  {
    id: 'data',
    label: 'Data session',
    tagline: 'Joining the network and moving packets.',
    variants: [
      { id: 'data', label: 'Attach & default bearer', path: 1, tagline: 'How a phone joins the network and gets an IP address. Start here.' },
      { id: 'data-idle', label: 'Idle mode & TAU', path: 2, tagline: 'What happens when the phone goes quiet and wakes up somewhere else.' },
    ],
  },
  { id: 'sms', label: 'SMS', path: 5, tagline: 'Text messages riding the signalling plane — no data bearer needed.' },
  { id: 'mms', label: 'MMS', path: 6, tagline: 'A picture message is really a data session plus an SMS notification.' },
];

/** The session group a flow id belongs to (or undefined). */
export const sessionForFlow = (flowId) =>
  SESSIONS.find((s) => s.id === flowId || (s.variants ?? []).some((v) => v.id === flowId));

/** Variants of a session group that a given network actually implements. */
export const variantsFor = (session, networkFlows) =>
  (session.variants ?? [{ id: session.id, label: session.label, path: session.path, tagline: session.tagline }]).filter(
    (v) => networkFlows[v.id],
  );

/** Every flow as a flat, path-ordered list: { id, label, sessionLabel, path, tagline }. */
export const LEARNING_PATH = SESSIONS.flatMap((s) =>
  (s.variants ?? [{ id: s.id, label: s.label, path: s.path, tagline: s.tagline }]).map((v) => ({
    ...v,
    sessionLabel: s.label,
    label: s.variants ? `${s.label} — ${v.label}` : v.label,
  })),
).sort((a, b) => a.path - b.path);

/** Tagline for a flow id, falling back to its session group's. */
export const taglineFor = (flowId) => {
  const s = sessionForFlow(flowId);
  if (!s) return '';
  const v = (s.variants ?? []).find((x) => x.id === flowId);
  return v?.tagline ?? s.tagline ?? '';
};
