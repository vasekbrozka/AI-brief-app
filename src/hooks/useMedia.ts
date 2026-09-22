import { useEffect, useState } from 'react';

/**
 * Tracks a media query in JS. Used where a layout cannot be a CSS variation of
 * the same markup — the desktop brief is a different reader (one story at a
 * time), not a restyled list, so it needs a different tree.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(query).matches === true,
  );

  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** The width at which the brief becomes the desktop reader (hero + rail). */
export const DESKTOP_QUERY = '(min-width: 1100px)';

/**
 * The width at which the month ahead gets a column of its own. It then also
 * takes over the right-hand column's job — the tint, the streak and the
 * sharing — so the side column can be a plain stack of the week's cards.
 */
export const WIDE_QUERY = '(min-width: 1720px)';
