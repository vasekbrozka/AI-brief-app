// Core data model for the Daily AI Brief.
// In Phase 2 the daily AI crawl will generate JSON files that match these types.

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

export interface BriefItem {
  id: string;
  category: CategoryId;
  title: Localized;
  summary: Localized;
  sources: Source[];
  /** True when the story has been cross-checked across multiple sources. */
  verified: boolean;
  /** Marks the single most important story of the day. */
  highlight?: boolean;
  /** Optional link to the earlier item this story continues. */
  followsUp?: ThreadRef;
}

export interface Brief {
  /** ISO date, e.g. "2026-07-14". */
  date: string;
  headline: Localized;
  /** One-paragraph "gist of the day". */
  intro: Localized;
  items: BriefItem[];
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
