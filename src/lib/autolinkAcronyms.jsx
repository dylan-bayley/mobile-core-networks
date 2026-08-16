import GlossaryTermButton from '../components/GlossaryTermButton.jsx';

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let cachedGlossary = null;
let cachedRegex = null;

/**
 * Builds (and memoizes) one alternation regex from every autolink-eligible
 * glossary key, sorted longest-first. Longest-first is load-bearing: with a
 * global regex, once a match is found at a position the engine advances
 * `lastIndex` past the whole matched span, so e.g. "S1-MME" must be tried
 * before the substring "MME" can shadow it (the hyphen is a \b boundary, so
 * "MME" alone would otherwise match first and "eat" the position).
 */
function buildRegex(glossary) {
  if (cachedGlossary === glossary) return cachedRegex;
  const keys = Object.keys(glossary)
    .filter((k) => glossary[k].autolink !== false)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp);
  cachedRegex = new RegExp(`\\b(${keys.join('|')})\\b`, 'g');
  cachedGlossary = glossary;
  return cachedRegex;
}

/**
 * Splits `text` on glossary-key matches and wraps each match in a clickable
 * GlossaryTermButton, returning an array of strings/elements suitable as
 * React children. Non-matching text passes through unchanged.
 *
 * Known v1 limitation: plural/inflected forms ("TEIDs", "CDRs") don't match
 * since there's no \b boundary before a trailing "s" glued onto the key.
 */
export function autolinkAcronyms(text, glossary, { activeKey, onOpen } = {}) {
  if (!text) return text;
  const regex = buildRegex(glossary);
  const parts = text.split(regex);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <GlossaryTermButton key={i} termKey={part} active={activeKey === part} onOpen={onOpen}>
        {part}
      </GlossaryTermButton>
    ) : (
      part
    ),
  );
}
