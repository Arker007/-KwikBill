import { useState, useEffect } from 'react';

/**
 * Custom hook to track whether a CSS media query matches the current browser viewport or environment.
 * Safe for server-side rendering and testing environments.
 *
 * @param query CSS media query string (e.g. '(min-width: 768px)', '(prefers-color-scheme: dark)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = (mediaQuery: string): boolean => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return false;
    }
    return window.matchMedia(mediaQuery).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return;
    }

    const matchMediaList = window.matchMedia(query);

    // Initial sync
    setMatches(matchMediaList.matches);

    // Change listener callback
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers support addEventListener on MediaQueryList
    if (matchMediaList.addEventListener) {
      matchMediaList.addEventListener('change', handleChange);
    } else {
      // Fallback for older WebKit engines
      (matchMediaList as any).addListener(handleChange);
    }

    return () => {
      if (matchMediaList.removeEventListener) {
        matchMediaList.removeEventListener('change', handleChange);
      } else {
        (matchMediaList as any).removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}
