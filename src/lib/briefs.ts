import type { Brief, BriefIndex } from './types';

const BASE = import.meta.env.BASE_URL || '/';

export async function loadBriefIndex(): Promise<BriefIndex> {
  const res = await fetch(`${BASE}data/briefs/index.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load brief index (${res.status})`);
  return (await res.json()) as BriefIndex;
}

export async function loadBrief(date: string): Promise<Brief> {
  const res = await fetch(`${BASE}data/briefs/${date}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load brief ${date} (${res.status})`);
  return (await res.json()) as Brief;
}
