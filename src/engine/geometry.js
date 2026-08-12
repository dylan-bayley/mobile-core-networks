const ctrOf = (nodes) => (id) => ({ x: nodes[id].cx, y: nodes[id].cy });

export const control = (p0, p1, curve) => {
  const dx = p1.x - p0.x, dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: (p0.x + p1.x) / 2 + (-dy / len) * curve, y: (p0.y + p1.y) / 2 + (dx / len) * curve };
};

export const bez = (p0, c, p1, t) => ({
  x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * c.x + t * t * p1.x,
  y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * c.y + t * t * p1.y,
});

/**
 * Binds the topology-agnostic bezier math to a specific topology's nodes/links,
 * so the same geometry functions can serve the 4G, NSA and SA diagrams.
 */
export function makeGeometry(topology) {
  const { nodes, links } = topology;
  const ctr = ctrOf(nodes);

  const linkIndex = new Map();
  for (const l of links) {
    linkIndex.set(`${l.a}|${l.b}`, l);
    linkIndex.set(`${l.b}|${l.a}`, l);
  }
  const linkFor = (a, b) => linkIndex.get(`${a}|${b}`);

  const linkPathD = (l) => {
    const p0 = ctr(l.a), p1 = ctr(l.b), c = control(p0, p1, l.curve);
    return `M ${p0.x} ${p0.y} Q ${c.x} ${c.y} ${p1.x} ${p1.y}`;
  };

  const linkMid = (l) => {
    const p0 = ctr(l.a), p1 = ctr(l.b), c = control(p0, p1, l.curve);
    return bez(p0, c, p1, 0.5);
  };

  const pointOnRoute = (route, t) => {
    const hops = route.length - 1;
    const raw = Math.min(t, 0.999999) * hops;
    const i = Math.floor(raw);
    const local = raw - i;
    const from = route[i], to = route[i + 1];
    const l = linkFor(from, to);
    const p0 = ctr(from), p1 = ctr(to);
    const c = l ? control(ctr(l.a), ctr(l.b), l.curve) : control(p0, p1, 0);
    return bez(p0, c, p1, local);
  };

  const routeLinks = (route) => {
    const out = [];
    for (let i = 0; i < route.length - 1; i++) {
      const l = linkFor(route[i], route[i + 1]);
      if (l) out.push(l);
    }
    return out;
  };

  return { ctr, linkFor, linkPathD, linkMid, pointOnRoute, routeLinks };
}
