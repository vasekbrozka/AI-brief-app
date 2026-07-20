import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'aibrief.streak';

interface StreakState {
  streak: number;
  lastFinished: string | null; // ISO date of the last day the brief was cleared
}

interface StreakContextValue {
  /** Streak that's still alive (finished today or yesterday), otherwise 0. */
  currentStreak: number;
  /** Whether today has already been counted. */
  finishedToday: boolean;
  /** Record that today's brief was cleared. Idempotent within a calendar day. */
  markFinished: () => void;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayISO(): string {
  return isoOf(new Date());
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return isoOf(d);
}

function load(): StreakState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<StreakState>;
      if (
        typeof p.streak === 'number' &&
        (p.lastFinished === null || typeof p.lastFinished === 'string')
      ) {
        return { streak: p.streak, lastFinished: p.lastFinished ?? null };
      }
    }
  } catch {
    /* ignore */
  }
  return { streak: 0, lastFinished: null };
}

const StreakContext = createContext<StreakContextValue | null>(null);

export function StreakProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StreakState>(load);

  const markFinished = useCallback(() => {
    setState((prev) => {
      const today = todayISO();
      if (prev.lastFinished === today) return prev; // already counted today
      const streak = prev.lastFinished === yesterdayISO() ? prev.streak + 1 : 1;
      const next: StreakState = { streak, lastFinished: today };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<StreakContextValue>(() => {
    const alive = state.lastFinished === todayISO() || state.lastFinished === yesterdayISO();
    return {
      currentStreak: alive ? state.streak : 0,
      finishedToday: state.lastFinished === todayISO(),
      markFinished,
    };
  }, [state, markFinished]);

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStreak(): StreakContextValue {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error('useStreak must be used within StreakProvider');
  return ctx;
}
