import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchCounts,
  flushVoteQueue,
  sendVote,
  type CountsMap,
  type Vote,
  type VoteCounts,
} from '../lib/feedback';

// The reader's own thumbs, kept on the device so the buttons show the choice
// and a second tap retracts it; every change is also reported to the site,
// which answers with everyone's counts for that id.
const STORAGE_KEY = 'aibrief.votes';
const NONE: VoteCounts = { up: 0, down: 0 };

interface VotesContextValue {
  voteFor: (id: string) => Vote | null;
  /** Everyone's counts for an id (zeros until the site has answered). */
  countFor: (id: string) => VoteCounts;
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

function adjust(counts: CountsMap, id: string, before: Vote | null, after: Vote | null): CountsMap {
  const c = { ...(counts[id] ?? NONE) };
  if (before) c[before] = Math.max(0, c[before] - 1);
  if (after) c[after] += 1;
  return { ...counts, [id]: c };
}

export function VotesProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Record<string, Vote>>(loadInitial);
  const [counts, setCounts] = useState<CountsMap>({});
  // Latest map for the vote handler without making it depend on state.
  const mapRef = useRef(map);

  // Everyone's counts on launch and when the network returns; votes made
  // offline go out at the same moments.
  useEffect(() => {
    let alive = true;
    const sync = () => {
      void flushVoteQueue().then(() =>
        fetchCounts()
          .then((c) => {
            if (alive) setCounts(c);
          })
          .catch(() => {}),
      );
    };
    sync();
    window.addEventListener('online', sync);
    return () => {
      alive = false;
      window.removeEventListener('online', sync);
    };
  }, []);

  const vote = useCallback((id: string, next: Vote) => {
    const before = mapRef.current[id] ?? null;
    const after: Vote | null = before === next ? null : next;
    const nextMap = { ...mapRef.current };
    if (after) nextMap[id] = after;
    else delete nextMap[id];
    mapRef.current = nextMap;
    persist(nextMap);
    setMap(nextMap);
    // Optimistic count, then the site's authoritative answer.
    setCounts((prev) => adjust(prev, id, before, after));
    void sendVote({ id, vote: after, prev: before }).then((server) => {
      if (server) setCounts((prev) => ({ ...prev, [id]: server }));
    });
  }, []);

  const value = useMemo<VotesContextValue>(
    () => ({
      voteFor: (id: string) => map[id] ?? null,
      countFor: (id: string) => counts[id] ?? NONE,
      vote,
    }),
    [map, counts, vote],
  );

  return <VotesContext.Provider value={value}>{children}</VotesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVotes(): VotesContextValue {
  const ctx = useContext(VotesContext);
  if (!ctx) throw new Error('useVotes must be used within VotesProvider');
  return ctx;
}
