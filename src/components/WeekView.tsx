import { useSettings } from '../providers/SettingsProvider';
import { useWeekTopShots } from '../hooks/useWeekTopShots';
import { BriefItemCard } from './BriefItemCard';
import { RadarSection } from './RadarSection';
import { BriefSkeleton, EmptyState, ErrorState } from './states';

/**
 * "This week's top shots": the top story of each of the last seven days as
 * full cards (a Sunday brief may curate the list), then the dates coming up.
 * The cards browse only — no read state.
 */
export function WeekView() {
  const { t } = useSettings();
  const { status, data, reload } = useWeekTopShots();

  if (status === 'loading') return <BriefSkeleton />;
  if (status === 'error' || !data) return <ErrorState onRetry={reload} />;

  return (
    <div className="brief">
      <div className="brief__main">
        {data.items.length === 0 ? (
          <EmptyState title={t.viewWeek} body={t.weekEmpty} />
        ) : (
          <div className="items">
            {data.items.map((item) => (
              <BriefItemCard key={item.id} item={item} plain />
            ))}
          </div>
        )}
      </div>
      {data.radar.length > 0 && (
        <aside className="brief__side">
          <RadarSection radar={data.radar} />
        </aside>
      )}
    </div>
  );
}
