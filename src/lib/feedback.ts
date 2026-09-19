// Reader feedback: an anonymous thumbs up / down per story, sent to the
// site's feedback function so the generator can learn what is useful. Only the
// story id and the vote leave the device. A vote that cannot be sent (offline)
// waits in a small queue and goes out on the next launch or reconnect.
const ENDPOINT = '/api/feedback';
const QUEUE_KEY = 'aibrief.votes.queue';

export type Vote = 'up' | 'down';

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

/** True when the server accepted the delta — or rejected it for good (4xx). */
async function post(delta: VoteDelta): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(delta),
      keepalive: true,
    });
    return res.ok || (res.status >= 400 && res.status < 500);
  } catch {
    return false;
  }
}

/** Send a vote change; queue it when the network is not there. */
export async function sendVote(delta: VoteDelta): Promise<void> {
  const ok = await post(delta);
  if (!ok) writeQueue([...readQueue(), delta]);
}

/** Replay queued votes in order; stops at the first one that still fails. */
export async function flushVoteQueue(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;
  let i = 0;
  while (i < queue.length) {
    if (!(await post(queue[i]))) break;
    i++;
  }
  writeQueue(queue.slice(i));
}
