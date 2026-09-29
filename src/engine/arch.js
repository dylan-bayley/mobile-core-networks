/**
 * Architecture-lesson engine: pure functions that turn a diagram definition
 * plus a sequence of scenes into per-scene target states, and interpolate
 * between two states for the animation. No React, no DOM — so it can be
 * unit-tested and reused by the validator.
 *
 * Diagram:
 *   { id,
 *     grid: { wide: {cols, rows, w, h}, narrow: {...} },   // viewBox size + cell grid
 *     nodes: { id: { t, s?, gen, g? } },                     // g = glossary key override
 *     layouts: { name: { extends?, wide: {id:[col,row]}, narrow: {...},
 *                        bus?: {wide: row, narrow: row}, bands?: {wide: {control:[r0,r1], user:[r0,r1]}, narrow} } },
 *     links: [{ a, b, l, k, in?: [layout…], curve?, dash?, labelT? }],   // labelT: 0–1, or { wide, narrow }
 *     svc: { nodeId: 'Namf' } }                               // SBI labels for bus stubs
 *
 * Scene:
 *   { id, title, d, cites, layout, show? | add? | remove?,
 *     focus?: { nodes?: [], links?: [label…] }, traffic?: [{ p:[…], k, n?, label? }],
 *     spawn?: { newNode: fromNode } }
 */

export const NODE_SIZE = { wide: { w: 116, h: 50 }, narrow: { w: 96, h: 44 } };
const PAD = { wide: 10, narrow: 8 };

/** Merge a layout with the one it extends, per width mode. */
export function layoutFor(diagram, name) {
  const lay = diagram.layouts[name];
  if (!lay) throw new Error(`Diagram "${diagram.id}": unknown layout "${name}"`);
  if (!lay.extends) return lay;
  const base = layoutFor(diagram, lay.extends);
  const merged = { ...base, ...lay, extends: undefined };
  for (const mode of ['wide', 'narrow']) {
    merged[mode] = { ...(base[mode] ?? {}), ...(lay[mode] ?? {}) };
    for (const id of lay.hide ?? []) delete merged[mode][id];
  }
  return merged;
}

/** Grid cell → viewBox coordinates. */
export function cellToXY(diagram, mode, [col, row]) {
  const g = diagram.grid[mode];
  const pad = PAD[mode];
  const cw = (g.w - pad * 2) / g.cols;
  const ch = (g.h - pad * 2) / g.rows;
  return { x: pad + (col + 0.5) * cw, y: pad + (row + 0.5) * ch };
}

export const rowToY = (diagram, mode, row) => cellToXY(diagram, mode, [0, row]).y;

/**
 * Walks the scenes in order, resolving each one's visible node set (scenes
 * can `show` an explicit list, or `add`/`remove` relative to the previous
 * scene) and which nodes are new in it.
 */
export function resolveScenes(diagram, scenes) {
  let visible = new Set();
  return scenes.map((scene) => {
    const layout = layoutFor(diagram, scene.layout);
    const placed = new Set(Object.keys(layout.wide));
    const prev = visible;
    let next;
    if (scene.show === 'all') next = new Set(placed);
    else if (scene.show) next = new Set(scene.show);
    else next = new Set(prev);
    for (const id of scene.add ?? []) next.add(id);
    for (const id of scene.remove ?? []) next.delete(id);
    // A node the layout doesn't place can't be drawn.
    for (const id of next) if (!placed.has(id)) next.delete(id);
    visible = next;
    const added = [...next].filter((id) => !prev.has(id));
    return { scene, layoutName: scene.layout, layout, visible: next, added };
  });
}

/** Links drawn in a layout: the layout is listed in `in` (or `in` is omitted) and both ends are visible. */
export const linksFor = (diagram, layoutName, visible) =>
  diagram.links.filter((l) => (!l.in || l.in.includes(layoutName)) && visible.has(l.a) && visible.has(l.b));

export const linkKey = (l) => `${l.a}|${l.b}|${l.l}`;

/** Where along a link its label sits (0–1 from `a`); `labelT` may differ per width mode. */
export const labelTFor = (l, mode) => (typeof l.labelT === 'object' ? l.labelT[mode] : l.labelT) ?? 0.5;

/**
 * The drawable target state for one resolved scene at a width mode:
 * node positions/opacity, link opacity, bus and plane bands.
 */
export function targetState(diagram, resolved, mode) {
  const { layout, visible, layoutName } = resolved;
  const nodes = {};
  for (const id of Object.keys(diagram.nodes)) {
    const cell = layout[mode]?.[id];
    const on = visible.has(id);
    nodes[id] = cell ? { ...cellToXY(diagram, mode, cell), o: on ? 1 : 0, s: on ? 1 : 0.7 } : { o: 0, s: 0.7 };
  }
  const links = {};
  for (const l of linksFor(diagram, layoutName, visible)) links[linkKey(l)] = { o: 1, draw: 1 };

  // A bus is a row number (horizontal bar) or { col } (vertical bar, for portrait layouts).
  const busSpec = layout.bus?.[mode];
  let bus = { o: 0 };
  if (typeof busSpec === 'number') bus = { o: 1, y: rowToY(diagram, mode, busSpec) };
  else if (busSpec?.col != null) bus = { o: 1, x: cellToXY(diagram, mode, [busSpec.col, 0]).x, vertical: true };

  const bands = {};
  for (const [name, span] of Object.entries(layout.bands?.[mode] ?? {})) {
    const y0 = rowToY(diagram, mode, span[0]) - cellHeight(diagram, mode) / 2;
    const y1 = rowToY(diagram, mode, span[1]) - cellHeight(diagram, mode) / 2;
    bands[name] = { y: y0, h: y1 - y0, o: 1 };
  }
  return { nodes, links, bus, bands };
}

const cellHeight = (diagram, mode) => {
  const g = diagram.grid[mode];
  return (g.h - PAD[mode] * 2) / g.rows;
};

export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Interpolates from state `a` to state `b` at t∈[0,1]. Nodes appearing in
 * `b` start at their `spawn` source's position when that source was visible
 * in `a` (the "MME splits into AMF + SMF" effect), otherwise in place.
 * Links fade out quickly and draw in during the second half, after the nodes
 * they join have arrived.
 */
export function interpolate(a, b, t, spawn = {}) {
  const e = easeInOut(Math.min(1, Math.max(0, t)));
  const nodes = {};
  for (const [id, nb] of Object.entries(b.nodes)) {
    const na = a.nodes[id] ?? { o: 0, s: 0.7 };
    let from = na;
    if (na.o < 0.05 && nb.o > 0) {
      const src = spawn[id] && a.nodes[spawn[id]];
      from = src && src.o > 0.5 && src.x != null ? { ...src, o: 0, s: 0.85 } : { ...nb, o: 0, s: 0.7 };
      if (from.x == null) from = { ...nb, o: 0, s: 0.7 };
    }
    const x = from.x ?? nb.x;
    const y = from.y ?? nb.y;
    const tx = nb.x ?? x;
    const ty = nb.y ?? y;
    nodes[id] = {
      x: x == null ? undefined : lerp(x, tx, e),
      y: y == null ? undefined : lerp(y, ty, e),
      o: lerp(from.o, nb.o, e),
      s: lerp(from.s ?? 1, nb.s ?? 1, e),
    };
  }

  const links = {};
  const keys = new Set([...Object.keys(a.links), ...Object.keys(b.links)]);
  for (const k of keys) {
    const inA = !!a.links[k];
    const inB = !!b.links[k];
    if (inA && inB) links[k] = { o: 1, draw: 1 };
    else if (inB) links[k] = { o: 1, draw: Math.max(0, Math.min(1, (t - 0.45) / 0.5)) };
    else links[k] = { o: Math.max(0, 1 - t * 3), draw: 1 };
  }

  const src = b.bus.o > 0 ? b.bus : a.bus;
  const bus = { o: lerp(a.bus.o, b.bus.o, e), y: src.y, x: src.x, vertical: src.vertical };
  if (a.bus.y != null && b.bus.y != null) bus.y = lerp(a.bus.y, b.bus.y, e);
  if (a.bus.x != null && b.bus.x != null) bus.x = lerp(a.bus.x, b.bus.x, e);

  const bands = {};
  for (const name of new Set([...Object.keys(a.bands), ...Object.keys(b.bands)])) {
    const ba = a.bands[name];
    const bb = b.bands[name];
    if (ba && bb) bands[name] = { y: lerp(ba.y, bb.y, e), h: lerp(ba.h, bb.h, e), o: 1 };
    else if (bb) bands[name] = { ...bb, o: e };
    else bands[name] = { ...ba, o: 1 - e };
  }
  return { nodes, links, bus, bands };
}

/** Straight-line or quadratic point along a list of positioned points (by arc length). */
export function pointAlong(points, t) {
  if (points.length === 1) return points[0];
  const segs = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y) || 0.001;
    segs.push(len);
    total += len;
  }
  let d = Math.min(Math.max(t, 0), 0.999999) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]) {
      const f = d / segs[i];
      const p = points[i];
      const q = points[i + 1];
      return { x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f };
    }
    d -= segs[i];
  }
  return points[points.length - 1];
}
