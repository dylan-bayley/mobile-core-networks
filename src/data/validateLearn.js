import { LESSONS } from './arch/index.js';
import { COMPONENTS, VIGNETTES, componentById } from './components/index.js';
import { SOURCES } from './reference/sources.js';
import { GLOSSARY } from './reference/glossary.js';
import { TOPOLOGIES } from './topologies/index.js';
import { NETWORKS, FLOWS, sessionForFlow } from './index.js';
import { resolveGlossaryKey } from '../lib/resolveGlossaryKey.js';
import { parseHash } from '../lib/route.js';
import { K } from '../theme.js';
import { layoutFor, resolveScenes, linksFor, cellToXY, NODE_SIZE, nodeBoxWidth } from '../engine/arch.js';

const checkCites = (where, cites, warnings) => {
  if (!cites?.length) warnings.push(`${where}: has no sources`);
  for (const c of cites ?? []) if (!SOURCES[c.src]) warnings.push(`${where}: unknown source "${c.src}"`);
};

const nodeTerm = (n) => (n.g && GLOSSARY[n.g] ? n.g : resolveGlossaryKey(n.t, GLOSSARY));

/**
 * Checks one sequence of scenes against a diagram. An unknown layout name is
 * reported and the scene is checked against the previous scene's layout
 * instead, so one typo doesn't hide every later problem.
 */
export function checkScenes(where, diagram, scenes, warnings) {
  const ids = new Set();
  let lastLayout = Object.keys(diagram.layouts)[0];
  const usable = scenes.map((s) => {
    if (ids.has(s.id)) warnings.push(`${where}: duplicate scene id "${s.id}" (breaks ?scene= links)`);
    ids.add(s.id);
    if (diagram.layouts[s.layout]) {
      lastLayout = s.layout;
      return s;
    }
    warnings.push(`${where}, scene "${s.id}": unknown layout "${s.layout}"`);
    return { ...s, layout: lastLayout };
  });

  let resolved;
  try {
    resolved = resolveScenes(diagram, usable);
  } catch (e) {
    warnings.push(`${where}: ${e.message}`);
    return;
  }
  resolved.forEach((r, i) => {
    const s = r.scene;
    const at = `${where}, scene "${s.id}"`;
    checkCites(at, s.cites, warnings);
    if (!s.title || !s.d) warnings.push(`${at}: needs a title and a caption`);
    if (!r.visible.size) warnings.push(`${at}: shows no nodes`);
    if (s.k && !K[s.k]) warnings.push(`${at}: unknown colour kind "${s.k}"`);
    for (const id of [...(Array.isArray(s.show) ? s.show : []), ...(s.add ?? [])]) {
      if (!diagram.nodes[id]) warnings.push(`${at}: unknown node "${id}"`);
      else if (!r.layout.wide[id]) warnings.push(`${at}: node "${id}" isn't placed in layout "${r.layoutName}"`);
    }
    for (const id of s.remove ?? []) if (!diagram.nodes[id]) warnings.push(`${at}: removes unknown node "${id}"`);
    const drawn = linksFor(diagram, r.layoutName, r.visible);
    for (const label of s.focus?.links ?? []) {
      if (!drawn.some((l) => l.l === label)) warnings.push(`${at}: focus link "${label}" isn't drawn in this scene`);
    }
    for (const id of s.focus?.nodes ?? []) {
      if (!r.visible.has(id)) warnings.push(`${at}: focus node "${id}" isn't shown in this scene`);
    }
    for (const tr of s.traffic ?? []) {
      if (!K[tr.k]) warnings.push(`${at}: traffic has unknown colour kind "${tr.k}"`);
      for (const ref of tr.p) {
        const id = ref.replace(/^@/, '');
        if (!r.visible.has(id)) warnings.push(`${at}: traffic passes "${id}", which isn't shown`);
      }
      if (tr.p.some((x) => x.startsWith('@')) && r.layout.bus == null) warnings.push(`${at}: traffic uses the bus but layout "${r.layoutName}" has none`);
      // Each hop between two drawn nodes must follow a drawn link. Hops to
      // or along the service bus ('@node') don't need one.
      for (let h = 0; h < tr.p.length - 1; h++) {
        const [a, b] = [tr.p[h], tr.p[h + 1]];
        if (a.startsWith('@') || b.startsWith('@')) continue;
        if (!drawn.some((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a))) {
          warnings.push(`${at}: traffic hop ${a} → ${b} has no drawn link`);
        }
      }
    }
    const before = i > 0 ? resolved[i - 1].visible : new Set();
    for (const [to, from] of Object.entries(s.spawn ?? {})) {
      if (!diagram.nodes[to] || !diagram.nodes[from]) warnings.push(`${at}: spawn ${from} → ${to} names an unknown node`);
      else if (!before.has(from)) warnings.push(`${at}: "${to}" spawns from "${from}", which the previous scene doesn't show`);
    }
  });
}

/** Does an in-app link (`#/learn/…`, `#/components/…`, `#/flows?…`, `#/glossary/…`) lead somewhere real? */
export function hrefProblem(href) {
  if (!href.startsWith('#/')) return null; // external links aren't checked
  const { segments, query } = parseHash(href);
  const [section, id] = segments;
  if (!section) return null;
  if (section === 'learn') {
    const lesson = LESSONS[id];
    if (!lesson) return `unknown lesson "${id}"`;
    const scene = query.get('scene');
    if (scene && !lesson.scenes.some((s) => s.id === scene)) return `lesson "${id}" has no scene "${scene}"`;
    return null;
  }
  if (section === 'components') return id && !componentById(id) ? `unknown component "${id}"` : null;
  if (section === 'glossary') return id && !GLOSSARY[id] ? `unknown glossary term "${id}"` : null;
  if (section === 'flows') {
    const net = query.get('net');
    if (net && !NETWORKS.some((n) => n.id === net)) return `unknown network "${net}"`;
    const flow = query.get('variant') ?? query.get('session');
    if (flow && !sessionForFlow(flow)) return `unknown flow "${flow}"`;
    if (net && flow && !FLOWS[net]?.[flow]) return `network "${net}" has no "${flow}" flow`;
    return null;
  }
  return `unknown section "${section}"`;
}

/** Checks a lesson's quick-check questions: answers in range, a reason given, nothing duplicated (they're React keys). */
export function checkQuickCheck(where, check, warnings) {
  const prompts = new Set();
  for (const [i, q] of check.entries()) {
    const at = `${where}: quick-check question ${i + 1}`;
    if (q.answer < 0 || q.answer >= q.options.length) warnings.push(`${at} has an out-of-range answer`);
    if (!q.why) warnings.push(`${at} has no explanation ("why")`);
    if (new Set(q.options).size !== q.options.length) warnings.push(`${at} repeats an option`);
    if (prompts.has(q.q)) warnings.push(`${at} repeats an earlier question`);
    prompts.add(q.q);
  }
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
      // Every node box must sit fully inside the viewBox, at its drawn
      // width (long titles widen a box; the smallest title font is assumed).
      for (const mode of ['wide', 'narrow']) {
        const g = diagram.grid[mode];
        const { h } = NODE_SIZE[mode];
        for (const [id, cell] of Object.entries(full[mode] ?? {})) {
          if (!diagram.nodes[id]) continue;
          const w = nodeBoxWidth(diagram.nodes[id], mode);
          const { x, y } = cellToXY(diagram, mode, cell);
          if (x - w / 2 < 0 || x + w / 2 > g.w || y - h / 2 < 0 || y + h / 2 > g.h) {
            warnings.push(`${where}: layout "${name}" (${mode}) puts "${id}" at [${cell}], partly outside the viewBox`);
          }
        }
      }
    }
    for (const l of diagram.links) {
      if (!diagram.nodes[l.a] || !diagram.nodes[l.b]) warnings.push(`${where}: link ${l.l} joins an unknown node`);
      if (!K[l.k]) warnings.push(`${where}: link ${l.l} has unknown colour kind "${l.k}"`);
      if (!resolveGlossaryKey(l.l, GLOSSARY)) warnings.push(`${where}: link label "${l.l}" has no glossary entry`);
      for (const name of l.in ?? []) if (!diagram.layouts[name]) warnings.push(`${where}: link ${l.l} names unknown layout "${name}"`);
    }
    for (const [id, n] of Object.entries(diagram.nodes)) {
      if (!nodeTerm(n)) warnings.push(`${where}: node "${id}" (${n.t}) has no glossary entry`);
    }
    checkScenes(where, diagram, lesson.scenes, warnings);
    checkQuickCheck(where, lesson.check, warnings);
    for (const l of lesson.links ?? []) {
      const problem = hrefProblem(l.href);
      if (problem) warnings.push(`${where}: link "${l.label}" → ${l.href}: ${problem}`);
    }
    if (lesson.compare) {
      checkCites(`${where} comparison table`, lesson.compare.cites, warnings);
      for (const id of lesson.compare.scenes ?? []) if (!lesson.scenes.some((s) => s.id === id)) warnings.push(`${where}: comparison names unknown scene "${id}"`);
      if (lesson.compare.scenes?.length !== 2 || lesson.compare.labels?.length !== 2) warnings.push(`${where}: comparison needs two scenes and two labels`);
    }
    if (lesson.options) checkCites(`${where} options table`, lesson.options.cites, warnings);
  }

  for (const [id, v] of Object.entries(VIGNETTES)) {
    const lesson = LESSONS[v.lesson ?? '5gc'];
    if (!lesson) {
      warnings.push(`Vignette "${id}": unknown lesson "${v.lesson}"`);
      continue;
    }
    const scenes = v.steps.map((s) => ({ ...s, layout: v.layout ?? 'sba', show: v.show }));
    checkScenes(`Vignette "${id}"`, lesson.diagram, scenes, warnings);
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
