const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pick = (arr, n) => shuffle(arr).slice(0, n);

const escapeRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Hides node names in a description. Longest names first, and only whole
 * names, so "SMF+PGW-C" isn't half-masked as "SMF" and the "MME" inside
 * "S1-MME" (an interface, not the answer) is left alone. "MME-initiated" is
 * still masked.
 */
export const maskNodes = (text, topology) => {
  const labels = [...new Set(Object.values(topology.nodes).map((n) => n.t))].sort((a, b) => b.length - a.length);
  let out = text;
  for (const label of labels) {
    out = out.replace(new RegExp(`(?<![\\w-])${escapeRe(label)}(?!\\w)`, 'g'), '▒▒▒');
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
    // A round trip ends back where it started; "where does it end up" would be a trick question.
    if (s.rt) return null;
    const correct = topology.nodes[s.p[s.p.length - 1]].t;
    const inPath = new Set(s.p.map((n) => topology.nodes[n].t));
    const distractors = pick(nodeLabels.filter((l) => !inPath.has(l)), 3);
    if (distractors.length < 3) return null;
    return {
      type: 'choice',
      stepIndex: i,
      prompt: `Where does this step end up? "${maskNodes(s.d, topology)}"`,
      options: shuffle([correct, ...distractors]).map((label) => ({ label, correct: label === correct })),
    };
  };

  const orderQ = (start) => {
    const slice = steps.slice(start, start + 4);
    return {
      type: 'order',
      stepIndex: start,
      prompt: 'Put these four consecutive steps in the order they happen.',
      items: shuffle(slice.map((s, k) => ({ label: s.t, order: k }))),
    };
  };

  // One shuffled pool of distinct questions per kind, drawn in turn, so no
  // question repeats; a short flow just gets a shorter quiz.
  const pools = [
    shuffle(steps.map((_, i) => i)).map((i) => () => interfaceQ(i)),
    shuffle(steps.map((_, i) => i)).map((i) => () => nodeQ(i)),
    shuffle(steps.length >= 4 ? steps.slice(0, steps.length - 3).map((_, i) => i) : []).map((i) => () => orderQ(i)),
  ];
  for (let kind = 0; qs.length < count && pools.some((p) => p.length); kind = (kind + 1) % pools.length) {
    while (pools[kind].length) {
      const q = pools[kind].shift()();
      if (q) {
        qs.push(q);
        break;
      }
    }
  }
  return qs;
}
