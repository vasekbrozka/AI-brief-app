// Web Push client for the morning notification. The public VAPID key is
// meant to be public; its private half lives only in Netlify env vars.
const VAPID_PUBLIC_KEY =
  'BDM3FG_HdmoXa_wlZPrbcvGW99d5OodcIdAjsZ3LtPBtuOtFpVQN41m2LltNbZfjCFuCGuA51mffSdusGTnRkA0';

const SUBSCRIBE_ENDPOINT = '/api/push/subscribe';

export const NOTIFY_INTENT_KEY = 'aibrief.notify';

/** iOS exposes Push/Notification APIs only for installed (standalone) apps. */
export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(normalized);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function registerOnServer(sub: PushSubscription): Promise<boolean> {
  const res = await fetch(SUBSCRIBE_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(sub.toJSON()),
  });
  return res.ok;
}

/** Ask for permission (must run from a user gesture) and subscribe. */
export async function enablePush(): Promise<boolean> {
  if (!pushSupported()) return false;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;
  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));
  const ok = await registerOnServer(sub);
  if (!ok) await sub.unsubscribe().catch(() => {});
  return ok;
}

export async function disablePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await fetch(SUBSCRIBE_ENDPOINT, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => {});
  await sub.unsubscribe().catch(() => {});
}

/**
 * Self-heal on app start: iOS occasionally drops PWA push subscriptions.
 * If the user opted in and permission is still granted, quietly re-subscribe
 * and refresh the server copy.
 */
export async function ensureSubscribed(): Promise<void> {
  if (!pushSupported()) return;
  if (localStorage.getItem(NOTIFY_INTENT_KEY) !== '1') return;
  if (Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));
    await registerOnServer(sub);
  } catch {
    /* offline or blocked — try again next launch */
  }
}

/** Clear the app-icon badge (set by the morning push). */
export function clearBadge(): void {
  const nav = navigator as Navigator & { clearAppBadge?: () => Promise<void> };
  nav.clearAppBadge?.().catch(() => {});
}
