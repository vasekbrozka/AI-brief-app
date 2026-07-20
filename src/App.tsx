import { useCallback, useMemo, useState } from 'react';
import { TabBar, type Tab } from './components/TabBar';
import { Toaster } from './components/Toaster';
import { NavProvider } from './providers/NavProvider';
import { TodayScreen } from './screens/TodayScreen';
import { ArchiveScreen } from './screens/ArchiveScreen';
import { BriefDetailScreen } from './screens/BriefDetailScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AboutScreen } from './screens/AboutScreen';
import { SavedScreen } from './screens/SavedScreen';

export function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [archiveDate, setArchiveDate] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  function handleTab(next: Tab) {
    // Tapping "Archive" again while inside a brief returns to the list.
    if (next !== 'archive' || tab === 'archive') setArchiveDate(null);
    // Tapping "Settings" again while in About returns to the settings list.
    if (next !== 'settings' || tab === 'settings') setAboutOpen(false);
    // Tapping "Today" again while in Saved returns to the brief.
    if (next !== 'today' || tab === 'today') setSavedOpen(false);
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
          {tab === 'today' &&
            (savedOpen ? (
              <SavedScreen onBack={closeSaved} />
            ) : (
              <TodayScreen onOpenSaved={openSaved} />
            ))}
          {tab === 'archive' &&
            (archiveDate ? (
              <BriefDetailScreen date={archiveDate} onBack={() => setArchiveDate(null)} />
            ) : (
              <ArchiveScreen onSelect={setArchiveDate} />
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
