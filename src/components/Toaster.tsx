import { useEffect, useState } from 'react';
import { TOAST_EVENT } from '../lib/toast';

/** Listens for toast() calls and shows the message briefly, then fades it out. */
export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const onToast = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMsg(null), 1900);
    };
    window.addEventListener(TOAST_EVENT, onToast as EventListener);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast as EventListener);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="toaster" aria-live="polite" aria-atomic="true">
      {msg && (
        <div className="toast" role="status">
          {msg}
        </div>
      )}
    </div>
  );
}
