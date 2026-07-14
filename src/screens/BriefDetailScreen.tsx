import { ScreenScaffold } from '../components/ScreenScaffold';
import { LangToggle } from '../components/LangToggle';
import { Icon } from '../components/Icon';
import { BriefView } from '../components/BriefView';
import { BriefSkeleton, ErrorState } from '../components/states';
import { useBrief } from '../hooks/useBrief';
import { useSettings } from '../providers/SettingsProvider';
import { capitalizeFirst, formatFullDate, formatShortDate } from '../lib/format';

export function BriefDetailScreen({ date, onBack }: { date: string; onBack: () => void }) {
  const { t, lang } = useSettings();
  const { status, data, reload } = useBrief(date);

  const backButton = (
    <button type="button" className="navbtn navbtn--back" onClick={onBack}>
      <Icon name="chevronLeft" size={22} />
      <span>{t.back}</span>
    </button>
  );

  return (
    <ScreenScaffold
      title={capitalizeFirst(formatShortDate(date, lang))}
      subtitle={capitalizeFirst(formatFullDate(date, lang))}
      left={backButton}
      right={<LangToggle />}
    >
      {status === 'loading' && <BriefSkeleton />}
      {status === 'error' && <ErrorState onRetry={reload} />}
      {status === 'ready' && data && <BriefView brief={data} />}
    </ScreenScaffold>
  );
}
