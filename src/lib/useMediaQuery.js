import { useEffect, useState } from 'react';

/** Live media-query match; re-renders when the query result changes. */
export function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** True while the OS asks for reduced motion — tracked live, not read once. */
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
