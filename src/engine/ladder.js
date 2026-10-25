/**
 * Ladder-lesson engine: pure functions that place a ladder (sequence)
 * diagram and work out, scene by scene, which messages are drawn. No React,
 * no DOM — so it can be unit-tested and reused by the validator.
 *
 * Ladder:
 *   { proto?: 'ims',                                  // K colour for requests and responses
 *     actors: [{ id, t, s?, g? }],                    // left to right; g = glossary key override
 *     rows: [{ id, f, t, m, k: 'req' | 'res' | 'media' | 'diameter', both? }
 *          | { id, note, a, b }] }                     // a note box spanning actors a..b
 *
 * Scene:
 *   { id, ladder, upto?: rowId, focus?: [rowId…], panel?, highlight? }
 *   Rows are drawn from the top down to `upto` (all of them when it's left
 *   out); `focus` names the rows the scene is about.
 */

export const ROW_H = 34;
export const HEAD = 50;
export const FOOT = 14;
export const PAD = 16; // space either side of the outer lifelines, beyond half a box
export const ACTOR_W = 92; // actor box width at the smallest
export const MIN_LANE = 110; // narrowest gap between two lifelines
export const CHAR_W = 7.3; // advance of a 12px monospace character
export const LABEL_PAD = 18;

/** The protocol colour (a theme.js `K` key) of a row: requests and responses take the ladder's protocol. */
export const rowKind = (row, proto = 'ims') => (row.k === 'media' ? 'media' : row.k === 'diameter' ? 'diameter' : proto);

const actorBoxW = (a) => Math.max(ACTOR_W, a.t.length * 8 + 20);

/** The narrowest lane spacing at which every message label fits between the lifelines it spans. */
export function minLaneFor(ladder) {
  const index = new Map(ladder.actors.map((a, i) => [a.id, i]));
  let lane = MIN_LANE;
  for (const r of ladder.rows) {
    if (r.note) continue;
    const span = Math.abs(index.get(r.t) - index.get(r.f));
    if (!span) continue;
    lane = Math.max(lane, (r.m.length * CHAR_W + LABEL_PAD) / span);
  }
  return Math.ceil(lane);
}

/**
 * Places a ladder in a drawing `width` px wide (1 viewBox unit = 1 px, so
 * text keeps its size). When the lanes can't fit, the drawing is wider than
 * `width` and its container scrolls sideways.
 */
export function ladderLayout(ladder, width) {
  const n = ladder.actors.length;
  const edge = Math.max(...ladder.actors.map(actorBoxW)) / 2 + PAD;
  const minLane = minLaneFor(ladder);
  const lane = n > 1 ? Math.max(minLane, (width - 2 * edge) / (n - 1)) : 0;
  const w = n > 1 ? Math.round(2 * edge + lane * (n - 1)) : Math.max(width, 2 * edge);
  const h = HEAD + ladder.rows.length * ROW_H + FOOT;
  const x = Object.fromEntries(ladder.actors.map((a, i) => [a.id, n > 1 ? edge + i * lane : w / 2]));
  const actors = ladder.actors.map((a) => ({ ...a, x: x[a.id], w: actorBoxW(a) }));
  const rows = ladder.rows.map((r, i) => {
    const y = HEAD + i * ROW_H + ROW_H * 0.62;
    if (r.note) {
      const [l, rr] = [x[r.a], x[r.b]].sort((p, q) => p - q);
      const nw = Math.min(w - 8, Math.max(rr - l + 80, r.note.length * 6.6 + 24));
      const nx = Math.max(4, Math.min(w - 4 - nw, (l + rr) / 2 - nw / 2));
      return { ...r, y, note: r.note, box: { x: nx, w: nw } };
    }
    return { ...r, y, x1: x[r.f], x2: x[r.t], dir: x[r.t] >= x[r.f] ? 1 : -1 };
  });
  return { w, h, lane, actors, rows };
}

/**
 * Resolves a lesson's scenes against its ladders: for each scene, the rows
 * drawn, the focus rows and the rows that are new since the previous scene
 * (the ones to animate). Moving to a different ladder animates its focus
 * rows, or every drawn row when it names none. Throws on an unknown ladder
 * or row, so the validator can report it.
 */
export function resolveLadderScenes(ladders, scenes) {
  let prev = null;
  return scenes.map((scene) => {
    const ladder = ladders[scene.ladder];
    if (!ladder) throw new Error(`scene "${scene.id}": unknown ladder "${scene.ladder}"`);
    const ids = ladder.rows.map((r) => r.id);
    const end = scene.upto == null ? ids.length - 1 : ids.indexOf(scene.upto);
    if (end < 0) throw new Error(`scene "${scene.id}": ladder "${scene.ladder}" has no row "${scene.upto}"`);
    const visible = new Set(ids.slice(0, end + 1));
    const focus = scene.focus ?? [];
    for (const id of focus) if (!visible.has(id)) throw new Error(`scene "${scene.id}": focus row "${id}" isn't drawn`);
    let fresh;
    if (prev && prev.ladderId === scene.ladder) fresh = ids.filter((id) => visible.has(id) && !prev.visible.has(id));
    else fresh = focus.length ? [...focus] : [...visible];
    const r = { scene, ladderId: scene.ladder, visible, focus: new Set(focus), fresh };
    prev = r;
    return r;
  });
}
