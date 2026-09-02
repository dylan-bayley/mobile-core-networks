/**
 * Session groups shown in the selector. A group with `variants` fans out to
 * several flows (each variant id is a FLOWS key); a group without variants
 * is itself the flow id. The first variant is the default.
 */
export const SESSIONS = [
  {
    id: 'voice',
    label: 'Voice call',
    variants: [
      { id: 'voice', label: 'Originating call' },
      { id: 'voice-mt', label: 'Terminating call (paging)' },
      { id: 'voice-epsfb', label: 'EPS fallback' },
    ],
  },
  { id: 'video', label: 'Video call' },
  {
    id: 'data',
    label: 'Data session',
    variants: [
      { id: 'data', label: 'Attach & default bearer' },
      { id: 'data-idle', label: 'Idle mode & TAU' },
    ],
  },
  { id: 'sms', label: 'SMS' },
  { id: 'mms', label: 'MMS' },
];

/** The session group a flow id belongs to (or undefined). */
export const sessionForFlow = (flowId) =>
  SESSIONS.find((s) => s.id === flowId || (s.variants ?? []).some((v) => v.id === flowId));

/** Variants of a session group that a given network actually implements. */
export const variantsFor = (session, networkFlows) =>
  (session.variants ?? [{ id: session.id, label: session.label }]).filter((v) => networkFlows[v.id]);
