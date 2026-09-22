import { useMemo } from 'react';
import type { RadarItem } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { shiftDate, capitalizeFirst } from '../lib/format';
import { CATEGORIES, CATEGORY_ORDER } from '../lib/categories';

/** How far ahead the calendar looks. */
const WINDOW_DAYS = 30;
const LOCALE = { cs: 'cs-CZ', en: 'en-US' } as const;

function parse(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function toIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Monday of the week the date falls in — the grid always starts on a Monday. */
function weekStart(iso: string): string {
  const d = parse(iso);
  // getDay(): 0 = Sunday. Monday-first means Sunday is six days into the week.
  const back = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - back);
  return toIso(d);
}

interface Cell {
  iso: string;
  day: number;
  /** Inside the 30-day window — days before today and past it are dimmed. */
  inWindow: boolean;
  isToday: boolean;
  /** First of a month, so the grid can label where the month turns over. */
  startsMonth: boolean;
  events: RadarItem[];
}

/**
 * The month ahead as a grid. Whole weeks, Monday first, running from the week
 * today sits in until the 30-day window is covered; days carrying a "coming
 * up" entry get a dot. The grid is decoration — the list under it is what a
 * screen reader reads.
 */
function CalendarGrid({ today, radar }: { today: string; radar: RadarItem[] }) {
  const { lang } = useSettings();

  const { weeks, dayNames } = useMemo(() => {
    const byDate = new Map<string, RadarItem[]>();
    for (const entry of radar) {
      const list = byDate.get(entry.date);
      if (list) list.push(entry);
      else byDate.set(entry.date, [entry]);
    }

    const first = weekStart(today);
    const last = shiftDate(today, WINDOW_DAYS - 1);
    // Whole weeks from the first Monday until the window's final day is in.
    const span = Math.round(
      (parse(last).getTime() - parse(first).getTime()) / 86400000,
    );
    const count = Math.ceil((span + 1) / 7);

    const rows: Cell[][] = [];
    for (let w = 0; w < count; w++) {
      const row: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = shiftDate(first, w * 7 + d);
        const date = parse(iso);
        row.push({
          iso,
          day: date.getDate(),
          inWindow: iso >= today && iso <= last,
          isToday: iso === today,
          startsMonth: date.getDate() === 1,
          events: byDate.get(iso) ?? [],
        });
      }
      rows.push(row);
    }

    // Monday-first weekday initials, taken from the locale rather than spelled
    // out, so a new language needs no new strings.
    const fmt = new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'short' });
    const names = Array.from({ length: 7 }, (_, i) =>
      capitalizeFirst(fmt.format(parse(shiftDate(first, i)))),
    );

    return { weeks: rows, dayNames: names };
  }, [today, radar, lang]);

  const monthFmt = new Intl.DateTimeFormat(LOCALE[lang], { month: 'long' });

  return (
    <div className="cal" aria-hidden="true">
      <div className="cal__head">
        {dayNames.map((name, i) => (
          <span key={i} className="cal__dayname">
            {name}
          </span>
        ))}
      </div>
      {weeks.map((week, w) => (
        <div key={w} className="cal__week">
          {week.map((cell) => (
            <span
              key={cell.iso}
              className={`cal__cell${cell.inWindow ? '' : ' is-out'}${
                cell.isToday ? ' is-today' : ''
              }${cell.events.length > 0 ? ' has-event' : ''}`}
            >
              <span className="cal__num">{cell.day}</span>
              {cell.startsMonth && (
                <span className="cal__month">{monthFmt.format(parse(cell.iso))}</span>
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * The third desktop column: what is coming in the next month, and the category
 * filters from the settings within reach of the stories they hide.
 */
export function PlanColumn({ today, radar = [] }: { today: string; radar?: RadarItem[] }) {
  const { lang, t, mutedCategories, toggleCategory } = useSettings();

  // Everything still ahead, nearest first — the grid marks only what falls
  // inside the window, the list carries the rest too.
  const upcoming = useMemo(
    () => radar.filter((entry) => entry.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [radar, today],
  );

  const dayMonth = (iso: string) =>
    lang === 'cs'
      ? `${parse(iso).getDate()}. ${parse(iso).getMonth() + 1}.`
      : new Intl.DateTimeFormat(LOCALE.en, { month: 'short', day: 'numeric' }).format(parse(iso));

  return (
    <aside className="brief__plan" aria-label={t.planColumnLabel}>
      <div className="section-divider">
        <span>{t.radarTitle}</span>
      </div>

      <div className="panel plan__cal">
        <p className="plan__range">{t.planRangeLabel}</p>
        <CalendarGrid today={today} radar={upcoming} />

        {upcoming.length > 0 ? (
          <ol className="plan__list">
            {upcoming.map((entry) => (
              <li key={`${entry.date}-${entry.title.en}`} className="plan__row">
                <span className="plan__when">{dayMonth(entry.date)}</span>
                <span className="plan__title">
                  {entry.title[lang]}
                  {entry.tentative && <span className="plan__tentative">{t.radarTentative}</span>}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="plan__empty">{t.planEmpty}</p>
        )}
      </div>

      <div className="section-divider">
        <span>{t.planFiltersLabel}</span>
      </div>

      <div className="panel plan__filters">
        <div className="cat-toggles" role="group" aria-label={t.planFiltersLabel}>
          {CATEGORY_ORDER.map((c) => {
            const on = !mutedCategories.includes(c);
            return (
              <button
                key={c}
                type="button"
                className={`cat-toggle chip--${CATEGORIES[c].tint}${on ? ' is-on' : ''}`}
                aria-pressed={on}
                onClick={() => toggleCategory(c)}
              >
                {CATEGORIES[c].label[lang]}
              </button>
            );
          })}
        </div>
        <p className="plan__hint">{t.planFiltersHint}</p>
      </div>
    </aside>
  );
}
