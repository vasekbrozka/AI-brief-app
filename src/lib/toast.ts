// Minimal transient-toast channel: a dispatcher any module can call and a single
// <Toaster /> mounted in the app that renders the message for a moment.
export const TOAST_EVENT = 'aispresso:toast';

export function toast(message: string): void {
  try {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
  } catch {
    /* SSR / no window — no-op */
  }
}
