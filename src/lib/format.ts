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

export function formatWeekday(dateStr: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'long' }).format(parse(dateStr));
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

/** "N stories hidden by your filter", pluralized. */
export function hiddenCountLabel(n: number, lang: Lang): string {
  if (lang === 'cs') {
    const noun = n === 1 ? 'novinka skryta' : n >= 2 && n <= 4 ? 'novinky skryté' : 'novinek skryto';
    return `${n} ${noun} filtrem`;
  }
  return `${n} ${n === 1 ? 'story' : 'stories'} hidden by your filter`;
}
