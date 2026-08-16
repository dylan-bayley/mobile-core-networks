/**
 * Resolves a raw topology label ("S5 / S8", "N6 (ims)", "I/S-CSCF", "MME")
 * to a key that exists in `glossary`, or null if nothing matches.
 * Order: exact match -> strip a trailing " (...)" parenthetical -> first
 * "/"-separated segment that matches. These are discrete, known label
 * shapes (not free text), enumerated in glossary.js.
 */
export function resolveGlossaryKey(label, glossary) {
  if (glossary[label]) return label;

  const stripped = label.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (stripped !== label && glossary[stripped]) return stripped;

  const base = stripped || label;
  if (base.includes('/')) {
    for (const part of base.split('/').map((p) => p.trim())) {
      if (glossary[part]) return part;
    }
  }

  return null;
}
