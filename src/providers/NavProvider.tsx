import { createContext, useContext, type ReactNode } from 'react';

interface NavContextValue {
  /** Open a specific archived brief by ISO date (used by story-thread links). */
  openBriefDate: (date: string) => void;
}

const NavContext = createContext<NavContextValue>({ openBriefDate: () => {} });

export function NavProvider({
  value,
  children,
}: {
  value: NavContextValue;
  children: ReactNode;
}) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNav(): NavContextValue {
  return useContext(NavContext);
}
