import { ScreenScaffold } from '../components/ScreenScaffold';
import { Icon } from '../components/Icon';
import { BriefView } from '../components/BriefView';
import { BriefSkeleton, ErrorState } from '../components/states';
import { useBrief } from '../hooks/useBrief';
import { useSettings } from '../providers/SettingsProvider';
import { readingMinutes, visibleItems } from '../lib/briefStats';
import {
  capitalizeFirst,
  formatFullDate,
  formatShortDate,
  itemCountLabel,
  readingTimeLabel,
} from '../lib/format';

export function BriefDetailScreen({ date, onBack }: { date: string; onBack: () => void }) {
  const { t, lang, mutedCategories } = useSettings();
  const { status, data, reload } = useBrief(date);

  const backButton = (
    <button type="button" className="navbtn navbtn--back" onClick={onBack}>
      <Icon name="chevronLeft" size={22} />
      <span>{t.back}</span>
    </button>
  );

  // Same header facts as Today: the date, how many stories, how long.
  const shown = data ? visibleItems(data.items, mutedCategories) : [];
  const subtitle = (
    <>
      {capitalizeFirst(formatFullDate(date, lang))}
      {data && (
        <span className="large-title__meta">
          {itemCountLabel(shown.length, lang)} · {readingTimeLabel(readingMinutes(shown, lang), lang)}
        </span>
      )}
    </>
  );

  return (
    <ScreenScaffold
      title={capitalizeFirst(formatShortDate(date, lang))}
      subtitle={subtitle}
      left={backButton}
    >
      {status === 'loading' && <BriefSkeleton />}
      {status === 'error' && <ErrorState onRetry={reload} />}
      {status === 'ready' && data && <BriefView brief={data} />}
    </ScreenScaffold>
  );
}
