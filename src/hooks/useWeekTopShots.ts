import { useCallback, useEffect, useState } from 'react';
import type { Brief, BriefItem, RadarItem } from '../lib/types';
import { loadBrief, loadBriefIndex } from '../lib/briefs';
import type { AsyncStatus } from './useBrief';

// How many recent briefs feed "this week's top shots".
const WEEK_DAYS = 7;

export interface WeekTopShots {
  /** The week's top stories, most recent first (or the curated Sunday order). */
  items: BriefItem[];
  /** The newest brief's upcoming dates. */
  radar: RadarItem[];
  /** ISO date of the newest brief. */
  latestDate: string | null;
}

// One fetch per app session; the set of briefs only changes once a day.
let cache: Promise<WeekTopShots> | null = null;

function pick(briefs: Brief[]): WeekTopShots {
  const latest = briefs[0] ?? null;
  const byId = new Map<string, BriefItem>();
  for (const b of briefs) for (const item of b.items) byId.set(item.id, item);

  // A Sunday brief curates the week (weekInReview); otherwise the top shot of
  // each day — the highlighted story — makes the list.
  const curated = (latest?.weekInReview ?? [])
    .map((entry) => byId.get(entry.id))
    .filter((item): item is BriefItem => Boolean(item));
  const items =
    curated.length > 0
      ? curated
      : briefs.flatMap((b) => b.items.filter((item) => item.highlight));

  return { items, radar: latest?.radar ?? [], latestDate: latest?.date ?? null };
}

function fetchWeek(): Promise<WeekTopShots> {
  if (!cache) {
    cache = loadBriefIndex()
      .then((idx) =>
        Promise.all(
          idx.briefs
            .slice(0, WEEK_DAYS)
            .map((entry) => loadBrief(entry.date).catch(() => null)),
        ),
      )
      .then((loaded) => pick(loaded.filter((b): b is Brief => b !== null)))
      .catch((err) => {
        cache = null; // let the next mount retry
        throw err;
      });
  }
  return cache;
}

/** The last seven briefs boiled down to the week's top shots. */
export function useWeekTopShots(): { status: AsyncStatus; data: WeekTopShots | null; reload: () => void } {
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [data, setData] = useState<WeekTopShots | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    fetchWeek()
      .then((result) => {
        if (!alive) return;
        setData(result);
        setStatus('ready');
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    cache = null;
    setAttempt((n) => n + 1);
  }, []);

  return { status, data, reload };
}
