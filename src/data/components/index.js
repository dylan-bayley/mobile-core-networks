import { EPC_COMPONENTS } from './epc.js';
import { FIVEGC_COMPONENTS } from './fivegc.js';
import { IMS_COMPONENTS } from './ims.js';
import { VIGNETTES } from './vignettes.js';
import { FLOWS, NETWORKS } from '../index.js';

export { VIGNETTES };

const SERVICES_CITE = { src: 'ts23502', clause: '5.2' };

/** Every component with a service list cites where the services are defined. */
const withServiceCite = (c) =>
  c.services?.length && !c.sources.some((s) => s.src === 'ts23502' && s.clause === '5.2') ? { ...c, sources: [...c.sources, SERVICES_CITE] } : c;

export const COMPONENTS = [...EPC_COMPONENTS, ...FIVEGC_COMPONENTS, ...IMS_COMPONENTS].map(withServiceCite);

const BY_ID = new Map(COMPONENTS.map((c) => [c.id, c]));
export const componentById = (id) => BY_ID.get(id) ?? null;

/** Glossary key → component id, for the "read the full page" link in the popover. */
const BY_LABEL = new Map(COMPONENTS.map((c) => [c.label, c.id]));
export const componentForTerm = (key) => BY_LABEL.get(key) ?? null;

/**
 * Where a component appears in the Flows explorer: for each network it's
 * mapped into (`inFlows: { net: topologyNodeId }`), the flows whose steps
 * involve that node, with the first such step to jump to and a count.
 */
export function flowAppearances(component) {
  const out = [];
  for (const [net, nodeId] of Object.entries(component.inFlows ?? {})) {
    const network = NETWORKS.find((n) => n.id === net);
    for (const [flowId, flow] of Object.entries(FLOWS[net] ?? {})) {
      const steps = flow.steps.filter((s) => s.p.includes(nodeId));
      if (!steps.length) continue;
      out.push({ net, network, flowId, flowLabel: flow.label, first: steps[0], count: steps.length });
    }
  }
  return out;
}
