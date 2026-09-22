import { useMemo, type ReactNode } from 'react';
import type { RadarItem } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { useNav } from '../providers/NavProvider';
import { useBriefIndex } from '../hooks/useBrief';
import { shiftDate, capitalizeFirst, formatWeekdayDate } from '../lib/format';
import { ARCHIVE_DAYS } from '../lib/archive';
import { CATEGORIES, CATEGORY_ORDER } from '../lib/categories';
import { ITEM_KINDS } from '../lib/briefStats';
import { useScrollFade } from '../hooks/useScrollFade';

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
  isToday: boolean;
  /** First of a month, so the grid can label where the month turns over. */
  startsMonth: boolean;
  /** The headline of the brief published that day — the cell opens it. */
  headline?: string;
  /** A dated entry still ahead of us, from the newest brief's "coming up". */
  events: RadarItem[];
}

/**
 * The archive as a month. Whole weeks, Monday first, running from the oldest
 * day the archive still keeps to the end of the week today sits in — so today
 * is the newest day that opens anything, and the days after it are there only
 * to carry what is already known to be coming.
 *
 * A day with a brief is a button that opens it; every other day is a mark.
 */
function CalendarGrid({
  today,
  radar,
  briefs,
  onPick,
}: {
  today: string;
  radar: RadarItem[];
  briefs: Map<string, string>;
  onPick: (date: string) => void;
}) {
  const { lang } = useSettings();

  const { weeks, dayNames } = useMemo(() => {
    const byDate = new Map<string, RadarItem[]>();
    for (const entry of radar) {
      const list = byDate.get(entry.date);
      if (list) list.push(entry);
      else byDate.set(entry.date, [entry]);
    }

    // From the week holding the oldest day the archive keeps to the end of this
    // week. Whole weeks either end, so every column stays one weekday.
    const first = weekStart(shiftDate(today, -(ARCHIVE_DAYS - 1)));
    const last = shiftDate(weekStart(today), 6);
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
          isToday: iso === today,
          startsMonth: date.getDate() === 1,
          headline: briefs.get(iso),
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
  }, [today, radar, briefs, lang]);

  const monthFmt = new Intl.DateTimeFormat(LOCALE[lang], { month: 'long' });

  return (
    <div className="cal">
      <div className="cal__head" aria-hidden="true">
        {dayNames.map((name, i) => (
          <span key={i} className="cal__dayname">
            {name}
          </span>
        ))}
      </div>
      {weeks.map((week, w) => (
        <div key={w} className="cal__week">
          {week.map((cell) => {
            const className = `cal__cell${cell.headline ? ' has-brief' : ' is-out'}${
              cell.isToday ? ' is-today' : ''
            }${cell.events.length > 0 ? ' has-event' : ''}`;
            const inside = (
              <>
                <span className="cal__num">{cell.day}</span>
                {cell.startsMonth && (
                  <span className="cal__month">{monthFmt.format(parse(cell.iso))}</span>
                )}
              </>
            );

            // Only a day the archive still keeps opens anything.
            if (cell.headline) {
              return (
                <button
                  key={cell.iso}
                  type="button"
                  className={className}
                  title={cell.headline}
                  aria-label={`${formatWeekdayDate(cell.iso, lang)} — ${cell.headline}`}
                  aria-current={cell.isToday ? 'date' : undefined}
                  onClick={() => onPick(cell.iso)}
                >
                  {inside}
                </button>
              );
            }

            // Nothing to open, so a day still ahead has to name itself.
            const ahead = cell.events.map((e) => e.title[lang]).join(' · ');
            return (
              <span
                key={cell.iso}
                className={className}
                title={ahead || undefined}
                aria-label={ahead ? `${formatWeekdayDate(cell.iso, lang)} — ${ahead}` : undefined}
                aria-hidden={ahead ? undefined : true}
                role={ahead ? 'note' : undefined}
              >
                {inside}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * The desktop's right-hand column: the archive as a calendar, the category
 * filters from the settings within reach of the stories they hide, and — below
 * them — the streak and the sharing.
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
  const { lang, t, mutedCategories, toggleCategory, mutedKinds, toggleKind } = useSettings();
  const { openBriefDate } = useNav();
  const { data: index } = useBriefIndex();
  // This column ends in pinned content too, so it fades the same way.
  const scroll = useScrollFade<HTMLDivElement>();

  // Which days the archive can still open, and what ran on them.
  const briefs = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of index?.briefs.slice(0, ARCHIVE_DAYS) ?? []) {
      map.set(entry.date, entry.headline[lang]);
    }
    return map;
  }, [index, lang]);

  // Only what is still ahead: the days behind us are the archive's now.
  const upcoming = useMemo(() => radar.filter((entry) => entry.date > today), [radar, today]);

  return (
    <aside className="brief__plan" aria-label={t.planColumnLabel}>
      <div className={`side__scroll${scroll.more ? ' has-more' : ''}`} ref={scroll.ref}>
        <div className="panel plan__cal">
          <p className="plan__range">{t.planArchiveLabel}</p>
          <CalendarGrid today={today} radar={upcoming} briefs={briefs} onPick={openBriefDate} />
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
            {/* What a story is, beside what it is about. */}
            {ITEM_KINDS.map((k) => {
              const on = !mutedKinds.includes(k);
              return (
                <button
                  key={k}
                  type="button"
                  className={`cat-toggle cat-toggle--kind${on ? ' is-on' : ''}`}
                  aria-pressed={on}
                  onClick={() => toggleKind(k)}
                >
                  {k === 'highlight' ? t.filterHighlight : t.filterTip}
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
