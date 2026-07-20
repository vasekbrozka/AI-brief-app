import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Glossary, GlossaryEntry } from '../lib/glossary';
import { loadGlossary } from '../lib/briefs';

interface OpenState {
  entry: GlossaryEntry;
  /** Viewport-space rect of the tapped term, for anchoring the popover. */
  rect: DOMRect;
}

interface GlossaryContextValue {
  glossary: Glossary | null;
  open: OpenState | null;
  openTerm: (entry: GlossaryEntry, rect: DOMRect) => void;
  close: () => void;
}

const GlossaryContext = createContext<GlossaryContextValue | null>(null);

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const [glossary, setGlossary] = useState<Glossary | null>(null);
  const [open, setOpen] = useState<OpenState | null>(null);

  useEffect(() => {
    let alive = true;
    // Best-effort: if it fails (offline first run), terms simply stay plain
    // text until the cached copy is available.
    loadGlossary()
      .then((g) => {
        if (alive) setGlossary(g);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const openTerm = useCallback(
    (entry: GlossaryEntry, rect: DOMRect) => setOpen({ entry, rect }),
    [],
  );
  const close = useCallback(() => setOpen(null), []);

  return (
    <GlossaryContext.Provider value={{ glossary, open, openTerm, close }}>
      {children}
    </GlossaryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGlossary(): GlossaryContextValue {
  const ctx = useContext(GlossaryContext);
  if (!ctx) throw new Error('useGlossary must be used within GlossaryProvider');
  return ctx;
}
