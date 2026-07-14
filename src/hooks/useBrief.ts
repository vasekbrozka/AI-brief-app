import { useCallback, useEffect, useState } from 'react';
import type { Brief, BriefIndex } from '../lib/types';
import { loadBrief, loadBriefIndex } from '../lib/briefs';

export type AsyncStatus = 'loading' | 'ready' | 'error';

interface AsyncResult<T> {
  status: AsyncStatus;
  data: T | null;
  reload: () => void;
}

export function useBriefIndex(): AsyncResult<BriefIndex> {
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [data, setData] = useState<BriefIndex | null>(null);

  const reload = useCallback(() => {
    setStatus('loading');
    setData(null);
    loadBriefIndex()
      .then((idx) => {
        setData(idx);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => reload(), [reload]);
  return { status, data, reload };
}

export function useBrief(date: string | null): AsyncResult<Brief> {
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [data, setData] = useState<Brief | null>(null);

  const reload = useCallback(() => {
    if (!date) return;
    setStatus('loading');
    setData(null);
    loadBrief(date)
      .then((brief) => {
        setData(brief);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [date]);

  useEffect(() => reload(), [reload]);
  return { status, data, reload };
}

interface LatestBriefResult extends AsyncResult<Brief> {
  /** ISO timestamp of the last successful brief generation (from index.json). */
  updated: string | null;
}

/** Loads the newest brief listed in the index. `ready` with `null` means the archive is empty. */
export function useLatestBrief(): LatestBriefResult {
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [data, setData] = useState<Brief | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

  const reload = useCallback(() => {
    setStatus('loading');
    setData(null);
    setUpdated(null);
    loadBriefIndex()
      .then((idx) => {
        setUpdated(idx.updated ?? null);
        const latest = idx.briefs[0];
        if (!latest) {
          setStatus('ready');
          return;
        }
        return loadBrief(latest.date).then((brief) => {
          setData(brief);
          setStatus('ready');
        });
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => reload(), [reload]);
  return { status, data, reload, updated };
}
