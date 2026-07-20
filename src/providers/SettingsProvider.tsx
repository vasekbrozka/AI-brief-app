import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CategoryId, Lang } from '../lib/types';
import { CATEGORY_ORDER } from '../lib/categories';
import { STRINGS, type UIStrings } from '../i18n/strings';

export type Theme = 'auto' | 'light' | 'dark';

interface SettingsContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  hideRead: boolean;
  setHideRead: (v: boolean) => void;
  /** Categories the reader has hidden from the brief. */
  mutedCategories: CategoryId[];
  toggleCategory: (id: CategoryId) => void;
  /** Reading streak / closing ritual — on by default, fully optional. */
  gamification: boolean;
  setGamification: (v: boolean) => void;
  /** Tap-to-explain glossary for AI terms — on by default, fully optional. */
  glossaryEnabled: boolean;
  setGlossaryEnabled: (v: boolean) => void;
  /** Localized UI strings for the current language. */
  t: UIStrings;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const LANG_KEY = 'aibrief.lang';
const THEME_KEY = 'aibrief.theme';
const HIDE_READ_KEY = 'aibrief.hideRead';
// One-time marker: the out-of-the-box default for hide-read changed to ON, so
// existing installs (which auto-saved the old OFF default) adopt it once. After
// that, the reader's own choice is respected.
const HIDE_READ_DEFAULTED_KEY = 'aibrief.hideRead.default2';
const MUTED_CATEGORIES_KEY = 'aibrief.mutedCategories';
const GAMIFICATION_KEY = 'aibrief.gamification';
const GLOSSARY_KEY = 'aibrief.glossary';

function detectInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'cs' || stored === 'en') return stored;
  } catch {
    /* localStorage may be unavailable */
  }
  const nav = navigator.language?.toLowerCase() ?? '';
  return nav.startsWith('cs') || nav.startsWith('sk') ? 'cs' : 'en';
}

function detectInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'auto' || stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage may be unavailable */
  }
  return 'auto';
}

function detectInitialHideRead(): boolean {
  try {
    // Reading-focused default: hide-read is ON out of the box so the brief
    // empties as you read and the streak takes the spotlight. Existing installs
    // adopt the new default once (guarded by the marker below); afterwards the
    // reader's explicit choice wins.
    if (localStorage.getItem(HIDE_READ_DEFAULTED_KEY) !== '1') return true;
    return localStorage.getItem(HIDE_READ_KEY) !== '0';
  } catch {
    return true;
  }
}

function detectInitialMuted(): CategoryId[] {
  try {
    const raw = localStorage.getItem(MUTED_CATEGORIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return CATEGORY_ORDER.filter((c) => parsed.includes(c));
  } catch {
    return [];
  }
}

function detectInitialGamification(): boolean {
  try {
    // Default on — only an explicit "0" disables it.
    return localStorage.getItem(GAMIFICATION_KEY) !== '0';
  } catch {
    return true;
  }
}

function detectInitialGlossary(): boolean {
  try {
    // Default on — only an explicit "0" disables it.
    return localStorage.getItem(GLOSSARY_KEY) !== '0';
  } catch {
    return true;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectInitialLang);
  const [theme, setTheme] = useState<Theme>(detectInitialTheme);
  const [hideRead, setHideRead] = useState<boolean>(detectInitialHideRead);
  const [mutedCategories, setMutedCategories] = useState<CategoryId[]>(detectInitialMuted);
  const [gamification, setGamification] = useState<boolean>(detectInitialGamification);
  const [glossaryEnabled, setGlossaryEnabled] = useState<boolean>(detectInitialGlossary);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
    const root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(HIDE_READ_KEY, hideRead ? '1' : '0');
      // Mark the new hide-read default as applied so the one-time adoption
      // above never runs again on this install.
      localStorage.setItem(HIDE_READ_DEFAULTED_KEY, '1');
    } catch {
      /* ignore */
    }
  }, [hideRead]);

  useEffect(() => {
    try {
      localStorage.setItem(MUTED_CATEGORIES_KEY, JSON.stringify(mutedCategories));
    } catch {
      /* ignore */
    }
  }, [mutedCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(GAMIFICATION_KEY, gamification ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [gamification]);

  useEffect(() => {
    try {
      localStorage.setItem(GLOSSARY_KEY, glossaryEnabled ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [glossaryEnabled]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang((prev) => (prev === 'cs' ? 'en' : 'cs')),
      theme,
      setTheme,
      hideRead,
      setHideRead,
      mutedCategories,
      toggleCategory: (id: CategoryId) =>
        setMutedCategories((prev) =>
          prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
        ),
      gamification,
      setGamification,
      glossaryEnabled,
      setGlossaryEnabled,
      t: STRINGS[lang],
    }),
    [lang, theme, hideRead, mutedCategories, gamification, glossaryEnabled],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
