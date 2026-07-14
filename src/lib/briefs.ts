import type { Brief, BriefIndex } from './types';

// Briefs are served straight from GitHub instead of Netlify: the daily
// content commit would otherwise trigger a full (billed) Netlify deploy for
// a plain data change. `?ref=` sidesteps the branch name containing a slash,
// which breaks the usual `raw.githubusercontent.com/.../<branch>/...` path
// form. The `vnd.github.raw` accept header returns the file body directly
// instead of the JSON-wrapped, base64-encoded default.
const REPO = 'vasekbrozka/AI-brief-app';
const BRANCH = 'claude/daily-ai-brief-app-b1qq0p';

function contentsUrl(path: string): string {
  return `https://api.github.com/repos/${REPO}/contents/${path}?ref=${encodeURIComponent(BRANCH)}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(contentsUrl(path), {
    headers: { Accept: 'application/vnd.github.raw' },
    cache: 'no-cache',
  });
  if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
  return (await res.json()) as T;
}

export async function loadBriefIndex(): Promise<BriefIndex> {
  return fetchJson<BriefIndex>('data/briefs/index.json');
}

export async function loadBrief(date: string): Promise<Brief> {
  return fetchJson<Brief>(`data/briefs/${date}.json`);
}
