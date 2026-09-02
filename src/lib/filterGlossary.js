/** Glossary as a sorted [key, entry] list. */
export const glossaryEntries = (glossary) => Object.entries(glossary).sort(([a], [b]) => a.localeCompare(b));

/**
 * Case-insensitive match on key, expansion or note. Keys that *start* with
 * the query come first so "S1" ranks S1-MME above "S13" and prose mentions.
 */
export function filterGlossary(entries, query, limit = Infinity) {
  const q = query.trim().toLowerCase();
  if (!q) return entries.slice(0, limit);
  const starts = [];
  const rest = [];
  for (const item of entries) {
    const [key, e] = item;
    const k = key.toLowerCase();
    if (k.startsWith(q)) starts.push(item);
    else if (k.includes(q) || e.expansion.toLowerCase().includes(q) || (e.note ?? '').toLowerCase().includes(q)) rest.push(item);
    if (starts.length >= limit) break;
  }
  return [...starts, ...rest].slice(0, limit);
}
