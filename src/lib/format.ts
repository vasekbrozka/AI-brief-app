import type { Lang } from './types';

const LOCALE: Record<Lang, string> = { cs: 'cs-CZ', en: 'en-US' };

function parse(dateStr: string): Date {
  // Treat the ISO date as local midnight so the weekday is stable.
  return new Date(`${dateStr}T00:00:00`);
}

export function formatFullDate(dateStr: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parse(dateStr));
}

export function formatShortDate(dateStr: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: 'numeric',
    month: 'long',
  }).format(parse(dateStr));
}

/** Compact numeric day and month for a card footer, e.g. "16. 9." (cs) / "Sep 16" (en). */
export function formatDayMonth(dateStr: string, lang: Lang): string {
  const d = parse(dateStr);
  if (lang === 'cs') return `${d.getDate()}. ${d.getMonth() + 1}.`;
  return new Intl.DateTimeFormat(LOCALE.en, { month: 'short', day: 'numeric' }).format(d);
}

/** Calendar-tile parts for the radar: the day number and a short month name. */
export function calendarTile(dateStr: string, lang: Lang): { day: string; month: string } {
  const d = parse(dateStr);
  const month = new Intl.DateTimeFormat(LOCALE[lang], { month: 'short' })
    .format(d)
    .replace(/\.$/, '');
  return { day: String(d.getDate()), month };
}

/** Weekday plus a short date for lists, e.g. "Pá 18. září" / "Fri, September 18". */
export function formatWeekdayDate(dateStr: string, lang: Lang): string {
  return capitalizeFirst(
    new Intl.DateTimeFormat(LOCALE[lang], {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    }).format(parse(dateStr)),
  );
}

export function formatWeekday(dateStr: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'long' }).format(parse(dateStr));
}

/** The ISO date `days` after (or, negative, before) an ISO date. */
export function shiftDate(dateStr: string, days: number): string {
  const d = parse(dateStr);
  d.setDate(d.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** A span of days, e.g. "14.–20. září 2026" / "September 14 – 20, 2026". */
export function formatDateRange(fromStr: string, toStr: string, lang: Lang, withYear = true): string {
  const from = parse(fromStr);
  const to = parse(toStr);
  if (lang === 'cs') {
    // Intl gives Czech ranges with numeric months ("14.–20. 9."); spell the
    // month out (in the genitive Intl uses after a day number) instead.
    const monthOf = (d: Date) =>
      new Intl.DateTimeFormat(LOCALE.cs, { day: 'numeric', month: 'long' })
        .format(d)
        .replace(/^\d+\.\s*/, '');
    const year = withYear ? ` ${to.getFullYear()}` : '';
    if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
      return `${from.getDate()}.–${to.getDate()}. ${monthOf(to)}${year}`;
    }
    return `${from.getDate()}. ${monthOf(from)} – ${to.getDate()}. ${monthOf(to)}${year}`;
  }
  // formatRange is ES2021 (Safari 14.1+); the project's TS lib is ES2020.
  const fmt = new Intl.DateTimeFormat(
    LOCALE.en,
    withYear ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' },
  ) as Intl.DateTimeFormat & { formatRange?: (a: Date, b: Date) => string };
  return typeof fmt.formatRange === 'function'
    ? fmt.formatRange(from, to)
    : `${fmt.format(from)} – ${fmt.format(to)}`;
}

/** Whole days between an ISO date and local today (0 = today, 1 = yesterday). */
export function daysAgo(dateStr: string): number {
  const then = parse(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - then.getTime()) / 86_400_000);
}

/** "today" / "yesterday" for recent dates, otherwise null. */
export function relativeDayKey(dateStr: string): 'today' | 'yesterday' | null {
  const diff = daysAgo(dateStr);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  return null;
}

/** Local time of an ISO timestamp, e.g. "5:04" (cs) / "5:04 AM" (en). */
export function formatTime(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE[lang], { hour: 'numeric', minute: '2-digit' }).format(d);
}

/**
 * Picks the Today title by local time of day — the brief "cools" as the day goes on.
 * Returns the STRINGS key so the caller resolves it in the active language.
 */
export function brewTitleKey(
  date: Date = new Date(),
): 'brewMorning' | 'brewAfternoon' | 'brewEvening' {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'brewMorning';
  if (h >= 12 && h < 18) return 'brewAfternoon';
  return 'brewEvening';
}

/** Uppercase the first character (Intl weekday/month names come lowercased in cs). */
export function capitalizeFirst(text: string): string {
  return text.length ? text[0].toUpperCase() + text.slice(1) : text;
}

/** Czech has three plural forms; English has two. */
export function itemCountLabel(n: number, lang: Lang): string {
  if (lang === 'cs') {
    if (n === 1) return '1 novinka';
    if (n >= 2 && n <= 4) return `${n} novinky`;
    return `${n} novinek`;
  }
  return n === 1 ? '1 story' : `${n} stories`;
}

/** "N stories hidden by filters", with the Czech three-form plural. */
export function hiddenCountLabel(n: number, lang: Lang): string {
  if (lang === 'cs') {
    if (n === 1) return '1 novinka je skrytá filtrem';
    if (n >= 2 && n <= 4) return `${n} novinky jsou skryté filtrem`;
    return `${n} novinek je skryto filtrem`;
  }
  return `${n} ${n === 1 ? 'story' : 'stories'} hidden by filters`;
}

/** Reading-time estimate, e.g. "6 min čtení" / "6 min read". */
export function readingTimeLabel(minutes: number, lang: Lang): string {
  return lang === 'cs' ? `${minutes} min čtení` : `${minutes} min read`;
}

/** How far through the day's stories the reader is, e.g. "Vypito 3 z 7" / "3 of 7 read". */
export function readProgressLabel(read: number, total: number, lang: Lang): string {
  return lang === 'cs' ? `Vypito ${read} z ${total}` : `${read} of ${total} read`;
}

/** The top bar's compact count, e.g. "2 z 6" / "2 of 6". */
export function readCountShort(read: number, total: number, lang: Lang): string {
  return lang === 'cs' ? `${read} z ${total}` : `${read} of ${total}`;
}

/** How many practical tips the day holds, e.g. "2 nové tipy" / "2 new tips". */
export function tipCountLabel(n: number, lang: Lang): string {
  if (lang === 'cs') {
    if (n === 1) return '1 nový tip';
    if (n >= 2 && n <= 4) return `${n} nové tipy`;
    return `${n} nových tipů`;
  }
  return n === 1 ? '1 new tip' : `${n} new tips`;
}

/** Checklist progress, e.g. "Vyzkoušeno 3 z 28" / "3 of 28 tried". */
export function triedProgressLabel(tried: number, total: number, lang: Lang): string {
  return lang === 'cs' ? `Vyzkoušeno ${tried} z ${total}` : `${tried} of ${total} tried`;
}

/** To do subtitle, e.g. "3 otevřené · 5 hotových" / "3 open · 5 done". */
export function todoCountLabel(open: number, done: number, lang: Lang): string {
  const cs = (n: number, one: string, few: string, many: string) =>
    `${n} ${n === 1 ? one : n >= 2 && n <= 4 ? few : many}`;
  const parts: string[] = [];
  if (lang === 'cs') {
    if (open > 0) parts.push(cs(open, 'otevřená', 'otevřené', 'otevřených'));
    if (done > 0) parts.push(cs(done, 'hotová', 'hotové', 'hotových'));
  } else {
    if (open > 0) parts.push(`${open} open`);
    if (done > 0) parts.push(`${done} done`);
  }
  return parts.join(' · ');
}

/** Reading-streak label, e.g. "5 dní v řadě" / "5-day streak". */
export function streakLabel(n: number, lang: Lang): string {
  if (lang === 'cs') {
    const noun = n === 1 ? 'den' : n >= 2 && n <= 4 ? 'dny' : 'dní';
    return `${n} ${noun} v řadě`;
  }
  return `${n}-day streak`;
}

/** Regular-guest tier (0–4) for a streak: 1–2 · 3–6 · 7–13 · 14–29 · 30+ days. */
export function streakLevelIndex(days: number): number {
  if (days <= 2) return 0;
  if (days <= 6) return 1;
  if (days <= 13) return 2;
  if (days <= 29) return 3;
  return 4;
}
