import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Segmented } from '../components/Segmented';
import { BriefView } from '../components/BriefView';
import { WeekView } from '../components/WeekView';
import { BriefSkeleton, EmptyState, ErrorState } from '../components/states';
import { ReadBars } from '../components/ReadBars';
import { useLatestBrief } from '../hooks/useBrief';
import { useClockTick } from '../hooks/useClockTick';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { useProgress } from '../providers/ProgressProvider';
import { DESKTOP_QUERY, useMediaQuery } from '../hooks/useMedia';
import { readingMinutes, visibleItems } from '../lib/briefStats';
import {
  brewTitleKey,
  capitalizeFirst,
  formatDateRange,
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
  const { status, data, reload, updated, dates } = useLatestBrief();
  // A wide screen shows the day and the week side by side, so it needs no
  // switch between them; the phone keeps it.
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const { report } = useProgress();
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

  // The header is two rows: the title, and one quiet line under it — the
  // day's numbers on the left, the reading bars on the right. The date lives
  // in the floating bar, where it is in view exactly while the large title
  // is not. Both views fill the same two rows, so the switch below never
  // moves.
  let metaText: string = t.tagline;
  let bars: ReactNode = null;
  let bar: ReactNode = t.tagline;
  let progress: number | null = null;
  if (view === 'week') {
    // The week view spans the newest seven briefs in the index.
    const span = dates.slice(0, 7);
    metaText = t.weekSubtitle;
    if (span.length) {
      const from = span[span.length - 1];
      const to = span[0];
      bar = `${t.viewWeek} · ${formatDateRange(from, to, lang, false)}`;
    } else {
      bar = t.weekSubtitle;
    }
  } else if (status === 'ready' && data) {
    const time = updated ? formatTime(updated, lang) : '';
    // Before the first story: how much there is. After it: how far in.
    metaText = `${
      readCount > 0 ? readProgressLabel(readCount, shown.length, lang) : itemCountLabel(shown.length, lang)
    } · ${readingTimeLabel(readingMinutes(shown, lang), lang)}`;
    bars = shown.length ? <ReadBars read={readCount} total={shown.length} lang={lang} /> : null;
    const short = capitalizeFirst(formatShortDate(data.date, lang));
    bar = `${short} · ${
      readCount > 0
        ? readProgressLabel(readCount, shown.length, lang)
        : time
          ? `${t.updatedLabel} ${time}`
          : itemCountLabel(shown.length, lang)
    }`;
    progress = shown.length ? readCount / shown.length : 0;
  }

  const subtitle = (
    <div className="headmeta">
      <span className="headmeta__text">{metaText}</span>
      {bars}
    </div>
  );

  // The top bar shows the day's progress on a desktop; it is the brief screen
  // that knows the counts, so it hands them over (and clears them on the way
  // out, where no brief is on screen).
  const total = view === 'today' && status === 'ready' && data ? shown.length : 0;
  useEffect(() => {
    report(total ? readCount : 0, total);
    return () => report(0, 0);
  }, [report, readCount, total]);

  useEffect(() => {
    if (desktop && view === 'week') setView('today');
  }, [desktop, view]);

  const options: { value: View; label: string }[] = [
    { value: 'today', label: t.viewToday },
    { value: 'week', label: t.viewWeek },
  ];

  // Desktop: the date rides above the title, where the mobile header has no
  // room for it (there it appears in the floating bar while scrolling).
  const kicker =
    view === 'today' && status === 'ready' && data
      ? `${capitalizeFirst(formatShortDate(data.date, lang))}${
          updated ? ` · ${t.updatedLabel} ${formatTime(updated, lang)}` : ''
        }`
      : undefined;

  return (
    <ScreenScaffold
      title={title}
      subtitle={subtitle}
      barContent={bar}
      progress={progress}
      kicker={kicker}
      className={desktop && view === 'today' ? 'screen--reader' : undefined}
      headerAside={
        desktop ? undefined : (
          <div className="view-switch">
            <Segmented value={view} onChange={setView} options={options} ariaLabel={t.tabToday} />
          </div>
        )
      }
      wide
    >
      {view === 'week' ? (
        <WeekView />
      ) : (
        <>
          {status === 'loading' && <BriefSkeleton />}
          {status === 'error' && <ErrorState onRetry={reload} />}
          {status === 'ready' && !data && (
            <EmptyState title={t.todayEmptyTitle} body={t.todayEmptyBody} />
          )}
          {status === 'ready' && data && <BriefView brief={data} isToday focus={desktop} />}
        </>
      )}
    </ScreenScaffold>
  );
}
