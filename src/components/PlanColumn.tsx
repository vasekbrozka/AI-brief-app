import { useMemo, type ReactNode } from 'react';
import type { RadarItem } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { shiftDate, capitalizeFirst, formatDayMonth } from '../lib/format';
import { CATEGORIES, CATEGORY_ORDER } from '../lib/categories';
import { useScrollFade } from '../hooks/useScrollFade';

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
 * up" entry are marked and name it on hover. The grid is decoration — the
 * list beside it is what a screen reader reads.
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
    const span = Math.round((parse(last).getTime() - parse(first).getTime()) / 86400000);
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
              // The list is gone from the column, so the day itself has to say
              // what is happening on it.
              title={
                cell.events.length > 0
                  ? cell.events.map((e) => e.title[lang]).join(' · ')
                  : undefined
              }
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
 * The widest desktop's right-hand column: what is coming in the next month,
 * the category filters from the settings within reach of the stories they
 * hide, and — below them — the streak and the sharing this column carries
 * whenever it is the one at the right edge.
 */
export function PlanColumn({
  today,
  radar = [],
  foot,
}: {
  today: string;
  radar?: RadarItem[];
  /** The streak and the sharing row, pinned to the column's foot. */
  foot?: ReactNode;
}) {
  const { lang, t, mutedCategories, toggleCategory } = useSettings();
  // This column ends in pinned content too, so it fades the same way.
  const scroll = useScrollFade<HTMLDivElement>();

  // Everything still ahead, nearest first — the grid marks only what falls
  // inside the window, the hidden list names them all for a screen reader.
  const upcoming = useMemo(
    () => radar.filter((entry) => entry.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [radar, today],
  );

  return (
    <aside className="brief__plan" aria-label={t.planColumnLabel}>
      <div className={`side__scroll${scroll.more ? ' has-more' : ''}`} ref={scroll.ref}>
        <div className="panel plan__cal" aria-label={t.radarTitle}>
          <p className="plan__range">{t.planRangeLabel}</p>
          <CalendarGrid today={today} radar={upcoming} />
          {upcoming.length > 0 && (
            <ul className="sr-only">
              {upcoming.map((entry) => (
                <li key={`${entry.date}-${entry.title.en}`}>
                  {formatDayMonth(entry.date, lang)} — {entry.title[lang]}
                  {entry.tentative ? ` (${t.radarTentative})` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel plan__filters">
          <p className="plan__range">{t.planFiltersLabel}</p>
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
        </div>
      </div>

      {foot && <div className="side__foot">{foot}</div>}
    </aside>
  );
}
