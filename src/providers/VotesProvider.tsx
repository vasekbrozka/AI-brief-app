import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { flushVoteQueue, sendVote, type Vote } from '../lib/feedback';

// The reader's own thumbs, kept on the device so the buttons show the choice
// and a second tap retracts it; every change is also reported to the site.
const STORAGE_KEY = 'aibrief.votes';

interface VotesContextValue {
  voteFor: (id: string) => Vote | null;
  /** Set a vote; the same vote again retracts it. */
  vote: (id: string, next: Vote) => void;
}

const VotesContext = createContext<VotesContextValue | null>(null);

function loadInitial(): Record<string, Vote> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const out: Record<string, Vote> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (v === 'up' || v === 'down') out[k] = v;
      }
      return out;
    }
  } catch {
    /* ignore */
  }
  return {};
}

function persist(map: Record<string, Vote>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function VotesProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Record<string, Vote>>(loadInitial);

  // Votes made offline go out once the network is back.
  useEffect(() => {
    void flushVoteQueue();
    const onOnline = () => void flushVoteQueue();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  const vote = useCallback((id: string, next: Vote) => {
    setMap((prev) => {
      const before = prev[id] ?? null;
      const after: Vote | null = before === next ? null : next;
      const map = { ...prev };
      if (after) map[id] = after;
      else delete map[id];
      persist(map);
      void sendVote({ id, vote: after, prev: before });
      return map;
    });
  }, []);

  const value = useMemo<VotesContextValue>(
    () => ({ voteFor: (id: string) => map[id] ?? null, vote }),
    [map, vote],
  );

  return <VotesContext.Provider value={value}>{children}</VotesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVotes(): VotesContextValue {
  const ctx = useContext(VotesContext);
  if (!ctx) throw new Error('useVotes must be used within VotesProvider');
  return ctx;
}
