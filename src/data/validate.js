import { NETWORKS } from './networks.js';
import { SESSIONS } from './sessions.js';
import { FLOWS } from './flows/index.js';
import { TOPOLOGIES } from './topologies/index.js';
import { GLOSSARY } from './reference/glossary.js';
import { resolveGlossaryKey } from '../lib/resolveGlossaryKey.js';

/**
 * Dev-only sanity checks across every network/session combination. 15 flows
 * across 3 hand-laid-out topologies is too much surface for eyeball
 * verification alone — this catches typo'd node ids, dangling ambient-flow
 * anchors and duplicate step ids the moment a flow module is edited.
 */
export function validateData() {
  const warnings = [];

  for (const [topologyId, topology] of Object.entries(TOPOLOGIES)) {
    for (const link of topology.links) {
      if (!topology.nodes[link.a]) warnings.push(`Topology "${topologyId}": link references missing node "${link.a}"`);
      if (!topology.nodes[link.b]) warnings.push(`Topology "${topologyId}": link references missing node "${link.b}"`);
      if (!resolveGlossaryKey(link.l, GLOSSARY)) warnings.push(`Topology "${topologyId}": link label "${link.l}" has no glossary entry`);
    }
    for (const [nodeId, node] of Object.entries(topology.nodes)) {
      if (!resolveGlossaryKey(node.t, GLOSSARY)) warnings.push(`Topology "${topologyId}": node "${nodeId}" label "${node.t}" has no glossary entry`);
    }
  }

  for (const network of NETWORKS) {
    const networkFlows = FLOWS[network.id] ?? {};
    for (const session of SESSIONS) {
      const flow = networkFlows[session.id];
      if (!flow) continue;

      const topology = TOPOLOGIES[flow.topologyId ?? network.topologyId];
      const label = `${network.id}/${session.id}`;
      if (!topology) {
        warnings.push(`Flow "${label}": no topology found for id "${flow.topologyId ?? network.topologyId}"`);
        continue;
      }

      const seenIds = new Set();
      for (const step of flow.steps) {
        if (seenIds.has(step.id)) warnings.push(`Flow "${label}": duplicate step id "${step.id}"`);
        seenIds.add(step.id);
        for (const nodeId of step.p) {
          if (!topology.nodes[nodeId]) {
            warnings.push(`Flow "${label}", step "${step.id}": references missing node "${nodeId}" in topology "${topology.id}"`);
          }
        }
      }

      for (const a of flow.ambient ?? []) {
        if (!seenIds.has(a.afterId)) warnings.push(`Flow "${label}": ambient afterId "${a.afterId}" does not match any step id`);
      }
    }
  }

  if (warnings.length) {
    // eslint-disable-next-line no-console
    console.warn(`[validateData] ${warnings.length} issue(s) found:\n` + warnings.map((w) => ` - ${w}`).join('\n'));
  }
}
