import { ScreenScaffold } from '../components/ScreenScaffold';
import { Icon } from '../components/Icon';
import { ArchiveSkeleton, EmptyState, ErrorState } from '../components/states';
import { useBriefIndex } from '../hooks/useBrief';
import { useSettings } from '../providers/SettingsProvider';
import { useSaved } from '../providers/SavedProvider';
import {
  capitalizeFirst,
  formatShortDate,
  formatWeekdayDate,
  itemCountLabel,
  relativeDayKey,
} from '../lib/format';
import { ARCHIVE_DAYS } from '../lib/archive';

/**
 * The last two weeks as one grouped list (the iOS inset list: one surface,
 * hairline separators), with the saved stories as their own group above.
 */
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

  const briefs = data?.briefs.slice(0, ARCHIVE_DAYS) ?? [];

  // "Today" and "Yesterday" read faster than a date; older days keep the weekday.
  const dayLabel = (date: string) => {
    const rel = relativeDayKey(date);
    if (rel === 'today') return `${t.dayToday} · ${capitalizeFirst(formatShortDate(date, lang))}`;
    if (rel === 'yesterday') {
      return `${t.dayYesterday} · ${capitalizeFirst(formatShortDate(date, lang))}`;
    }
    return formatWeekdayDate(date, lang);
  };

  return (
    <ScreenScaffold title={t.archiveTitle} subtitle={t.archiveSubtitle}>
      <div className="list">
        <button type="button" className="list__row saved-entry" onClick={onOpenSaved}>
          <Icon name="bookmark" className="saved-entry__icon" size={20} />
          <span className="saved-entry__label">{t.savedTitle}</span>
          {savedCount > 0 && <span className="saved-entry__count">{savedCount}</span>}
          <Icon name="chevronRight" className="list__chevron" size={18} />
        </button>
      </div>

      {status === 'loading' && <ArchiveSkeleton />}
      {status === 'error' && <ErrorState onRetry={reload} />}
      {status === 'ready' && briefs.length === 0 && (
        <EmptyState title={t.archiveEmpty} body={t.archiveEmptyBody} />
      )}
      {status === 'ready' && briefs.length > 0 && (
        <ul className="list archive-list">
          {briefs.map((entry) => (
            <li key={entry.date}>
              <button
                type="button"
                className="list__row archive-row"
                onClick={() => onSelect(entry.date)}
              >
                <span className="archive-row__body">
                  <span className="archive-row__date">{dayLabel(entry.date)}</span>
                  <span className="archive-row__headline">{entry.headline[lang]}</span>
                  <span className="archive-row__count">
                    {itemCountLabel(entry.itemCount, lang)}
                  </span>
                </span>
                <Icon name="chevronRight" className="list__chevron" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </ScreenScaffold>
  );
}
