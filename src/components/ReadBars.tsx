import type { Lang } from '../lib/types';
import { readProgressLabel } from '../lib/format';

/**
 * Reading progress as one segment per story — read segments in the accent
 * colour, the rest in the fill. It sits on the header's meta line, so it
 * costs no extra row, and (unlike a percentage) it says how many stories
 * are left without any arithmetic.
 */
export function ReadBars({ read, total, lang }: { read: number; total: number; lang: Lang }) {
  if (total <= 0) return null;
  return (
    <div className="readbars" role="img" aria-label={readProgressLabel(read, total, lang)}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`readbars__seg${i < read ? ' is-on' : ''}`} />
      ))}
    </div>
  );
}
