import type { BriefItem, CategoryId, Lang } from './types';

/** The stories the reader sees: muted categories drop out, the day's top story always stays. */
export function visibleItems(items: BriefItem[], muted: readonly CategoryId[]): BriefItem[] {
  if (muted.length === 0) return items;
  const set = new Set(muted);
  return items.filter((item) => item.highlight || !set.has(item.category));
}

// Silent reading of plain Czech/English prose; the summaries are short, so the
// estimate is rounded to whole minutes and never says zero.
const WORDS_PER_MINUTE = 190;

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Rough time to read the stories (title, summary and "why it matters") in one language. */
export function readingMinutes(items: BriefItem[], lang: Lang): number {
  let words = 0;
  for (const item of items) {
    words +=
      countWords(item.title[lang]) +
      countWords(item.summary[lang]) +
      countWords(item.why?.[lang] ?? '');
  }
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
