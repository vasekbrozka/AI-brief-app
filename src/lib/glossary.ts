import type { Lang } from './types';

export interface GlossaryEntry {
  id: string;
  term: Record<Lang, string>;
  aliases: string[];
  short: Record<Lang, string>;
}

export interface Glossary {
  updated: string;
  terms: GlossaryEntry[];
}

export interface Segment {
  text: string;
  entry?: GlossaryEntry;
}

// Highlight at most this many distinct terms per passage — enough to help,
// few enough that the brief never reads like a textbook.
const CAP = 3;

const WORD = /[\p{L}\p{N}_]/u;
function isWordChar(ch: string | undefined): boolean {
  return ch !== undefined && WORD.test(ch);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface Matcher {
  re: RegExp;
  map: Map<string, GlossaryEntry>;
}

// One matcher per glossary object, memoised on identity: a single global regex
// of every alias (longest first, so "kontextové okno" wins over a bare "okno")
// plus a lookup from the matched text back to its entry.
const cache = new WeakMap<Glossary, Matcher>();

function getMatcher(glossary: Glossary): Matcher {
  const cached = cache.get(glossary);
  if (cached) return cached;
  const map = new Map<string, GlossaryEntry>();
  const aliases: string[] = [];
  for (const entry of glossary.terms) {
    for (const alias of entry.aliases) {
      const key = alias.toLowerCase();
      if (!map.has(key)) {
        map.set(key, entry);
        aliases.push(alias);
      }
    }
  }
  aliases.sort((a, b) => b.length - a.length);
  const re = new RegExp(aliases.map(escapeRegExp).join('|'), 'giu');
  const matcher = { re, map };
  cache.set(glossary, matcher);
  return matcher;
}

/**
 * Split `text` into plain and glossary-term segments. Matching is
 * case-insensitive and Unicode whole-word aware (so "agent" never fires inside
 * "agentura"), keeps only the first occurrence of each term, and stops at CAP.
 * Purely local — no network, no per-tap cost.
 */
export function segmentText(text: string, _lang: Lang, glossary: Glossary): Segment[] {
  const { re, map } = getMatcher(glossary);
  re.lastIndex = 0;
  const spans: { start: number; end: number; entry: GlossaryEntry }[] = [];
  const used = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null && spans.length < CAP) {
    const match = m[0];
    if (match.length === 0) {
      re.lastIndex++;
      continue;
    }
    const start = m.index;
    const end = start + match.length;
    // Reject partial-word hits (Unicode-aware boundaries; \b is ASCII-only).
    if (isWordChar(text[start - 1]) || isWordChar(text[end])) continue;
    const entry = map.get(match.toLowerCase());
    if (!entry || used.has(entry.id)) continue;
    used.add(entry.id);
    spans.push({ start, end, entry });
  }
  if (spans.length === 0) return [{ text }];
  spans.sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let pos = 0;
  for (const span of spans) {
    if (span.start > pos) segments.push({ text: text.slice(pos, span.start) });
    segments.push({ text: text.slice(span.start, span.end), entry: span.entry });
    pos = span.end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos) });
  return segments;
}
