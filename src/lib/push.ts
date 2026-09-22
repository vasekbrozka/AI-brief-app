// Web Push client for the morning notification. The public VAPID key is
// meant to be public; its private half lives only in Netlify env vars.
const VAPID_PUBLIC_KEY =
  'BIUlKwGQ5Bj4qDMgUvg93GJqU-Xgf-UJ7WCAJQLfnJ42pWQ79pxQo1bNwMz3k2nbxxJpbu5GcBASZ4XgBUNTptg';

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

/** The reader's UI language, so the morning push can carry the headline in it. */
function currentLang(): 'cs' | 'en' {
  try {
    return localStorage.getItem('aibrief.lang') === 'en' ? 'en' : 'cs';
  } catch {
    return 'cs';
  }
}

/** Tell the server to forget an endpoint it can no longer deliver to. */
async function forgetOnServer(endpoint: string): Promise<void> {
  await fetch(SUBSCRIBE_ENDPOINT, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  }).catch(() => {});
}

/**
 * Whether a subscription was made with the VAPID key this build ships. A
 * subscription outlives a key rotation: the browser keeps handing back the old
 * one, and the push service then rejects every message signed with the new key
 * (403, which is not the 404/410 the sender prunes on). So the key has to be
 * compared, not just the subscription's existence.
 */
function keyMatches(sub: PushSubscription): boolean {
  const key = sub.options?.applicationServerKey;
  // Some browsers do not expose it; assume it is fine rather than churn.
  if (!key) return true;
  const want = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  const have = new Uint8Array(key);
  return have.length === want.length && have.every((b, i) => b === want[i]);
}

/**
 * The subscription for the current key — re-subscribing, and retiring the old
 * endpoint, when the key has moved on.
 */
async function currentSubscription(reg: ServiceWorkerRegistration): Promise<PushSubscription> {
  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    if (keyMatches(existing)) return existing;
    await forgetOnServer(existing.endpoint);
    await existing.unsubscribe().catch(() => {});
  }
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
}

async function registerOnServer(sub: PushSubscription): Promise<boolean> {
  const res = await fetch(SUBSCRIBE_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...sub.toJSON(), lang: currentLang() }),
  });
  return res.ok;
}

/** Ask for permission (must run from a user gesture) and subscribe. */
export async function enablePush(): Promise<boolean> {
  if (!pushSupported()) return false;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await currentSubscription(reg);
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
 * Self-heal on app start: iOS occasionally drops PWA push subscriptions, and a
 * VAPID key rotation silently invalidates the ones it keeps. If the user opted
 * in and permission is still granted, quietly (re)subscribe for the current key
 * and refresh the server copy.
 */
export async function ensureSubscribed(): Promise<void> {
  if (!pushSupported()) return;
  if (localStorage.getItem(NOTIFY_INTENT_KEY) !== '1') return;
  if (Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await registerOnServer(await currentSubscription(reg));
  } catch {
    /* offline or blocked — try again next launch */
  }
}

/** Clear the app-icon badge (set by the morning push). */
export function clearBadge(): void {
  const nav = navigator as Navigator & { clearAppBadge?: () => Promise<void> };
  nav.clearAppBadge?.().catch(() => {});
}
