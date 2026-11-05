/**
 * Ranked search over the component list, so typing a node's name puts that
 * node first. Plain substring matching buried it: "af" matched "after" and
 * "staff", and "upf" listed the SMF (which mentions the UPF) before the UPF.
 *
 * Tiers, best first:
 *   0  the label is the query         ("amf" -> AMF)
 *   1  the label starts with it       ("n3" -> N3IWF)
 *   2  a word of the label or expansion starts with it ("session" -> SMF)
 *   3  the one-line job or summary mentions it
 *   4  the longer plain-words text mentions it (analogy, "without it", limit)
 *
 * Tiers 3 and 4 need at least 3 characters, so a short acronym such as "af"
 * is matched against names only.
 */
export const BEST_MAX_TIER = 2;
export const MIN_TEXT_QUERY = 3;

const alnum = (s) => (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Does a word in `text` start with `q`? ("sess" finds "session", not "obsess".) */
const hasWordStart = (text, q) => !!text && new RegExp(`(^|[^a-z0-9])${escape(q)}`, 'i').test(text);

/** The tier a component matches the query at, or -1 for no match. `q` is already trimmed and lower-cased. */
export function tierOf(c, q) {
  const key = alnum(c.label);
  const flat = alnum(q);
  if (flat) {
    if (key === flat) return 0;
    if (key.startsWith(flat)) return 1;
  }
  if (hasWordStart(c.label, q) || hasWordStart(c.expansion, q)) return 2;
  if (q.length < MIN_TEXT_QUERY) return -1;
  if (hasWordStart(c.plain?.job, q) || hasWordStart(c.summary, q)) return 3;
  const longer = [c.plain?.analogy, c.plain?.without, c.plain?.limit];
  return longer.some((t) => hasWordStart(t, q)) ? 4 : -1;
}

/**
 * Components that match `query`, best first: [{ component, tier }]. Ties keep
 * the order of `components`. An empty query returns everything at tier 0.
 */
export function rankComponents(components, query) {
  const q = query.trim().toLowerCase();
  if (!q) return components.map((component) => ({ component, tier: 0 }));
  const hits = [];
  components.forEach((component, i) => {
    const tier = tierOf(component, q);
    if (tier >= 0) hits.push({ component, tier, i });
  });
  hits.sort((a, b) => a.tier - b.tier || a.i - b.i);
  return hits.map(({ component, tier }) => ({ component, tier }));
}
