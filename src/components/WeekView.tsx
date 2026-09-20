import { useSettings } from '../providers/SettingsProvider';
import { useWeekTopShots } from '../hooks/useWeekTopShots';
import { BriefItemCard } from './BriefItemCard';
import { RadarSection } from './RadarSection';
import { TryList } from './TryList';
import { BriefSkeleton, EmptyState, ErrorState } from './states';

/**
 * "This week's top shots": the top story of each of the last seven days as
 * full cards (a Sunday brief may curate the list), then the dates coming up
 * and the things-to-try checklist. The cards browse only — no read state.
 */
export function WeekView() {
  const { t, tryListEnabled } = useSettings();
  const { status, data, reload } = useWeekTopShots();

  if (status === 'loading') return <BriefSkeleton />;
  if (status === 'error' || !data) return <ErrorState onRetry={reload} />;

  return (
    <div className="brief">
      {data.items.length === 0 ? (
        <EmptyState title={t.viewWeek} body={t.weekEmpty} />
      ) : (
        <div className="items">
          {data.items.map((item) => (
            <BriefItemCard key={item.id} item={item} plain />
          ))}
        </div>
      )}
      {data.radar.length > 0 && <RadarSection radar={data.radar} />}
      {tryListEnabled && <TryList />}
    </div>
  );
}
