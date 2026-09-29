/**
 * Hash routing, kept deliberately tiny. Routes live in the hash
 * (`#/learn/5gc?scene=sba`) so GitHub Pages never 404s on a refresh, and
 * each page's own state lives in the query string after the hash path.
 *
 * These helpers are pure so they can be unit-tested; `useRoute` wires them
 * to the browser.
 */

/** Splits a location hash into a normalised path, its segments and a query. */
export function parseHash(hash) {
  const raw = (hash ?? '').replace(/^#/, '');
  const q = raw.indexOf('?');
  const pathPart = q >= 0 ? raw.slice(0, q) : raw;
  const queryPart = q >= 0 ? raw.slice(q + 1) : '';
  const segments = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
  return {
    path: `/${segments.join('/')}`,
    segments,
    query: new URLSearchParams(queryPart),
  };
}

/** Builds a hash href for a path plus optional query (object or URLSearchParams). */
export function hrefFor(path, query) {
  const q = query ? new URLSearchParams(query).toString() : '';
  return `#${path}${q ? `?${q}` : ''}`;
}

const LEGACY_KEYS = ['net', 'session', 'variant', 'step', 'view'];

/**
 * Links shared before the site had sections look like `/?net=sa&step=…`
 * with no hash. Returns the hash they should now open (`#/flows?…`), or
 * null when there's nothing to redirect.
 */
export function legacyRedirect(search, hash) {
  if (hash && hash !== '#' && hash !== '#/') return null;
  const params = new URLSearchParams(search ?? '');
  if (!LEGACY_KEYS.some((k) => params.has(k))) return null;
  const kept = new URLSearchParams();
  for (const k of LEGACY_KEYS) if (params.has(k)) kept.set(k, params.get(k));
  return hrefFor('/flows', kept);
}

/** The query string of the current hash route, as URLSearchParams. */
export const hashQuery = () => parseHash(typeof window === 'undefined' ? '' : window.location.hash).query;

/** A full URL for the current page with the given hash query, for replaceState and "copy link". */
export function urlWithHashQuery(path, query) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${hrefFor(path, query)}`;
}
