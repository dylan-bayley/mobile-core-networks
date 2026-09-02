const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pick = (arr, n) => shuffle(arr).slice(0, n);

const maskNodes = (text, topology) => {
  let out = text;
  for (const n of Object.values(topology.nodes)) {
    out = out.split(n.t).join('▒▒▒');
  }
  return out;
};

/**
 * Builds `count` questions from the flow itself — no authored question bank.
 * Three shapes: which interface carries a message, which node a step ends at
 * (with node names masked out of the description), and put four consecutive
 * steps in order.
 */
export function makeQuestions(scenario, geo, count = 10) {
  const { steps, topology } = scenario;
  const linkLabels = [...new Set(topology.links.map((l) => l.l))];
  const nodeLabels = [...new Set(Object.values(topology.nodes).map((n) => n.t))];
  const qs = [];

  const interfaceQ = (i) => {
    const s = steps[i];
    const links = geo.routeLinks(s.p);
    if (!links.length) return null;
    const correct = links[0].l;
    const a = topology.nodes[s.p[0]].t;
    const b = topology.nodes[s.p[1]].t;
    return {
      type: 'choice',
      stepIndex: i,
      prompt: `Which reference point carries "${s.m}" between ${a} and ${b}?`,
      options: shuffle([correct, ...pick(linkLabels.filter((l) => l !== correct), 3)]).map((label) => ({ label, correct: label === correct })),
    };
  };

  const nodeQ = (i) => {
    const s = steps[i];
    const correct = topology.nodes[s.p[s.p.length - 1]].t;
    const inPath = new Set(s.p.map((n) => topology.nodes[n].t));
    const distractors = pick(nodeLabels.filter((l) => !inPath.has(l)), 3);
    return {
      type: 'choice',
      stepIndex: i,
      prompt: `Where does this step end up? "${maskNodes(s.d, topology)}"`,
      options: shuffle([correct, ...distractors]).map((label) => ({ label, correct: label === correct })),
    };
  };

  const orderQ = () => {
    if (steps.length < 4) return null;
    const start = Math.floor(Math.random() * (steps.length - 3));
    const slice = steps.slice(start, start + 4);
    return {
      type: 'order',
      stepIndex: start,
      prompt: 'Put these four consecutive steps in the order they happen.',
      items: shuffle(slice.map((s, k) => ({ label: s.t, order: k }))),
    };
  };

  const indices = shuffle(steps.map((_, i) => i));
  let cursor = 0;
  while (qs.length < count && cursor < indices.length * 3) {
    const kind = qs.length % 3;
    const i = indices[cursor % indices.length];
    cursor++;
    const q = kind === 0 ? interfaceQ(i) : kind === 1 ? nodeQ(i) : orderQ();
    if (q) qs.push(q);
  }
  return qs;
}
