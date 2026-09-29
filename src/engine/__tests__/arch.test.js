import { describe, expect, it } from 'vitest';
import { resolveScenes, targetState, interpolate, layoutFor, pointAlong, easeInOut } from '../arch.js';

const diagram = {
  id: 't',
  grid: { wide: { cols: 4, rows: 2, w: 420, h: 220 }, narrow: { cols: 2, rows: 4, w: 220, h: 420 } },
  nodes: { a: { t: 'A' }, b: { t: 'B' }, c: { t: 'C' } },
  layouts: {
    one: { wide: { a: [0, 0], b: [3, 0] }, narrow: { a: [0, 0], b: [1, 3] }, bus: { wide: 1, narrow: { col: 0.5 } } },
    two: { extends: 'one', hide: ['b'], wide: { c: [3, 1] }, narrow: { c: [1, 1] } },
  },
  links: [{ a: 'a', b: 'b', l: 'X', k: 'control' }],
};

describe('architecture engine', () => {
  it('merges extended layouts and drops hidden nodes', () => {
    const two = layoutFor(diagram, 'two');
    expect(Object.keys(two.wide).sort()).toEqual(['a', 'c']);
    expect(two.bus).toEqual(diagram.layouts.one.bus);
  });

  it('resolves show / add / remove cumulatively and reports new nodes', () => {
    const r = resolveScenes(diagram, [
      { id: '1', layout: 'one', show: ['a'] },
      { id: '2', layout: 'one', add: ['b'] },
      { id: '3', layout: 'two', add: ['c'] },
    ]);
    expect([...r[1].visible].sort()).toEqual(['a', 'b']);
    expect(r[1].added).toEqual(['b']);
    // b isn't placed in layout two, so it drops out
    expect([...r[2].visible].sort()).toEqual(['a', 'c']);
  });

  it('computes a horizontal bus on wide layouts and a vertical one on narrow', () => {
    const [r] = resolveScenes(diagram, [{ id: '1', layout: 'one', show: 'all' }]);
    expect(targetState(diagram, r, 'wide').bus.y).toBeGreaterThan(0);
    const narrow = targetState(diagram, r, 'narrow').bus;
    expect(narrow.vertical).toBe(true);
    expect(narrow.x).toBeGreaterThan(0);
  });

  it('spawns a new node from its source position and ends at its target', () => {
    const r = resolveScenes(diagram, [
      { id: '1', layout: 'one', show: ['a', 'b'] },
      { id: '2', layout: 'two', show: ['a', 'c'] },
    ]);
    const s1 = targetState(diagram, r[0], 'wide');
    const s2 = targetState(diagram, r[1], 'wide');
    const start = interpolate(s1, s2, 0, { c: 'b' });
    expect(start.nodes.c.x).toBeCloseTo(s1.nodes.b.x);
    expect(start.nodes.c.o).toBe(0);
    const end = interpolate(s1, s2, 1, { c: 'b' });
    expect(end.nodes.c.x).toBeCloseTo(s2.nodes.c.x);
    expect(end.nodes.c.o).toBe(1);
    expect(end.nodes.b.o).toBe(0);
  });

  it('eases and walks a polyline by arc length', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    const p = pointAlong([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 30 }], 0.5);
    expect(p).toEqual({ x: 10, y: 10 });
  });
});
