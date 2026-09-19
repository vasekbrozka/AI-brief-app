import { getStore } from '@netlify/blobs';

// Anonymous thumbs up / down per story. Only counters are stored — no user,
// device or IP data — so the generator can learn which kinds of stories the
// readers find useful. Personal app with a handful of devices: a lost update
// under two simultaneous votes is acceptable (Blobs get/set is not atomic).
//
//   POST /api/feedback  { id, vote: 'up'|'down'|null, prev: 'up'|'down'|null }
//   GET  /api/feedback?days=30  → { updated, days, items: { [id]: { up, down } } }
const ID_RE = /^(\d{4}-\d{2}-\d{2})-[a-z0-9-]+$/;
const KEEP_DAYS = 60;
const MAX_COUNT = 100000;

const dayOf = (id) => ID_RE.exec(id)?.[1] ?? null;
const isoDaysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

function prune(votes) {
  const cutoff = isoDaysAgo(KEEP_DAYS);
  for (const id of Object.keys(votes)) {
    const day = dayOf(id);
    if (!day || day < cutoff) delete votes[id];
  }
  return votes;
}

function summarize(votes, days) {
  const cutoff = isoDaysAgo(days);
  const items = {};
  for (const id of Object.keys(votes).sort()) {
    const day = dayOf(id);
    if (day && day >= cutoff) items[id] = { up: votes[id].up | 0, down: votes[id].down | 0 };
  }
  return { updated: new Date().toISOString(), days, items };
}

export default async (req) => {
  const store = getStore('feedback');
  const votes = (await store.get('votes', { type: 'json' })) ?? {};

  if (req.method === 'GET') {
    const days = Math.min(90, Math.max(1, Number(new URL(req.url).searchParams.get('days')) || 30));
    return Response.json(summarize(votes, days), {
      headers: { 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
    });
  }

  if (req.method === 'POST') {
    const body = await req.json().catch(() => null);
    const id = body?.id;
    const vote = body?.vote ?? null;
    const prev = body?.prev ?? null;
    const valid = (v) => v === null || v === 'up' || v === 'down';
    if (typeof id !== 'string' || !ID_RE.test(id) || !valid(vote) || !valid(prev) || vote === prev) {
      return new Response('bad request', { status: 400 });
    }
    if (dayOf(id) < isoDaysAgo(KEEP_DAYS)) return new Response('too old', { status: 400 });

    const entry = votes[id] ?? { up: 0, down: 0 };
    if (prev) entry[prev] = Math.max(0, (entry[prev] | 0) - 1);
    if (vote) entry[vote] = Math.min(MAX_COUNT, (entry[vote] | 0) + 1);
    entry.updated = isoDaysAgo(0);
    votes[id] = entry;
    await store.setJSON('votes', prune(votes));
    return Response.json({ ok: true, up: entry.up, down: entry.down });
  }

  return new Response('method not allowed', { status: 405 });
};

export const config = { path: '/api/feedback' };
