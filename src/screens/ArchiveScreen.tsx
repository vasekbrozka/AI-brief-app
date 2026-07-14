import { ScreenScaffold } from '../components/ScreenScaffold';
import { LangToggle } from '../components/LangToggle';
import { Icon } from '../components/Icon';
import { ArchiveSkeleton, EmptyState, ErrorState } from '../components/states';
import { useBriefIndex } from '../hooks/useBrief';
import { useSettings } from '../providers/SettingsProvider';
import { capitalizeFirst, formatShortDate, itemCountLabel } from '../lib/format';

export function ArchiveScreen({ onSelect }: { onSelect: (date: string) => void }) {
  const { t, lang } = useSettings();
  const { status, data, reload } = useBriefIndex();

  return (
    <ScreenScaffold title={t.archiveTitle} subtitle={t.archiveSubtitle} right={<LangToggle />}>
      {status === 'loading' && <ArchiveSkeleton />}
      {status === 'error' && <ErrorState onRetry={reload} />}
      {status === 'ready' && data && data.briefs.length === 0 && (
        <EmptyState title={t.archiveTitle} body={t.archiveEmpty} />
      )}
      {status === 'ready' && data && data.briefs.length > 0 && (
        <ul className="archive-list">
          {data.briefs.map((entry) => (
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
