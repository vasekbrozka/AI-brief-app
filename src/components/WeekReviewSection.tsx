import type { WeekReviewEntry } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { useNav } from '../providers/NavProvider';
import { capitalizeFirst, daysAgo, formatShortDate } from '../lib/format';
import { ARCHIVE_DAYS } from '../lib/archive';
import { Icon } from './Icon';

/**
 * "The week in AI" — the Sunday look back: the week's key stories in order of
 * importance, each a tappable row into the archived day while it is still
 * within the archive window.
 */
export function WeekReviewSection({ entries }: { entries: WeekReviewEntry[] }) {
  const { lang, t } = useSettings();
  const { openBriefDate } = useNav();
  if (entries.length === 0) return null;

  return (
    <section className="week" aria-label={t.weekTitle}>
      <div className="section-divider">
        <span>{t.weekTitle}</span>
      </div>
      <ol className="week__list">
        {entries.map((entry, i) => {
          const age = daysAgo(entry.date);
          const reachable = age >= 0 && age < ARCHIVE_DAYS;
          const body = (
            <>
              <span className="week__num" aria-hidden="true">
                {i + 1}
              </span>
              <span className="week__body">
                <span className="week__title">{entry.title[lang]}</span>
                <span className="week__note">{entry.note[lang]}</span>
                <span className="week__date">{capitalizeFirst(formatShortDate(entry.date, lang))}</span>
              </span>
              {reachable && <Icon name="chevronRight" className="week__chevron" size={18} />}
            </>
          );
          return (
            <li key={entry.id}>
              {reachable ? (
                <button type="button" className="week__row" onClick={() => openBriefDate(entry.date)}>
                  {body}
                </button>
              ) : (
                <div className="week__row week__row--static">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
