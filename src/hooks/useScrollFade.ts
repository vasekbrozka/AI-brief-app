import { useEffect, useRef, useState } from 'react';

/**
 * Tracks whether a scroll container still has content below the fold. A column
 * that ends in something pinned — the term of the day under the week — can
 * then fade its last rows out instead of cutting one off mid-card, and stop
 * fading once there is nothing more to reach.
 */
export function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // A sub-pixel slack: a container scrolled to the end can land a fraction
    // short of its own height and would otherwise keep fading for ever.
    const read = () => setMore(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    read();

    el.addEventListener('scroll', read, { passive: true });

    // The column fills asynchronously (the week, the tips), so both the box
    // and what is in it have to be watched.
    const ro = new ResizeObserver(read);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    const mo = new MutationObserver(read);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener('scroll', read);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return { ref, more };
}
