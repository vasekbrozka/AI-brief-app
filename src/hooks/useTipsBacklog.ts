import { useEffect, useState } from 'react';
import type { TipEntry } from '../lib/types';
import { loadTipsBacklog } from '../lib/briefs';
import { daysAgo } from '../lib/format';
import type { AsyncStatus } from './useBrief';

// Tips published in the last N days make the "Try it yourself" checklist.
const RECENT_DAYS = 30;

// One fetch per app session — the checklist shows up on Today and on its own
// screen, and the ledger only changes once a day.
let cache: Promise<TipEntry[]> | null = null;

function fetchRecent(): Promise<TipEntry[]> {
  if (!cache) {
    cache = loadTipsBacklog()
      .then((backlog) =>
        backlog.tips
          .filter((tip) => tip.used && daysAgo(tip.used) >= 0 && daysAgo(tip.used) <= RECENT_DAYS)
          .sort((a, b) => (b.used ?? '').localeCompare(a.used ?? '')),
      )
      .catch((err) => {
        cache = null; // let the next mount retry
        throw err;
      });
  }
  return cache;
}

/** Recently published tips, newest first. `ready` with an empty list = nothing recent. */
export function useRecentTips(): { status: AsyncStatus; tips: TipEntry[]; reload: () => void } {
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [tips, setTips] = useState<TipEntry[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    fetchRecent()
      .then((list) => {
        if (!alive) return;
        setTips(list);
        setStatus('ready');
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [attempt]);

  return { status, tips, reload: () => setAttempt((n) => n + 1) };
}
