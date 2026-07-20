import { ScreenScaffold } from '../components/ScreenScaffold';
import { Icon } from '../components/Icon';
import { BriefItemCard } from '../components/BriefItemCard';
import { useSaved } from '../providers/SavedProvider';
import { useSettings } from '../providers/SettingsProvider';

/** Stories the reader swiped right to keep. Reached from the bookmark in the
 * Today nav bar. Items are snapshots, so they survive their day aging out. */
export function SavedScreen({ onBack }: { onBack: () => void }) {
  const { t } = useSettings();
  const { saved } = useSaved();

  const backButton = (
    <button type="button" className="navbtn navbtn--back" onClick={onBack}>
      <Icon name="chevronLeft" size={22} />
      <span>{t.back}</span>
    </button>
  );

  return (
    <ScreenScaffold title={t.savedTitle} left={backButton}>
      {saved.length === 0 ? (
        <div className="state">
          <div className="state__icon">
            <Icon name="bookmark" size={28} />
          </div>
          <h2 className="state__title">{t.savedEmpty}</h2>
          <p className="state__body">{t.savedEmptyBody}</p>
        </div>
      ) : (
        <div className="items">
          {saved.map((item) => (
            <BriefItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </ScreenScaffold>
  );
}
