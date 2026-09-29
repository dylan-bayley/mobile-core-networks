import { LESSONS } from './arch/index.js';
import { COMPONENTS, VIGNETTES, componentById } from './components/index.js';
import { SOURCES } from './reference/sources.js';
import { GLOSSARY } from './reference/glossary.js';
import { TOPOLOGIES } from './topologies/index.js';
import { NETWORKS, FLOWS } from './index.js';
import { resolveGlossaryKey } from '../lib/resolveGlossaryKey.js';
import { layoutFor, resolveScenes, linksFor, cellToXY, NODE_SIZE } from '../engine/arch.js';

const checkCites = (where, cites, warnings) => {
  if (!cites?.length) warnings.push(`${where}: has no sources`);
  for (const c of cites ?? []) if (!SOURCES[c.src]) warnings.push(`${where}: unknown source "${c.src}"`);
};

const nodeTerm = (n) => (n.g && GLOSSARY[n.g] ? n.g : resolveGlossaryKey(n.t, GLOSSARY));

/** Checks one diagram's layouts, links and one sequence of scenes against it. */
function checkScenes(where, diagram, scenes, warnings) {
  let resolved;
  try {
    resolved = resolveScenes(diagram, scenes);
  } catch (e) {
    warnings.push(`${where}: ${e.message}`);
    return;
  }
  resolved.forEach((r) => {
    const s = r.scene;
    const at = `${where}, scene "${s.id}"`;
    checkCites(at, s.cites, warnings);
    if (!s.title || !s.d) warnings.push(`${at}: needs a title and a caption`);
    if (!r.visible.size) warnings.push(`${at}: shows no nodes`);
    for (const id of [...(Array.isArray(s.show) ? s.show : []), ...(s.add ?? [])]) {
      if (!diagram.nodes[id]) warnings.push(`${at}: unknown node "${id}"`);
      else if (!r.layout.wide[id]) warnings.push(`${at}: node "${id}" isn't placed in layout "${r.layoutName}"`);
    }
    const drawn = linksFor(diagram, r.layoutName, r.visible);
    for (const label of s.focus?.links ?? []) {
      if (!drawn.some((l) => l.l === label)) warnings.push(`${at}: focus link "${label}" isn't drawn in this scene`);
    }
    for (const tr of s.traffic ?? []) {
      for (const ref of tr.p) {
        const id = ref.replace(/^@/, '');
        if (!r.visible.has(id)) warnings.push(`${at}: traffic passes "${id}", which isn't shown`);
      }
      if (tr.p.some((x) => x.startsWith('@')) && r.layout.bus == null) warnings.push(`${at}: traffic uses the bus but layout "${r.layoutName}" has none`);
    }
    for (const [to, from] of Object.entries(s.spawn ?? {})) {
      if (!diagram.nodes[to] || !diagram.nodes[from]) warnings.push(`${at}: spawn ${from} → ${to} names an unknown node`);
    }
  });
}

/**
 * Consistency checks for the Learn and Components content: every scene,
 * component and vignette cites a known source; diagrams place every node in
 * both width modes; scenes only reference nodes and links that exist; and
 * component cross-links (analogues, diagrams, flow nodes) resolve.
 */
export function collectLearnWarnings() {
  const warnings = [];

  for (const lesson of Object.values(LESSONS)) {
    const { diagram } = lesson;
    const where = `Lesson "${lesson.id}"`;
    for (const [name, lay] of Object.entries(diagram.layouts)) {
      let full;
      try {
        full = layoutFor(diagram, name);
      } catch (e) {
        warnings.push(`${where}: ${e.message}`);
        continue;
      }
      if (lay.extends && !diagram.layouts[lay.extends]) warnings.push(`${where}: layout "${name}" extends unknown "${lay.extends}"`);
      const wide = Object.keys(full.wide ?? {});
      const narrow = Object.keys(full.narrow ?? {});
      for (const id of wide) if (!narrow.includes(id)) warnings.push(`${where}: layout "${name}" places "${id}" wide but not narrow`);
      for (const id of narrow) if (!wide.includes(id)) warnings.push(`${where}: layout "${name}" places "${id}" narrow but not wide`);
      for (const id of wide) if (!diagram.nodes[id]) warnings.push(`${where}: layout "${name}" places unknown node "${id}"`);
      // Every node box must sit fully inside the viewBox.
      for (const mode of ['wide', 'narrow']) {
        const g = diagram.grid[mode];
        const { w, h } = NODE_SIZE[mode];
        for (const [id, cell] of Object.entries(full[mode] ?? {})) {
          const { x, y } = cellToXY(diagram, mode, cell);
          if (x - w / 2 < 0 || x + w / 2 > g.w || y - h / 2 < 0 || y + h / 2 > g.h) {
            warnings.push(`${where}: layout "${name}" (${mode}) puts "${id}" at [${cell}], partly outside the viewBox`);
          }
        }
      }
    }
    for (const l of diagram.links) {
      if (!diagram.nodes[l.a] || !diagram.nodes[l.b]) warnings.push(`${where}: link ${l.l} joins an unknown node`);
      if (!resolveGlossaryKey(l.l, GLOSSARY)) warnings.push(`${where}: link label "${l.l}" has no glossary entry`);
      for (const name of l.in ?? []) if (!diagram.layouts[name]) warnings.push(`${where}: link ${l.l} names unknown layout "${name}"`);
    }
    for (const [id, n] of Object.entries(diagram.nodes)) {
      if (!nodeTerm(n)) warnings.push(`${where}: node "${id}" (${n.t}) has no glossary entry`);
    }
    checkScenes(where, diagram, lesson.scenes, warnings);
    for (const [i, q] of lesson.check.entries()) {
      if (q.answer < 0 || q.answer >= q.options.length) warnings.push(`${where}: quick-check question ${i + 1} has an out-of-range answer`);
    }
    if (lesson.compare) checkCites(`${where} comparison table`, lesson.compare.cites, warnings);
    if (lesson.options) checkCites(`${where} options table`, lesson.options.cites, warnings);
  }

  const vignetteDiagram = LESSONS['5gc'].diagram;
  for (const [id, v] of Object.entries(VIGNETTES)) {
    const scenes = v.steps.map((s) => ({ ...s, layout: 'sba', show: v.show }));
    checkScenes(`Vignette "${id}"`, vignetteDiagram, scenes, warnings);
  }

  const ids = new Set();
  for (const c of COMPONENTS) {
    const where = `Component "${c.id}"`;
    if (ids.has(c.id)) warnings.push(`${where}: duplicate id`);
    ids.add(c.id);
    checkCites(where, c.sources, warnings);
    if (!GLOSSARY[c.label]) warnings.push(`${where}: label "${c.label}" has no glossary entry`);
    for (const a of c.analog?.ids ?? []) if (!componentById(a)) warnings.push(`${where}: analogue "${a}" is not a component`);
    if (c.vignette && !VIGNETTES[c.vignette]) warnings.push(`${where}: unknown vignette "${c.vignette}"`);
    if (c.diagram) {
      const lesson = LESSONS[c.diagram.lesson];
      const i = lesson ? lesson.scenes.findIndex((s) => s.id === c.diagram.scene) : -1;
      if (i < 0) warnings.push(`${where}: diagram scene ${c.diagram.lesson}/${c.diagram.scene} not found`);
      else if (!lesson.resolved[i].visible.has(c.diagram.node)) warnings.push(`${where}: node "${c.diagram.node}" isn't shown in ${c.diagram.lesson}/${c.diagram.scene}`);
    }
    for (const [net, nodeId] of Object.entries(c.inFlows ?? {})) {
      const network = NETWORKS.find((n) => n.id === net);
      if (!network) {
        warnings.push(`${where}: unknown network "${net}"`);
        continue;
      }
      const topologies = new Set(Object.values(FLOWS[net] ?? {}).map((f) => f.topologyId ?? network.topologyId));
      if (![...topologies].some((t) => TOPOLOGIES[t]?.nodes[nodeId])) warnings.push(`${where}: node "${nodeId}" not in any ${net} topology`);
    }
  }

  return warnings;
}
