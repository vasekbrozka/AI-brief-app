import type { BriefItem, Lang } from './types';
import { toast } from './toast';

const APP_URL = 'https://aispresso.app';

/**
 * Plain-text share payload. Kept deliberately simple so it survives intact
 * across share targets (Messages, Notes, Mail, LinkedIn…): the headline, a
 * link to the primary source, and the AIspresso attribution + app link.
 */
function buildShareText(item: BriefItem, lang: Lang): string {
  const title = item.title[lang];
  const primary = item.sources[0];
  const sourceLabel = lang === 'cs' ? 'Zdroj' : 'Source';
  const attribution = lang === 'cs' ? 'přes AIspresso' : 'via AIspresso';
  const parts = [title];
  if (primary) parts.push('', `${sourceLabel}: ${primary.name} — ${primary.url}`);
  parts.push('', `${attribution} ☕️ ${APP_URL}`);
  return parts.join('\n');
}

export async function shareItem(item: BriefItem, lang: Lang): Promise<void> {
  const text = buildShareText(item, lang);
  const title = item.title[lang];

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
