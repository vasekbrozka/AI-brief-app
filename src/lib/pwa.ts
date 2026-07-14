/** True when the app is running as an installed PWA (standalone display). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mql = window.matchMedia?.('(display-mode: standalone)');
  // `navigator.standalone` is the iOS Safari signal for home-screen apps.
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
  return Boolean(mql?.matches || iosStandalone);
}
