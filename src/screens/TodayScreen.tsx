import { ScreenScaffold } from '../components/ScreenScaffold';
import { LangToggle } from '../components/LangToggle';
import { BriefView } from '../components/BriefView';
import { InstallHint } from '../components/InstallHint';
import { BriefSkeleton, EmptyState, ErrorState } from '../components/states';
import { useLatestBrief } from '../hooks/useBrief';
import { useSettings } from '../providers/SettingsProvider';
import { capitalizeFirst, formatFullDate } from '../lib/format';

export function TodayScreen() {
  const { t, lang } = useSettings();
  const { status, data, reload } = useLatestBrief();

  const subtitle =
    status === 'ready' && data ? capitalizeFirst(formatFullDate(data.date, lang)) : t.tagline;

  return (
    <ScreenScaffold title={t.todayTitle} subtitle={subtitle} right={<LangToggle />}>
      <InstallHint />
      {status === 'loading' && <BriefSkeleton />}
      {status === 'error' && <ErrorState onRetry={reload} />}
      {status === 'ready' && !data && (
        <EmptyState title={t.todayEmptyTitle} body={t.todayEmptyBody} />
      )}
      {status === 'ready' && data && <BriefView brief={data} />}
    </ScreenScaffold>
  );
}
