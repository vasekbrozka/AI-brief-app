import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

// Which tips the reader has ticked off in "Try it yourself": tip slug → ISO
// date. Local to the device, like read and saved state.
const STORAGE_KEY = 'aibrief.tried';

interface TriedContextValue {
  isTried: (slug: string) => boolean;
  toggle: (slug: string) => void;
  triedCount: number;
}

const TriedContext = createContext<TriedContextValue | null>(null);

function loadInitial(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, string>;
      }
    }
  } catch {
    /* ignore */
  }
  return {};
}

function persist(map: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function TriedProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Record<string, string>>(loadInitial);

  const toggle = useCallback((slug: string) => {
    setMap((prev) => {
      const next = { ...prev };
      if (next[slug]) delete next[slug];
      else next[slug] = new Date().toISOString().slice(0, 10);
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo<TriedContextValue>(
    () => ({
      isTried: (slug: string) => Boolean(map[slug]),
      toggle,
      triedCount: Object.keys(map).length,
    }),
    [map, toggle],
  );

  return <TriedContext.Provider value={value}>{children}</TriedContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTried(): TriedContextValue {
  const ctx = useContext(TriedContext);
  if (!ctx) throw new Error('useTried must be used within TriedProvider');
  return ctx;
}
