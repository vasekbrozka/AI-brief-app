import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface ProgressValue {
  read: number;
  total: number;
  /** The brief screen reports its counts; the top bar shows them. */
  report: (read: number, total: number) => void;
}

const ProgressContext = createContext<ProgressValue>({ read: 0, total: 0, report: () => {} });

/**
 * The day's reading progress, lifted out of the brief screen so the desktop
 * top bar can show it. On a phone the bar has no room for it and the header
 * carries it instead.
 */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ read: 0, total: 0 });
  const value = useMemo<ProgressValue>(
    () => ({
      ...state,
      report: (read: number, total: number) =>
        setState((prev) => (prev.read === read && prev.total === total ? prev : { read, total })),
    }),
    [state],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress(): ProgressValue {
  return useContext(ProgressContext);
}
