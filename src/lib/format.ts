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

/** "today" / "yesterday" for recent dates, otherwise null. */
export function relativeDayKey(dateStr: string): 'today' | 'yesterday' | null {
  const then = parse(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - then.getTime()) / 86_400_000);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  return null;
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
