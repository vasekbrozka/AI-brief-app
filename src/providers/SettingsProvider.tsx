import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Lang } from '../lib/types';
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
  showCategories: boolean;
  setShowCategories: (v: boolean) => void;
  /** Localized UI strings for the current language. */
  t: UIStrings;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const LANG_KEY = 'aibrief.lang';
const THEME_KEY = 'aibrief.theme';
const HIDE_READ_KEY = 'aibrief.hideRead';
const SHOW_CATEGORIES_KEY = 'aibrief.showCategories';

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
    return localStorage.getItem(HIDE_READ_KEY) === '1';
  } catch {
    return false;
  }
}

function detectInitialShowCategories(): boolean {
  try {
    return localStorage.getItem(SHOW_CATEGORIES_KEY) === '1';
  } catch {
    return false;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectInitialLang);
  const [theme, setTheme] = useState<Theme>(detectInitialTheme);
  const [hideRead, setHideRead] = useState<boolean>(detectInitialHideRead);
  const [showCategories, setShowCategories] = useState<boolean>(detectInitialShowCategories);

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
    } catch {
      /* ignore */
    }
  }, [hideRead]);

  useEffect(() => {
    try {
      localStorage.setItem(SHOW_CATEGORIES_KEY, showCategories ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [showCategories]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang((prev) => (prev === 'cs' ? 'en' : 'cs')),
      theme,
      setTheme,
      hideRead,
      setHideRead,
      showCategories,
      setShowCategories,
      t: STRINGS[lang],
    }),
    [lang, theme, hideRead, showCategories],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
