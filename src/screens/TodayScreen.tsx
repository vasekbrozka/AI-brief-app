import { ScreenScaffold } from '../components/ScreenScaffold';
import { BriefView } from '../components/BriefView';
import { BriefSkeleton, EmptyState, ErrorState } from '../components/states';
import { useLatestBrief } from '../hooks/useBrief';
import { useClockTick } from '../hooks/useClockTick';
import { useSettings } from '../providers/SettingsProvider';
import { brewTitleKey, capitalizeFirst, formatFullDate, formatTime } from '../lib/format';

export function TodayScreen() {
  const { t, lang } = useSettings();
  const { status, data, reload, updated } = useLatestBrief();
  useClockTick();

  // Title changes with the time of day — the brew "cools" as the day goes on.
  const title = t[brewTitleKey()];

  let subtitle = t.tagline;
  if (status === 'ready' && data) {
    subtitle = capitalizeFirst(formatFullDate(data.date, lang));
    const time = updated ? formatTime(updated, lang) : '';
    if (time) subtitle += ` · ${t.updatedLabel} ${time}`;
  }

  return (
    <ScreenScaffold title={title} subtitle={subtitle} barContent={subtitle}>
      {status === 'loading' && <BriefSkeleton />}
      {status === 'error' && <ErrorState onRetry={reload} />}
      {status === 'ready' && !data && (
        <EmptyState title={t.todayEmptyTitle} body={t.todayEmptyBody} />
      )}
      {status === 'ready' && data && <BriefView brief={data} isToday />}
    </ScreenScaffold>
  );
}
