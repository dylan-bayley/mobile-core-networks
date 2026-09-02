import { NETWORKS } from './networks.js';
import { SESSIONS, sessionForFlow, variantsFor } from './sessions.js';
import { FLOWS } from './flows/index.js';
import { TOPOLOGIES } from './topologies/index.js';

export { NETWORKS, SESSIONS, FLOWS, TOPOLOGIES, sessionForFlow, variantsFor };

/**
 * Resolves a (networkId, flowId) pair to the topology and step data the
 * diagram should render. If the network doesn't implement that flow, falls
 * back to the flow's session-group default, then to the data session, so the
 * app never white-screens on an unimplemented pairing (e.g. EPS fallback on
 * 4G).
 */
export function resolveScenario(networkId, flowId) {
  const network = NETWORKS.find((n) => n.id === networkId) ?? NETWORKS[0];
  const networkFlows = FLOWS[network.id] ?? {};
  const session = sessionForFlow(flowId) ?? SESSIONS[0];

  const resolvedFlowId = networkFlows[flowId] ? flowId : networkFlows[session.id] ? session.id : 'data';
  const flow = networkFlows[resolvedFlowId];
  const topology = TOPOLOGIES[flow.topologyId ?? network.topologyId];

  const stepIndex = new Map(flow.steps.map((s, i) => [s.id, i]));
  const ambient = flow.ambient.map((a) => ({ ...a, after: stepIndex.get(a.afterId) }));

  return {
    network,
    session,
    flowId: resolvedFlowId,
    topology,
    steps: flow.steps,
    label: flow.label,
    blurb: flow.blurb,
    ambient,
    fallback: resolvedFlowId !== flowId,
  };
}

/* ------------------------------------------------------------------
   Cross-generation analogues.

   A step may declare `analog: { net, flow, id }` (or an array of them) —
   "this is the 5G equivalent of that 4G step". The index below is keyed by
   step *object*, not by (net, flow, id), so that composed flows which share
   step objects with their base (NSA data reuses 4G data's steps verbatim)
   pick up the same analogues for free. Reverse edges are added so the 4G
   step also knows about its 5G counterpart without duplicating the data.
   ------------------------------------------------------------------ */

const ANALOG_INDEX = new Map();

const addAnalog = (step, ref) => {
  const key = `${ref.net}/${ref.flow}/${ref.id}`;
  const list = ANALOG_INDEX.get(step) ?? [];
  if (!list.some((r) => r.key === key)) list.push({ ...ref, key });
  ANALOG_INDEX.set(step, list);
};

for (const [net, flows] of Object.entries(FLOWS)) {
  for (const [flowId, flow] of Object.entries(flows)) {
    for (const step of flow.steps) {
      if (!step.analog) continue;
      for (const ref of [].concat(step.analog)) {
        addAnalog(step, ref);
        const target = FLOWS[ref.net]?.[ref.flow]?.steps.find((s) => s.id === ref.id);
        if (target) addAnalog(target, { net, flow: flowId, id: step.id });
      }
    }
  }
}

/**
 * Analogues of `step` in other networks, resolved to something the UI can
 * render and navigate to. Excludes references back into the current
 * (networkId, flowId) so a step never lists itself.
 */
export function analogsOf(step, { networkId, flowId } = {}) {
  const refs = ANALOG_INDEX.get(step) ?? [];
  const out = [];
  for (const ref of refs) {
    if (ref.net === networkId && ref.flow === flowId) continue;
    const network = NETWORKS.find((n) => n.id === ref.net);
    const flow = FLOWS[ref.net]?.[ref.flow];
    const index = flow?.steps.findIndex((s) => s.id === ref.id) ?? -1;
    if (!network || !flow || index < 0) continue;
    out.push({ ...ref, network, flowLabel: flow.label, index, step: flow.steps[index] });
  }
  // Composed flows share step objects with their base (SA video and EPS
  // fallback reuse SA voice's steps), which would list the same step three
  // times. Keep one entry per distinct step object, preferring the flow that
  // is its session group's default.
  const seen = new Map();
  for (const a of out) {
    const prev = seen.get(a.step);
    const isDefault = sessionForFlow(a.flow)?.id === a.flow;
    if (!prev || (isDefault && sessionForFlow(prev.flow)?.id !== prev.flow)) seen.set(a.step, a);
  }
  return [...seen.values()];
}

/** Step ids that appear in a flow, for URL-parsing and deep links. */
export const stepIndexOf = (steps, id) => steps.findIndex((s) => s.id === id);
