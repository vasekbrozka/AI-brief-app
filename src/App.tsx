import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TabBar, type Tab } from './components/TabBar';
import { Toaster } from './components/Toaster';
import { NavProvider } from './providers/NavProvider';
import { useSettings } from './providers/SettingsProvider';
import { TodayScreen } from './screens/TodayScreen';
import { TodoScreen } from './screens/TodoScreen';
import { ArchiveScreen } from './screens/ArchiveScreen';
import { BriefDetailScreen } from './screens/BriefDetailScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AboutScreen } from './screens/AboutScreen';
import { SavedScreen } from './screens/SavedScreen';

export function App() {
  const { todoEnabled } = useSettings();
  const [tab, setTab] = useState<Tab>('today');
  const [archiveDate, setArchiveDate] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  // Turning To do off in Settings while standing on it lands back on the brief.
  useEffect(() => {
    if (!todoEnabled && tab === 'todo') setTab('today');
  }, [todoEnabled, tab]);

  // Every tab keeps its own scroll position (one window scrolls for all of
  // them): leaving a tab remembers where it was, coming back restores it, and
  // a tab opened for the first time starts at the top.
  const scrollByTab = useRef<Partial<Record<Tab, number>>>({});
  useLayoutEffect(() => {
    window.scrollTo({ top: scrollByTab.current[tab] ?? 0 });
  }, [tab]);

  function handleTab(next: Tab) {
    scrollByTab.current[tab] = window.scrollY;
    // Tapping "Archive" again returns to the list — from a brief or from Saved.
    if (next !== 'archive' || tab === 'archive') {
      setArchiveDate(null);
      setSavedOpen(false);
    }
    // Tapping "Settings" again while in About returns to the settings list.
    if (next !== 'settings' || tab === 'settings') setAboutOpen(false);
    setTab(next);
  }

  const openAbout = useCallback(() => {
    setAboutOpen(true);
    window.scrollTo({ top: 0 });
  }, []);
  const closeAbout = useCallback(() => {
    setAboutOpen(false);
    window.scrollTo({ top: 0 });
  }, []);
  const openSaved = useCallback(() => {
    setSavedOpen(true);
    window.scrollTo({ top: 0 });
  }, []);
  const closeSaved = useCallback(() => {
    setSavedOpen(false);
    window.scrollTo({ top: 0 });
  }, []);

  // Story-thread links jump straight to an archived brief.
  const openBriefDate = useCallback((date: string) => {
    setArchiveDate(date);
    setTab('archive');
    window.scrollTo({ top: 0 });
  }, []);

  const nav = useMemo(() => ({ openBriefDate }), [openBriefDate]);

  return (
    <NavProvider value={nav}>
      <div className="app">
        <main className="app__main">
          {tab === 'today' && <TodayScreen />}
          {tab === 'todo' && <TodoScreen />}
          {tab === 'archive' &&
            (savedOpen ? (
              <SavedScreen onBack={closeSaved} />
            ) : archiveDate ? (
              <BriefDetailScreen date={archiveDate} onBack={() => setArchiveDate(null)} />
            ) : (
              <ArchiveScreen onSelect={setArchiveDate} onOpenSaved={openSaved} />
            ))}
          {tab === 'settings' &&
            (aboutOpen ? (
              <AboutScreen onBack={closeAbout} />
            ) : (
              <SettingsScreen onOpenAbout={openAbout} />
            ))}
        </main>
        <TabBar active={tab} onChange={handleTab} />
      </div>
      <Toaster />
    </NavProvider>
  );
}
