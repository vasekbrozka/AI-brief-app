import { useState } from 'react';
import { TabBar, type Tab } from './components/TabBar';
import { TodayScreen } from './screens/TodayScreen';
import { ArchiveScreen } from './screens/ArchiveScreen';
import { BriefDetailScreen } from './screens/BriefDetailScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [archiveDate, setArchiveDate] = useState<string | null>(null);

  function handleTab(next: Tab) {
    // Tapping "Archive" again while inside a brief returns to the list.
    if (next !== 'archive' || tab === 'archive') setArchiveDate(null);
    setTab(next);
  }

  return (
    <div className="app">
      <main className="app__main">
        {tab === 'today' && <TodayScreen />}
        {tab === 'archive' &&
          (archiveDate ? (
            <BriefDetailScreen date={archiveDate} onBack={() => setArchiveDate(null)} />
          ) : (
            <ArchiveScreen onSelect={setArchiveDate} />
          ))}
        {tab === 'settings' && <SettingsScreen />}
      </main>
      <TabBar active={tab} onChange={handleTab} />
    </div>
  );
}
