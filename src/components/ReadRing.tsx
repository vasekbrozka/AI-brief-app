import type { Lang } from '../lib/types';
import { readProgressLabel } from '../lib/format';
import { Icon } from './Icon';

const SIZE = 56;
const R = 24;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * Reading progress as a ring with the percentage inside — beside the title
 * block, centred on its height, so it is in view without scrolling and adds
 * no line to the header. Full: a check instead of "100 %".
 */
export function ReadRing({ read, total, lang }: { read: number; total: number; lang: Lang }) {
  const pct = total > 0 ? Math.round((read / total) * 100) : 0;
  const done = total > 0 && read >= total;
  const label = readProgressLabel(read, total, lang);

  return (
    <div className={`ring${done ? ' is-done' : ''}`} role="img" aria-label={label} title={label}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} aria-hidden="true">
        <circle className="ring__track" cx={SIZE / 2} cy={SIZE / 2} r={R} />
        <circle
          className="ring__fill"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>
      <span className="ring__label">
        {done ? <Icon name="check" size={22} /> : lang === 'cs' ? `${pct} %` : `${pct}%`}
      </span>
    </div>
  );
}
