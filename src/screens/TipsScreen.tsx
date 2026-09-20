import { ScreenScaffold } from '../components/ScreenScaffold';
import { Icon } from '../components/Icon';
import { ArchiveSkeleton, EmptyState, ErrorState } from '../components/states';
import { TryRow } from '../components/TryList';
import { useRecentTips } from '../hooks/useTipsBacklog';
import { useSettings } from '../providers/SettingsProvider';
import { useTried } from '../providers/TriedProvider';
import { triedProgressLabel } from '../lib/format';

/** The full "Try it yourself" checklist: untried tips first, ticked ones below. */
export function TipsScreen({ onBack }: { onBack: () => void }) {
  const { t, lang } = useSettings();
  const { isTried } = useTried();
  const { status, tips, reload } = useRecentTips();

  const untried = tips.filter((tip) => !isTried(tip.slug));
  const tried = tips.filter((tip) => isTried(tip.slug));

  const backButton = (
    <button type="button" className="navbtn navbtn--back" onClick={onBack}>
      <Icon name="chevronLeft" size={22} />
      <span>{t.back}</span>
    </button>
  );

  return (
    <ScreenScaffold
      title={t.tryTitle}
      subtitle={status === 'ready' && tips.length > 0 ? triedProgressLabel(tried.length, tips.length, lang) : undefined}
      left={backButton}
    >
      <p className="try__hint try__hint--screen">{t.tryHint}</p>
      {status === 'loading' && <ArchiveSkeleton />}
      {status === 'error' && <ErrorState onRetry={reload} />}
      {status === 'ready' && tips.length === 0 && (
        <EmptyState title={t.tryEmptyTitle} body={t.tryEmptyBody} />
      )}
      {untried.length > 0 && (
        <ul className="panel try__list try__list--screen">
          {untried.map((tip) => (
            <TryRow key={tip.slug} tip={tip} />
          ))}
        </ul>
      )}
      {tried.length > 0 && (
        <>
          <div className="section-divider">
            <span>{t.tryTriedSection}</span>
          </div>
          <ul className="panel try__list try__list--screen">
            {tried.map((tip) => (
              <TryRow key={tip.slug} tip={tip} />
            ))}
          </ul>
        </>
      )}
    </ScreenScaffold>
  );
}
