// Reader feedback: an anonymous thumbs up / down per story (and per day),
// sent to the site's feedback function so the generator can learn what is
// useful. Only the id and the vote leave the device. A vote that cannot be
// sent (offline) waits in a small queue and goes out on the next launch or
// reconnect. Everyone's counts come back from the same endpoint.
const ENDPOINT = '/api/feedback';
const QUEUE_KEY = 'aibrief.votes.queue';

export type Vote = 'up' | 'down';

export interface VoteCounts {
  up: number;
  down: number;
}

export type CountsMap = Record<string, VoteCounts>;

export interface VoteDelta {
  id: string;
  /** The new vote, or null to retract. */
  vote: Vote | null;
  /** The vote this replaces, so the server can move the count. */
  prev: Vote | null;
}

function readQueue(): VoteDelta[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as VoteDelta[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: VoteDelta[]) {
  try {
    if (queue.length === 0) localStorage.removeItem(QUEUE_KEY);
    else localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-50)));
  } catch {
    /* ignore */
  }
}

function asCounts(value: unknown): VoteCounts | null {
  const v = value as { up?: unknown; down?: unknown } | null;
  if (v && Number.isInteger(v.up) && Number.isInteger(v.down)) {
    return { up: v.up as number, down: v.down as number };
  }
  return null;
}

/** `ok` when the server accepted the delta — or rejected it for good (4xx). */
async function post(delta: VoteDelta): Promise<{ ok: boolean; counts: VoteCounts | null }> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(delta),
      keepalive: true,
    });
    if (res.ok) return { ok: true, counts: asCounts(await res.json().catch(() => null)) };
    return { ok: res.status >= 400 && res.status < 500, counts: null };
  } catch {
    return { ok: false, counts: null };
  }
}

/** Send a vote change; queue it when the network is not there. Returns the server's counts when it answered. */
export async function sendVote(delta: VoteDelta): Promise<VoteCounts | null> {
  const result = await post(delta);
  if (!result.ok) writeQueue([...readQueue(), delta]);
  return result.counts;
}

/** Replay queued votes in order; stops at the first one that still fails. */
export async function flushVoteQueue(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;
  let i = 0;
  while (i < queue.length) {
    if (!(await post(queue[i])).ok) break;
    i++;
  }
  writeQueue(queue.slice(i));
}

/** Everyone's counts for the last `days` days, keyed by story id. */
export async function fetchCounts(days = 30): Promise<CountsMap> {
  const res = await fetch(`${ENDPOINT}?days=${days}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`feedback ${res.status}`);
  const json = (await res.json()) as { items?: Record<string, unknown> };
  const out: CountsMap = {};
  for (const [id, value] of Object.entries(json?.items ?? {})) {
    const counts = asCounts(value);
    if (counts) out[id] = counts;
  }
  return out;
}
