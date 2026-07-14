import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'aibrief.read';

interface ReadContextValue {
  isRead: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
  readCount: number;
}

const ReadContext = createContext<ReadContextValue | null>(null);

function loadInitial(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

function persist(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

export function ReadProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(loadInitial);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persist(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    const empty = new Set<string>();
    persist(empty);
    setIds(empty);
  }, []);

  const value = useMemo<ReadContextValue>(
    () => ({
      isRead: (id: string) => ids.has(id),
      toggle,
      clear,
      readCount: ids.size,
    }),
    [ids, toggle, clear],
  );

  return <ReadContext.Provider value={value}>{children}</ReadContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRead(): ReadContextValue {
  const ctx = useContext(ReadContext);
  if (!ctx) throw new Error('useRead must be used within ReadProvider');
  return ctx;
}
