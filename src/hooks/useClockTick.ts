import { useEffect, useState } from 'react';

/**
 * Forces a re-render every minute and whenever the app returns to the
 * foreground, so the time-of-day brew title stays current without a manual
 * refresh — including when an installed PWA is resumed from the Home Screen.
 */
export function useClockTick(): void {
  const [, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    const id = window.setInterval(bump, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') bump();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
