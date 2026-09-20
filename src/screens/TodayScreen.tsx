import { useMemo, useState, type ReactNode } from 'react';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Segmented } from '../components/Segmented';
import { BriefView } from '../components/BriefView';
import { WeekView } from '../components/WeekView';
import { BriefSkeleton, EmptyState, ErrorState } from '../components/states';
import { useLatestBrief } from '../hooks/useBrief';
import { useClockTick } from '../hooks/useClockTick';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { readingMinutes, visibleItems } from '../lib/briefStats';
import {
  brewTitleKey,
  capitalizeFirst,
  formatFullDate,
  formatShortDate,
  formatTime,
  itemCountLabel,
  readProgressLabel,
  readingTimeLabel,
} from '../lib/format';

type View = 'today' | 'week';

/** The Brief tab: today's brief, or the week's top shots, behind one switch. */
export function TodayScreen() {
  const { t, lang, mutedCategories } = useSettings();
  const { isRead } = useRead();
  const { status, data, reload, updated } = useLatestBrief();
  const [view, setView] = useState<View>('today');
  useClockTick();

  // Title changes with the time of day — the brew "cools" as the day goes on.
  const title = t[brewTitleKey()];

  // The header answers the morning questions: what day, how much is there,
  // how long it takes — and, in the floating bar while scrolling, how far
  // the reader already is.
  const shown = useMemo(
    () => (data ? visibleItems(data.items, mutedCategories) : []),
    [data, mutedCategories],
  );
  const readCount = shown.filter((item) => isRead(item.id)).length;

  let subtitle: ReactNode = t.tagline;
  let bar: ReactNode = t.tagline;
  let progress: number | null = null;
  if (view === 'week') {
    subtitle = t.weekSubtitle;
    bar = t.weekSubtitle;
  } else if (status === 'ready' && data) {
    const date = capitalizeFirst(formatFullDate(data.date, lang));
    const time = updated ? formatTime(updated, lang) : '';
    const meta = [
      itemCountLabel(shown.length, lang),
      readingTimeLabel(readingMinutes(shown, lang), lang),
      time ? `${t.updatedLabel} ${time}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    subtitle = (
      <>
        {date}
        <span className="large-title__meta">{meta}</span>
      </>
    );
    const short = capitalizeFirst(formatShortDate(data.date, lang));
    bar = `${short} · ${
      readCount > 0
        ? readProgressLabel(readCount, shown.length, lang)
        : itemCountLabel(shown.length, lang)
    }`;
    progress = shown.length ? readCount / shown.length : 0;
  }

  const options: { value: View; label: string }[] = [
    { value: 'today', label: t.viewToday },
    { value: 'week', label: t.viewWeek },
  ];

  return (
    <ScreenScaffold title={title} subtitle={subtitle} barContent={bar} progress={progress}>
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
