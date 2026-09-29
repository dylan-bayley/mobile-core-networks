import { useCallback, useEffect, useState } from 'react';
import { parseHash } from './route.js';

const read = () => parseHash(typeof window === 'undefined' ? '' : window.location.hash);

/**
 * The current hash route, updated on back/forward and on in-page link
 * clicks. `navigate(href)` pushes a new history entry; pages that only
 * rewrite their own query (the Flows explorer) use history.replaceState
 * directly and don't need to re-render the shell.
 */
export function useRoute() {
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
      window.removeEventListener('hashchange', onChange);
      window.removeEventListener('popstate', onChange);
    };
  }, []);

  const navigate = useCallback((href) => {
    if (window.location.hash === href) return;
    window.location.hash = href.replace(/^#/, '');
  }, []);

  return { ...route, navigate };
}
