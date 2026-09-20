import type { Lang } from '../lib/types';
import { readProgressLabel } from '../lib/format';
import { Icon } from './Icon';

const R = 18;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * Reading progress as a ring with the percentage inside — sits beside the
 * large title, so it is in view without scrolling and adds no line to the
 * header. Full: a check instead of "100 %".
 */
export function ReadRing({ read, total, lang }: { read: number; total: number; lang: Lang }) {
  const pct = total > 0 ? Math.round((read / total) * 100) : 0;
  const done = total > 0 && read >= total;
  const label = readProgressLabel(read, total, lang);

  return (
    <div className={`ring${done ? ' is-done' : ''}`} role="img" aria-label={label} title={label}>
      <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
        <circle className="ring__track" cx="22" cy="22" r={R} />
        <circle
          className="ring__fill"
          cx="22"
          cy="22"
          r={R}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)}
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className="ring__label">
        {done ? <Icon name="check" size={18} /> : lang === 'cs' ? `${pct} %` : `${pct}%`}
      </span>
    </div>
  );
}
