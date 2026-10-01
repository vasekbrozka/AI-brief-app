import { isTip, type BriefItem, type CategoryId, type Lang } from './types';

/** What a story is, beside its category — each its own filter. */
export type ItemKind = 'highlight' | 'tip';

export const ITEM_KINDS: ItemKind[] = ['highlight', 'tip'];

/**
 * The stories the reader sees. A story is judged by the one filter that fits
 * it: the day's top story by "top story", a tip by "tips" and its category,
 * everything else by its category alone — so muting a category still never
 * swallows the highlight, only the highlight filter does.
 */
export function visibleItems(
  items: BriefItem[],
  muted: readonly CategoryId[],
  mutedKinds: readonly ItemKind[] = [],
): BriefItem[] {
  if (muted.length === 0 && mutedKinds.length === 0) return items;
  const cats = new Set(muted);
  const kinds = new Set(mutedKinds);
  return items.filter((item) => {
    if (item.highlight) return !kinds.has('highlight');
    if (isTip(item)) return !kinds.has('tip') && !cats.has(item.category);
    return !cats.has(item.category);
  });
}

/**
 * Today's list keeps what's unread on top and sinks what's already read to
 * the end, each half keeping its own order — so checking a story off clears
 * the way to what's next instead of just folding it in place.
 */
export function orderWithReadLast(
  items: BriefItem[],
  isRead: (id: string) => boolean,
): BriefItem[] {
  const unread = items.filter((item) => !isRead(item.id));
  const read = items.filter((item) => isRead(item.id));
  return [...unread, ...read];
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
