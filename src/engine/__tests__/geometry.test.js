import { describe, expect, it } from 'vitest';
import { makeGeometry } from '../geometry.js';

const topo = {
  nodes: { a: { cx: 0, cy: 0 }, b: { cx: 100, cy: 0 }, c: { cx: 100, cy: 100 } },
  links: [
    { a: 'a', b: 'b', curve: 0 },
    { a: 'b', b: 'c', curve: 0, labelT: 0.25, lx: 5, ly: -5 },
  ],
};

describe('makeGeometry', () => {
  const geo = makeGeometry(topo);
  it('walks a route in either direction and holds at the destination', () => {
    expect(geo.pointOnRoute(['a', 'b', 'c'], 0)).toEqual({ x: 0, y: 0 });
    expect(geo.pointOnRoute(['a', 'b', 'c'], 0.5)).toEqual({ x: 100, y: 0 });
    const end = geo.pointOnRoute(['c', 'b', 'a'], 1);
    expect(end.x).toBeCloseTo(0, 3);
    expect(end.y).toBeCloseTo(0, 3);
  });
  it('honours label position overrides', () => {
    expect(geo.labelPos(topo.links[0])).toEqual({ x: 50, y: 0 });
    expect(geo.labelPos(topo.links[1])).toEqual({ x: 105, y: 20 });
  });
  it('lists the links a route crosses', () => {
    expect(geo.routeLinks(['a', 'b', 'c'])).toEqual(topo.links);
    expect(geo.routeLinks(['a', 'c'])).toEqual([]);
  });
});

import { nodeAt } from '../geometry.js';

describe('nodeAt', () => {
  const nodes = { ue: { cx: 60, cy: 300, w: 80, h: 50 }, enb: { cx: 200, cy: 300, w: 100, h: 50 } };
  it('finds the node a point sits inside, honouring padding', () => {
    expect(nodeAt({ x: 60, y: 300 }, nodes)).toBe('ue');
    expect(nodeAt({ x: 101, y: 300 }, nodes)).toBe(null);
    expect(nodeAt({ x: 101, y: 300 }, nodes, 4)).toBe('ue');
    expect(nodeAt({ x: 130, y: 300 }, nodes)).toBe(null);
    expect(nodeAt({ x: 240, y: 320 }, nodes)).toBe('enb');
  });
});
