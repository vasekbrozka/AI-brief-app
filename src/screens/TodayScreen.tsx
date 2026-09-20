import { useState } from 'react';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Segmented } from '../components/Segmented';
import { BriefView } from '../components/BriefView';
import { WeekView } from '../components/WeekView';
import { BriefSkeleton, EmptyState, ErrorState } from '../components/states';
import { useLatestBrief } from '../hooks/useBrief';
import { useClockTick } from '../hooks/useClockTick';
import { useSettings } from '../providers/SettingsProvider';
import { brewTitleKey, capitalizeFirst, formatFullDate, formatTime } from '../lib/format';

type View = 'today' | 'week';

/** The Brief tab: today's brief, or the week's top shots, behind one switch. */
export function TodayScreen() {
  const { t, lang } = useSettings();
  const { status, data, reload, updated } = useLatestBrief();
  const [view, setView] = useState<View>('today');
  useClockTick();

  // Title changes with the time of day — the brew "cools" as the day goes on.
  const title = t[brewTitleKey()];

  let subtitle = t.tagline;
  if (view === 'week') {
    subtitle = t.weekSubtitle;
  } else if (status === 'ready' && data) {
    subtitle = capitalizeFirst(formatFullDate(data.date, lang));
    const time = updated ? formatTime(updated, lang) : '';
    if (time) subtitle += ` · ${t.updatedLabel} ${time}`;
  }

  const options: { value: View; label: string }[] = [
    { value: 'today', label: t.viewToday },
    { value: 'week', label: t.viewWeek },
  ];

  return (
    <ScreenScaffold title={title} subtitle={subtitle} barContent={subtitle}>
      <div className="view-switch">
        <Segmented value={view} onChange={setView} options={options} ariaLabel={t.tabToday} />
      </div>
      {view === 'week' ? (
        <WeekView />
      ) : (
        <>
          {status === 'loading' && <BriefSkeleton />}
          {status === 'error' && <ErrorState onRetry={reload} />}
          {status === 'ready' && !data && (
            <EmptyState title={t.todayEmptyTitle} body={t.todayEmptyBody} />
          )}
          {status === 'ready' && data && <BriefView brief={data} isToday />}
        </>
      )}
    </ScreenScaffold>
  );
}
