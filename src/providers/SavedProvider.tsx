import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { BriefItem } from '../lib/types';

const STORAGE_KEY = 'aibrief.saved';

interface SavedContextValue {
  isSaved: (id: string) => boolean;
  /** Save if not saved, remove if it is. */
  toggle: (item: BriefItem) => void;
  /** Saved item snapshots, newest first. */
  saved: BriefItem[];
  savedCount: number;
}

const SavedContext = createContext<SavedContextValue | null>(null);

// Store the full item snapshot, not just its id: a saved story must keep
// rendering even after its day scrolls out of the 7-day archive window.
function loadInitial(): BriefItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as BriefItem[];
    }
  } catch {
    /* ignore */
  }
  return [];
}

function persist(items: BriefItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BriefItem[]>(loadInitial);

  const toggle = useCallback((item: BriefItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      const next = exists ? prev.filter((i) => i.id !== item.id) : [item, ...prev];
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo<SavedContextValue>(
    () => ({
      isSaved: (id: string) => items.some((i) => i.id === id),
      toggle,
      saved: items,
      savedCount: items.length,
    }),
    [items, toggle],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used within SavedProvider');
  return ctx;
}
