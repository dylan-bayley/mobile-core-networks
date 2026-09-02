import { NETWORKS } from './networks.js';
import { SESSIONS } from './sessions.js';
import { FLOWS } from './flows/index.js';
import { TOPOLOGIES } from './topologies/index.js';
import { GLOSSARY } from './reference/glossary.js';
import { resolveGlossaryKey } from '../lib/resolveGlossaryKey.js';
import { makeGeometry } from '../engine/geometry.js';

const LABEL_CHAR_W = 6;
const LABEL_H = 10;

/** Approximate bounding box of a link label as drawn by TopologyDiagram (centred text, baseline at y-5). */
const labelBox = (geo, l) => {
  const p = geo.labelPos(l);
  const w = l.l.length * LABEL_CHAR_W;
  return { x0: p.x - w / 2, x1: p.x + w / 2, y0: p.y - 5 - LABEL_H, y1: p.y - 5 };
};

const nodeBox = (n, pad = 0) => ({
  x0: n.cx - n.w / 2 - pad,
  x1: n.cx + n.w / 2 + pad,
  y0: n.cy - n.h / 2 - pad,
  y1: n.cy + n.h / 2 + pad,
});

const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/**
 * Sanity checks across every network/flow combination, returned as a list
 * of human-readable warnings (empty when everything is consistent). 20+
 * flows across 4 hand-laid-out topologies is too much surface for eyeball
 * verification alone — this catches typo'd node ids, dangling anchors,
 * duplicate step ids, unresolvable analogues and link labels drawn on top
 * of a node or each other, the moment a data module is edited.
 *
 * Pure (no console, no DOM) so it can run as a unit test as well as in the
 * dev build.
 */
export function collectWarnings() {
  const warnings = [];

  for (const [topologyId, topology] of Object.entries(TOPOLOGIES)) {
    const geo = makeGeometry(topology);
    for (const link of topology.links) {
      if (!topology.nodes[link.a]) warnings.push(`Topology "${topologyId}": link references missing node "${link.a}"`);
      if (!topology.nodes[link.b]) warnings.push(`Topology "${topologyId}": link references missing node "${link.b}"`);
      if (!resolveGlossaryKey(link.l, GLOSSARY)) warnings.push(`Topology "${topologyId}": link label "${link.l}" has no glossary entry`);
    }
    for (const [nodeId, node] of Object.entries(topology.nodes)) {
      if (!resolveGlossaryKey(node.t, GLOSSARY)) warnings.push(`Topology "${topologyId}": node "${nodeId}" label "${node.t}" has no glossary entry`);
    }

    const boxes = topology.links.filter((l) => topology.nodes[l.a] && topology.nodes[l.b]).map((l) => ({ l, box: labelBox(geo, l) }));
    for (const { l, box } of boxes) {
      for (const [nodeId, node] of Object.entries(topology.nodes)) {
        if (overlaps(box, nodeBox(node, 2))) {
          warnings.push(`Topology "${topologyId}": link label "${l.l}" (${l.a}–${l.b}) overlaps node "${nodeId}" — set labelT/lx/ly on the link`);
        }
      }
    }
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        if (overlaps(boxes[i].box, boxes[j].box)) {
          warnings.push(`Topology "${topologyId}": link labels "${boxes[i].l.l}" and "${boxes[j].l.l}" overlap — set labelT/lx/ly on one of them`);
        }
      }
    }
  }

  const sessionFlowIds = new Set();
  for (const s of SESSIONS) {
    sessionFlowIds.add(s.id);
    for (const v of s.variants ?? []) sessionFlowIds.add(v.id);
  }

  for (const network of NETWORKS) {
    const networkFlows = FLOWS[network.id] ?? {};
    if (!networkFlows.data) warnings.push(`Network "${network.id}": has no "data" flow to fall back to`);

    for (const [flowId, flow] of Object.entries(networkFlows)) {
      const label = `${network.id}/${flowId}`;
      if (!sessionFlowIds.has(flowId)) warnings.push(`Flow "${label}": flow id is not a session or session variant in sessions.js`);

      const topology = TOPOLOGIES[flow.topologyId ?? network.topologyId];
      if (!topology) {
        warnings.push(`Flow "${label}": no topology found for id "${flow.topologyId ?? network.topologyId}"`);
        continue;
      }
      const geo = makeGeometry(topology);

      const seenIds = new Set();
      for (const step of flow.steps) {
        if (seenIds.has(step.id)) warnings.push(`Flow "${label}": duplicate step id "${step.id}"`);
        seenIds.add(step.id);
        if (!Array.isArray(step.p) || step.p.length < 2) warnings.push(`Flow "${label}", step "${step.id}": path needs at least two nodes`);
        for (const nodeId of step.p ?? []) {
          if (!topology.nodes[nodeId]) {
            warnings.push(`Flow "${label}", step "${step.id}": references missing node "${nodeId}" in topology "${topology.id}"`);
          }
        }
        for (let i = 0; i + 1 < (step.p ?? []).length; i++) {
          if (topology.nodes[step.p[i]] && topology.nodes[step.p[i + 1]] && !geo.linkFor(step.p[i], step.p[i + 1])) {
            warnings.push(`Flow "${label}", step "${step.id}": no link between "${step.p[i]}" and "${step.p[i + 1]}" in topology "${topology.id}"`);
          }
        }
        for (const ref of [].concat(step.analog ?? [])) {
          const target = FLOWS[ref.net]?.[ref.flow]?.steps.find((s) => s.id === ref.id);
          if (!target) warnings.push(`Flow "${label}", step "${step.id}": analog ${ref.net}/${ref.flow}/${ref.id} does not exist`);
        }
      }

      for (const a of flow.ambient ?? []) {
        if (!seenIds.has(a.afterId)) warnings.push(`Flow "${label}": ambient afterId "${a.afterId}" does not match any step id`);
      }
    }
  }

  return warnings;
}

/** Dev-build entry point: logs any warnings to the console. */
export function validateData() {
  const warnings = collectWarnings();
  if (warnings.length) {
    // eslint-disable-next-line no-console
    console.warn(`[validateData] ${warnings.length} issue(s) found:\n` + warnings.map((w) => ` - ${w}`).join('\n'));
  }
  return warnings;
}
