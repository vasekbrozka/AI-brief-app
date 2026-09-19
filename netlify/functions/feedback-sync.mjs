import { getStore } from '@netlify/blobs';

// Nightly at 02:30 UTC, before the 03:00 UTC generation: write the last 30
// days of reader votes into the repo as data/briefs/feedback.json, so the
// recipe reads them with a plain git pull (the generation session cannot
// necessarily reach this site). Needs GITHUB_TOKEN in the Netlify environment
// — a fine-grained token with Contents read/write on the repo; without it
// the sync logs a line and does nothing. The commit only touches data/, so
// the netlify.toml ignore rule keeps it from triggering a deploy.
const REPO = 'vasekbrozka/AI-brief-app';
const BRANCH = 'claude/daily-ai-brief-app-b1qq0p';
const FILE = 'data/briefs/feedback.json';
const DAYS = 30;

const ID_RE = /^(\d{4}-\d{2}-\d{2})-[a-z0-9-]+$/;
const dayOf = (id) => ID_RE.exec(id)?.[1] ?? null;
const isoDaysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

function summarize(votes, days) {
  const cutoff = isoDaysAgo(days);
  const items = {};
  for (const id of Object.keys(votes).sort()) {
    const day = dayOf(id);
    if (day && day >= cutoff) items[id] = { up: votes[id].up | 0, down: votes[id].down | 0 };
  }
  return { updated: new Date().toISOString(), days, items };
}

const sameItems = (a, b) => {
  try {
    return JSON.stringify(JSON.parse(a).items) === JSON.stringify(b.items);
  } catch {
    return false;
  }
};

export default async () => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('GITHUB_TOKEN is not set — feedback stays in Blobs only (GET /api/feedback).');
    return new Response('no token');
  }

  const store = getStore('feedback');
  const votes = (await store.get('votes', { type: 'json' })) ?? {};
  const summary = summarize(votes, DAYS);
  const content = JSON.stringify(summary, null, 2) + '\n';

  const api = `https://api.github.com/repos/${REPO}/contents/${FILE}`;
  const headers = {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'aispresso-feedback-sync',
  };

  let sha;
  const current = await fetch(`${api}?ref=${encodeURIComponent(BRANCH)}`, { headers });
  if (current.ok) {
    const json = await current.json();
    sha = json.sha;
    const existing = Buffer.from(json.content ?? '', 'base64').toString('utf8');
    if (sameItems(existing, summary)) {
      console.log('no new votes since the last sync');
      return new Response('unchanged');
    }
  } else if (current.status !== 404) {
    console.error('reading the current file failed:', current.status);
    return new Response('read failed', { status: 502 });
  }

  const put = await fetch(api, {
    method: 'PUT',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({
      message: `feedback: ${isoDaysAgo(0)}`,
      content: Buffer.from(content).toString('base64'),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!put.ok) {
    console.error('commit failed:', put.status, await put.text().catch(() => ''));
    return new Response('commit failed', { status: 502 });
  }
  console.log(`synced ${Object.keys(summary.items).length} items`);
  return new Response('synced');
};

export const config = { schedule: '30 2 * * *' };
