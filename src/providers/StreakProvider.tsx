import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'aibrief.streak';
const READ_KEY = 'aibrief.read'; // ReadProvider's ids, "<date>-slug" — the reading history
const KEEP_DAYS = 45; // prune finished-day history beyond this

export interface WeekDay {
  iso: string;
  done: boolean;
  isToday: boolean;
  isFuture: boolean;
}

interface StreakContextValue {
  /** Consecutive finished days ending today or yesterday, otherwise 0. */
  currentStreak: number;
  /** Whether today's brief has already been counted. */
  finishedToday: boolean;
  /** This calendar week, Monday → Sunday, for the dot row. */
  week: WeekDay[];
  /** Record that the brief of `iso` (default today) counts. Idempotent per day. */
  markFinished: (iso?: string) => void;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromISO(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/**
 * Days with at least one story read, taken from the read ids ("<date>-slug").
 * A day counts as soon as one story is read, so the reading history is the
 * truth; this also repairs streaks recorded under the old all-read rule.
 */
function daysFromReadIds(cutoff: string): Set<string> {
  const out = new Set<string>();
  try {
    const raw = localStorage.getItem(READ_KEY);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(ids)) {
      for (const id of ids) {
        const m = typeof id === 'string' ? /^(\d{4}-\d{2}-\d{2})-/.exec(id) : null;
        if (m && m[1] >= cutoff) out.add(m[1]);
      }
    }
  } catch {
    /* ignore */
  }
  return out;
}

/** Load the set of finished days, migrating the old {streak,lastFinished} shape. */
function load(): Set<string> {
  const cutoff = isoOf(addDays(new Date(), -KEEP_DAYS));
  const set = daysFromReadIds(cutoff);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const p = raw
      ? (JSON.parse(raw) as { finished?: unknown; streak?: unknown; lastFinished?: unknown })
      : {};
    if (Array.isArray(p.finished)) {
      for (const x of p.finished) if (typeof x === 'string' && x >= cutoff) set.add(x);
    } else if (typeof p.streak === 'number' && p.streak >= 1 && typeof p.lastFinished === 'string') {
      // Oldest shape: reconstruct a consecutive run ending at lastFinished.
      let d = fromISO(p.lastFinished);
      for (let i = 0; i < p.streak; i++) {
        set.add(isoOf(d));
        d = addDays(d, -1);
      }
    }
  } catch {
    /* ignore */
  }
  return set;
}

function persist(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ finished: [...set] }));
  } catch {
    /* ignore */
  }
}

function streakEndingAt(set: Set<string>, endISO: string): number {
  let count = 0;
  let d = fromISO(endISO);
  while (set.has(isoOf(d))) {
    count += 1;
    d = addDays(d, -1);
  }
  return count;
}

const StreakContext = createContext<StreakContextValue | null>(null);

export function StreakProvider({ children }: { children: ReactNode }) {
  const [finished, setFinished] = useState<Set<string>>(load);

  const markFinished = useCallback((iso?: string) => {
    setFinished((prev) => {
      const day = iso ?? isoOf(new Date());
      if (prev.has(day)) return prev;
      const next = new Set(prev);
      next.add(day);
      // Prune anything older than KEEP_DAYS.
      const cutoff = isoOf(addDays(new Date(), -KEEP_DAYS));
      for (const iso of next) if (iso < cutoff) next.delete(iso);
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo<StreakContextValue>(() => {
    const now = new Date();
    const today = isoOf(now);
    const yesterday = isoOf(addDays(now, -1));

    let currentStreak = 0;
    if (finished.has(today)) currentStreak = streakEndingAt(finished, today);
    else if (finished.has(yesterday)) currentStreak = streakEndingAt(finished, yesterday);

    // Monday (0) … Sunday (6) of the current week.
    const dow = (now.getDay() + 6) % 7;
    const monday = addDays(now, -dow);
    const week: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
      const iso = isoOf(addDays(monday, i));
      return { iso, done: finished.has(iso), isToday: iso === today, isFuture: iso > today };
    });

    return { currentStreak, finishedToday: finished.has(today), week, markFinished };
  }, [finished, markFinished]);

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStreak(): StreakContextValue {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error('useStreak must be used within StreakProvider');
  return ctx;
}
