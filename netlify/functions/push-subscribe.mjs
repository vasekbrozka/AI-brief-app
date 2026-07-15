import { getStore } from '@netlify/blobs';

// Personal app: a handful of devices at most. The cap keeps a stranger from
// stuffing the store; worst case they subscribe themselves to the daily brief.
const MAX_SUBS = 10;

export default async (req) => {
  const store = getStore('push');
  const subs = (await store.get('subs', { type: 'json' })) ?? [];

  if (req.method === 'POST') {
    const sub = await req.json().catch(() => null);
    if (!sub || typeof sub.endpoint !== 'string' || !sub.keys) {
      return new Response('bad request', { status: 400 });
    }
    const next = subs.filter((s) => s.endpoint !== sub.endpoint);
    next.push({ endpoint: sub.endpoint, keys: sub.keys, expirationTime: sub.expirationTime ?? null });
    while (next.length > MAX_SUBS) next.shift();
    await store.setJSON('subs', next);
    return Response.json({ ok: true, count: next.length });
  }

  if (req.method === 'DELETE') {
    const body = await req.json().catch(() => null);
    if (!body?.endpoint) return new Response('bad request', { status: 400 });
    await store.setJSON('subs', subs.filter((s) => s.endpoint !== body.endpoint));
    return Response.json({ ok: true });
  }

  return new Response('method not allowed', { status: 405 });
};

export const config = { path: '/api/push/subscribe' };
