import { NETWORKS } from './networks.js';
import { SESSIONS } from './sessions.js';
import { FLOWS } from './flows/index.js';
import { TOPOLOGIES } from './topologies/index.js';

export { NETWORKS, SESSIONS };

/**
 * Resolves a (networkId, sessionId) pair to the topology and step data the
 * diagram should render. Falls back to that network's data session if the
 * combination isn't modelled yet (e.g. mid-build-out) so the app never
 * white-screens on an unimplemented pairing.
 */
export function resolveScenario(networkId, sessionId) {
  const network = NETWORKS.find((n) => n.id === networkId) ?? NETWORKS[0];
  const session = SESSIONS.find((s) => s.id === sessionId) ?? SESSIONS[0];

  const networkFlows = FLOWS[network.id] ?? {};
  const flow = networkFlows[session.id] ?? networkFlows.data;
  const fallback = !networkFlows[session.id];

  const topology = TOPOLOGIES[flow.topologyId ?? network.topologyId];

  const stepIndex = new Map(flow.steps.map((s, i) => [s.id, i]));
  const ambient = flow.ambient.map((a) => ({ ...a, after: stepIndex.get(a.afterId) }));

  return {
    network,
    session,
    topology,
    steps: flow.steps,
    label: flow.label,
    blurb: flow.blurb,
    ambient,
    fallback,
  };
}
