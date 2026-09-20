import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isTip, type BriefItem, type Localized, type Source, type TipEntry } from '../lib/types';

// The reader's To do list: stories and tips kept for later, ticked off when
// done. Local to the device, like read and saved state. Snapshots, not ids,
// so an item keeps rendering after its day leaves the archive.
const STORAGE_KEY = 'aibrief.todo';
// The old "Try it yourself" ticks (tip slug → date), read once so tips the
// reader already tried never come back as suggestions.
const LEGACY_TRIED_KEY = 'aibrief.tried';

export interface TodoItem {
  /** Story id, or `tip:<slug>` for a tip (the same tip from a card and from the backlog share it). */
  key: string;
  kind: 'story' | 'tip';
  title: Localized;
  /** What to do or why it matters: a tip's how-to, a story's "why" (or its summary). */
  note?: Localized;
  /** Primary link to open. */
  source?: Source;
  /** ISO date of the brief or the tip's publication. */
  date?: string;
  /** ISO date the item was added. */
  added: string;
  /** ISO date it was ticked off; null while open. */
  done: string | null;
}

export type TodoDraft = Omit<TodoItem, 'added' | 'done'>;

interface TodoContextValue {
  /** Every item, newest first. */
  items: TodoItem[];
  has: (key: string) => boolean;
  add: (draft: TodoDraft) => void;
  remove: (key: string) => void;
  toggleDone: (key: string) => void;
  clearDone: () => void;
  /** Tip slugs ticked in the old checklist — kept out of the suggestions. */
  legacyTried: ReadonlySet<string>;
  openCount: number;
  doneCount: number;
}

const TodoContext = createContext<TodoContextValue | null>(null);

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;

/** A story (or a tip card) from a brief as a To do draft. */
export function todoFromStory(item: BriefItem): TodoDraft {
  const date = DATE_PREFIX.exec(item.id)?.[0];
  const tip = isTip(item);
  return {
    key: tip ? `tip:${item.id.replace(/^\d{4}-\d{2}-\d{2}-/, '')}` : item.id,
    kind: tip ? 'tip' : 'story',
    title: item.title,
    note: item.why ?? item.summary,
    source: item.sources[0],
    date: date ?? item.eventDate,
  };
}

/** A tip from the backlog as a To do draft. */
export function todoFromTip(tip: TipEntry): TodoDraft {
  return {
    key: `tip:${tip.slug}`,
    kind: 'tip',
    title: tip.title,
    note: tip.why ?? tip.summary,
    source: tip.sources[0],
    date: tip.used ?? tip.added,
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadInitial(): TodoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed as TodoItem[];
    }
  } catch {
    /* ignore */
  }
  return [];
}

function loadLegacyTried(): Set<string> {
  try {
    const raw = localStorage.getItem(LEGACY_TRIED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return new Set(Object.keys(parsed as Record<string, string>));
      }
    }
  } catch {
    /* ignore */
  }
  return new Set();
}

function persist(items: TodoItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<TodoItem[]>(loadInitial);
  const [legacyTried] = useState<Set<string>>(loadLegacyTried);

  const add = useCallback((draft: TodoDraft) => {
    setItems((prev) => {
      if (prev.some((i) => i.key === draft.key)) return prev;
      const next = [{ ...draft, added: today(), done: null }, ...prev];
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.key !== key);
      persist(next);
      return next;
    });
  }, []);

  const toggleDone = useCallback((key: string) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.key === key ? { ...i, done: i.done ? null : today() } : i));
      persist(next);
      return next;
    });
  }, []);

  const clearDone = useCallback(() => {
    setItems((prev) => {
      const next = prev.filter((i) => !i.done);
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo<TodoContextValue>(() => {
    const keys = new Set(items.map((i) => i.key));
    const doneCount = items.filter((i) => i.done).length;
    return {
      items,
      has: (key: string) => keys.has(key),
      add,
      remove,
      toggleDone,
      clearDone,
      legacyTried,
      openCount: items.length - doneCount,
      doneCount,
    };
  }, [items, add, remove, toggleDone, clearDone, legacyTried]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTodo(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodo must be used within TodoProvider');
  return ctx;
}
