// Core data model for the daily brief. The generator (docs/brief-generation.md)
// writes JSON files that match these types; fields marked v3 arrived with the
// September 2026 recipe redesign and are optional so older briefs still render.

export type Lang = 'cs' | 'en';

/** A short piece of text available in both supported languages. */
export interface Localized {
  cs: string;
  en: string;
}

export interface Source {
  name: string;
  url: string;
}

/**
 * A link back to an earlier item this story continues. Self-contained (carries
 * the referenced headline) so the card can always render the link without
 * loading the other brief; tappable only while that date is still in the archive.
 */
export interface ThreadRef {
  /** ISO date of the earlier brief, e.g. "2026-07-17". */
  date: string;
  /** id of the earlier item. */
  id: string;
  /** The earlier item's title, duplicated so the link stands alone. */
  title: Localized;
}

export type CategoryId =
  | 'models'
  | 'research'
  | 'business'
  | 'tools'
  | 'policy'
  | 'opensource';

/** "news" is a story; "tip" is a try-it-yourself feature the reader can use. */
export type ItemKind = 'news' | 'tip';

export interface BriefItem {
  id: string;
  /** v3 — defaults to "news"; tips also carry "-tip-" in their id. */
  kind?: ItemKind;
  category: CategoryId;
  title: Localized;
  summary: Localized;
  /** v3 — "why it matters": one or two sentences on what this means for the reader. */
  why?: Localized;
  /** v3 — ISO date of the underlying event (for a tip: when the feature shipped). */
  eventDate?: string;
  sources: Source[];
  /** True when the story is backed by an official source or two independent outlets. */
  verified: boolean;
  /** Marks the single most important story of the day. */
  highlight?: boolean;
  /** Optional link to the earlier item this story continues. */
  followsUp?: ThreadRef;
}

/** v3 — an upcoming dated event worth watching ("Na obzoru"). */
export interface RadarItem {
  /** ISO date of the event, today or in the future. */
  date: string;
  title: Localized;
  /** What happens and why it is worth watching. */
  note: Localized;
  sources: Source[];
  /** True when the date is reported by media but not confirmed by the organiser. */
  tentative?: boolean;
}

/** v3.1 — one story of the past week, pointing back into the archive (Sunday briefs). */
export interface WeekReviewEntry {
  /** ISO date of the brief the story ran in. */
  date: string;
  /** id of that item. */
  id: string;
  /** The item's title, copied verbatim so the row stands alone. */
  title: Localized;
  /** Why it was the story of the week / what happened since. */
  note: Localized;
}

export interface Brief {
  /** ISO date, e.g. "2026-07-14". */
  date: string;
  headline: Localized;
  /** One-sentence "what the day is about". */
  intro: Localized;
  items: BriefItem[];
  /** v3 — upcoming dates, sorted ascending. */
  radar?: RadarItem[];
  /** v3.1 — the week's key stories, most important first (Sunday briefs only). */
  weekInReview?: WeekReviewEntry[];
  /** Phase 1 marker: the content is illustrative sample data, not a real crawl. */
  sample?: boolean;
}

export interface BriefIndexEntry {
  date: string;
  headline: Localized;
  itemCount: number;
}

/** Lightweight manifest of every available brief, newest first. */
export interface BriefIndex {
  updated: string;
  briefs: BriefIndexEntry[];
}

/** Tips are flagged explicitly since v3; older briefs only mark them in the id. */
export function isTip(item: BriefItem): boolean {
  return item.kind === 'tip' || item.id.includes('-tip-');
}
