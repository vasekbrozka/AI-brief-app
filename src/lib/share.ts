import { isTip, type Brief, type BriefItem, type Lang } from './types';
import { toast } from './toast';
import { formatDayMonth, formatShortDate } from './format';

const APP_URL = 'https://aispresso.app';

/**
 * Plain-text share payload. Kept deliberately simple so it survives intact
 * across share targets (Messages, Notes, Mail, LinkedIn…): the headline, the
 * "why it matters" line when the brief has one, a link to the primary source,
 * and the AIspresso attribution + app link.
 */
function buildShareText(item: BriefItem, lang: Lang): string {
  const title = item.title[lang];
  const why = item.why?.[lang];
  const parts = [title];
  if (why) parts.push('', why);
  if (item.sources.length > 0) {
    const label =
      item.sources.length > 1 ? (lang === 'cs' ? 'Zdroje' : 'Sources') : lang === 'cs' ? 'Zdroj' : 'Source';
    parts.push('', `${label}: ${item.sources.map((s) => `${s.name} ${s.url}`).join(' · ')}`);
  }
  parts.push('', 'AIspresso ☕️', APP_URL);
  return parts.join('\n');
}

/**
 * The whole day as plain text: date and headline, one line per story (tips
 * marked), the upcoming dates, and the app link.
 */
function buildBriefShareText(brief: Brief, lang: Lang): string {
  const date = formatShortDate(brief.date, lang);
  const parts = [`AIspresso · ${date}`, brief.headline[lang], ''];
  for (const item of brief.items) {
    parts.push(`${isTip(item) ? '💡' : '•'} ${item.title[lang]}`);
  }
  if (brief.radar && brief.radar.length > 0) {
    parts.push('', lang === 'cs' ? 'Co se chystá:' : 'Coming up:');
    for (const entry of brief.radar) {
      parts.push(`• ${formatDayMonth(entry.date, lang)} — ${entry.title[lang]}`);
    }
  }
  parts.push('', APP_URL);
  return parts.join('\n');
}

async function shareText(title: string, text: string, lang: Lang): Promise<void> {
  // Web Share API (iOS/Android). Only title + text — no separate url field,
  // which some targets promote to a link preview and drop the rest.
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text });
    } catch (err) {
      // Share sheet dismissed — nothing to report.
      if ((err as Error)?.name !== 'AbortError') {
        /* other failures fall through silently */
      }
    }
    return;
  }

  // Desktop fallback: copy to the clipboard and confirm with a toast.
  const ok = lang === 'cs' ? 'Zkopírováno do schránky' : 'Copied to clipboard';
  const bad = lang === 'cs' ? 'Kopírování se nepovedlo' : 'Copy failed';
  try {
    await navigator.clipboard.writeText(text);
    toast(ok);
  } catch {
    toast(bad);
  }
}

export async function shareBrief(brief: Brief, lang: Lang): Promise<void> {
  await shareText(`AIspresso · ${brief.headline[lang]}`, buildBriefShareText(brief, lang), lang);
}

export async function shareItem(item: BriefItem, lang: Lang): Promise<void> {
  await shareText(item.title[lang], buildShareText(item, lang), lang);
}
