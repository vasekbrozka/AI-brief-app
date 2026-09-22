import { useSettings } from '../providers/SettingsProvider';
import { useNav } from '../providers/NavProvider';
import { useWeekTopShots } from '../hooks/useWeekTopShots';
import { formatDayMonth } from '../lib/format';
import { CategoryChip } from './CategoryChip';

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;
const SHOWN = 4;

/**
 * The week's top shots as a column of cards beside the day. A wide screen has
 * room for both the day and the week, so the switch the phone needs is gone
 * here: today's brief is the wide column, the week sits beside it. Each card
 * carries the same chip, date and headline a story card leads with, and opens
 * that day's brief in the archive. Four days rather than seven: the column
 * also carries the tips and the streak, and everything has to fit one screen.
 */
export function WeekRail() {
  const { lang, t } = useSettings();
  const { openBriefDate } = useNav();
  const { status, data } = useWeekTopShots();

  if (status !== 'ready' || !data || data.items.length === 0) return null;

  return (
    <>
      <div className="section-divider">
        <span>{t.viewWeek}</span>
      </div>
      <div className="shots">
        {data.items.slice(0, SHOWN).map((item) => {
          const date = DATE_PREFIX.exec(item.id)?.[0];
          return (
            <button
              key={item.id}
              type="button"
              className="shotcard"
              disabled={!date}
              onClick={() => date && openBriefDate(date)}
            >
              <span className="shotcard__head">
                <CategoryChip id={item.category} />
                {date && <span className="shotcard__date">{formatDayMonth(date, lang)}</span>}
              </span>
              <span className="shotcard__title">{item.title[lang]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
