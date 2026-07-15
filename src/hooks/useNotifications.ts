import { useState } from 'react';
import { NOTIFY_INTENT_KEY, disablePush, enablePush, pushSupported } from '../lib/push';

/** Settings toggle state for the daily morning notification. */
export function useNotifications() {
  const supported = pushSupported();
  const [enabled, setEnabled] = useState(
    () => supported && localStorage.getItem(NOTIFY_INTENT_KEY) === '1',
  );
  const [busy, setBusy] = useState(false);

  const toggle = async (on: boolean) => {
    if (busy || !supported) return;
    setBusy(true);
    try {
      if (on) {
        const ok = await enablePush();
        if (ok) {
          localStorage.setItem(NOTIFY_INTENT_KEY, '1');
          setEnabled(true);
        }
      } else {
        await disablePush();
        localStorage.removeItem(NOTIFY_INTENT_KEY);
        setEnabled(false);
      }
    } finally {
      setBusy(false);
    }
  };

  return { supported, enabled, toggle };
}
