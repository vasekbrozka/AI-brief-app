import type { Brief, BriefIndex } from './types';
import type { Glossary } from './glossary';

// Briefs are served straight from GitHub instead of Netlify, so the daily
// content commit doesn't trigger a (billed) Netlify deploy. Primary source is
// raw.githubusercontent.com — no practical rate limit; anonymous Contents API
// calls share a 60-requests/hour limit per client IP (carrier-grade NAT pools
// that limit across strangers), so the API serves only as an automatic
// fallback when raw is unreachable. Requires a public repository. The
// refs/heads/ form keeps the slash-containing branch name unambiguous.
const REPO = 'vasekbrozka/AI-brief-app';
const BRANCH = 'claude/daily-ai-brief-app-b1qq0p';

const SOURCES: ((path: string) => { url: string; init: RequestInit })[] = [
  (path) => ({
    url: `https://raw.githubusercontent.com/${REPO}/refs/heads/${BRANCH}/${path}`,
    init: { cache: 'no-cache' },
  }),
  (path) => ({
    url: `https://api.github.com/repos/${REPO}/contents/${path}?ref=${encodeURIComponent(BRANCH)}`,
    // Accept is a CORS-safelisted header, so this stays a simple request.
    init: { cache: 'no-cache', headers: { Accept: 'application/vnd.github.raw' } },
  }),
];

async function fetchJson<T>(path: string): Promise<T> {
  let lastError: unknown = null;
  for (const source of SOURCES) {
    try {
      const { url, init } = source(path);
      const res = await fetch(url, init);
      if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Failed to load ${path}`);
}

export async function loadBriefIndex(): Promise<BriefIndex> {
  return fetchJson<BriefIndex>('data/briefs/index.json');
}

export async function loadBrief(date: string): Promise<Brief> {
  return fetchJson<Brief>(`data/briefs/${date}.json`);
}

// The glossary of AI terms is served the same way as briefs, so growing the
// dictionary stays a free content commit rather than a billed Netlify deploy.
export async function loadGlossary(): Promise<Glossary> {
  return fetchJson<Glossary>('data/glossary.json');
}
