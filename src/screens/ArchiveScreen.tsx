import { ScreenScaffold } from '../components/ScreenScaffold';
import { Icon } from '../components/Icon';
import { ArchiveSkeleton, EmptyState, ErrorState } from '../components/states';
import { useBriefIndex } from '../hooks/useBrief';
import { useSettings } from '../providers/SettingsProvider';
import { useSaved } from '../providers/SavedProvider';
import { capitalizeFirst, formatShortDate, itemCountLabel } from '../lib/format';

// Keep the archive lean and current — the most recent week is shown.
const MAX_ARCHIVE_DAYS = 7;

export function ArchiveScreen({
  onSelect,
  onOpenSaved,
}: {
  onSelect: (date: string) => void;
  onOpenSaved: () => void;
}) {
  const { t, lang } = useSettings();
  const { status, data, reload } = useBriefIndex();
  const { savedCount } = useSaved();

  const briefs = data?.briefs.slice(0, MAX_ARCHIVE_DAYS) ?? [];

  return (
    <ScreenScaffold title={t.archiveTitle} subtitle={t.archiveSubtitle}>
      <button type="button" className="saved-entry" onClick={onOpenSaved}>
        <Icon name="bookmark" className="saved-entry__icon" size={20} />
        <span className="saved-entry__label">{t.savedTitle}</span>
        {savedCount > 0 && <span className="saved-entry__count">{savedCount}</span>}
        <Icon name="chevronRight" size={18} />
      </button>

      {status === 'loading' && <ArchiveSkeleton />}
      {status === 'error' && <ErrorState onRetry={reload} />}
      {status === 'ready' && briefs.length === 0 && (
        <EmptyState title={t.archiveTitle} body={t.archiveEmpty} />
      )}
      {status === 'ready' && briefs.length > 0 && (
        <ul className="archive-list">
          {briefs.map((entry) => (
            <li key={entry.date}>
              <button type="button" className="archive-row" onClick={() => onSelect(entry.date)}>
                <span className="archive-row__body">
                  <span className="archive-row__date">
                    {capitalizeFirst(formatShortDate(entry.date, lang))}
                  </span>
                  <span className="archive-row__headline">{entry.headline[lang]}</span>
                  <span className="archive-row__count">
                    {itemCountLabel(entry.itemCount, lang)}
                  </span>
                </span>
                <Icon name="chevronRight" className="archive-row__chevron" size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </ScreenScaffold>
  );
}
