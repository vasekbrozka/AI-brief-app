import { useMemo, useState, type ReactNode } from 'react';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Segmented } from '../components/Segmented';
import { BriefView } from '../components/BriefView';
import { WeekView } from '../components/WeekView';
import { BriefSkeleton, EmptyState, ErrorState } from '../components/states';
import { ReadRing } from '../components/ReadRing';
import { useLatestBrief } from '../hooks/useBrief';
import { useClockTick } from '../hooks/useClockTick';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { readingMinutes, visibleItems } from '../lib/briefStats';
import {
  brewTitleKey,
  capitalizeFirst,
  formatDateRange,
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
  const { status, data, reload, updated, dates } = useLatestBrief();
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

  // Both views keep the same two-line header (and the scaffold reserves the
  // height), so the switch below never moves when the text changes.
  let subtitle: ReactNode = t.tagline;
  let bar: ReactNode = t.tagline;
  let progress: number | null = null;
  if (view === 'week') {
    // The week view spans the newest seven briefs in the index.
    const span = dates.slice(0, 7);
    const range = span.length
      ? formatDateRange(span[span.length - 1], span[0], lang)
      : '';
    subtitle = (
      <>
        {t.weekSubtitle}
        {range && <span className="large-title__meta">{range}</span>}
      </>
    );
    bar = span.length
      ? `${t.viewWeek} · ${formatDateRange(span[span.length - 1], span[0], lang, false)}`
      : t.weekSubtitle;
  } else if (status === 'ready' && data) {
    const date = capitalizeFirst(formatFullDate(data.date, lang));
    const time = updated ? formatTime(updated, lang) : '';
    // Under the date: how much there is and how long it takes. The update
    // time lives in the floating bar (until the first story is read), so the
    // line stays short enough to sit beside the ring.
    const meta = `${itemCountLabel(shown.length, lang)} · ${readingTimeLabel(readingMinutes(shown, lang), lang)}`;
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
        : time
          ? `${t.updatedLabel} ${time}`
          : itemCountLabel(shown.length, lang)
    }`;
    progress = shown.length ? readCount / shown.length : 0;
  }

  const options: { value: View; label: string }[] = [
    { value: 'today', label: t.viewToday },
    { value: 'week', label: t.viewWeek },
  ];

  // The score sits beside the title as a ring — in view without scrolling
  // (most readers finish the top story and never reach the floating bar) and
  // without adding a line to the header.
  const ring =
    view === 'today' && status === 'ready' && data && shown.length > 0 ? (
      <ReadRing read={readCount} total={shown.length} lang={lang} />
    ) : undefined;

  return (
    <ScreenScaffold
      title={title}
      subtitle={subtitle}
      barContent={bar}
      progress={progress}
      subtitleLines={2}
      accessory={ring}
    >
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
