import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../providers/SettingsProvider';
import { useStreak } from '../providers/StreakProvider';
import { streakLabel, streakLevelIndex } from '../lib/format';
import { haptic } from '../lib/haptics';
import { Icon } from './Icon';

const LOCALE = { cs: 'cs-CZ', en: 'en-US' } as const;

/**
 * The reading streak as one quiet row under the title: consecutive days and
 * the tier on the left, the week as seven small dots on the right. The dot of
 * the brief being read fills with today's progress and pops once the day
 * counts. Colour escalates with the tier.
 */
export function StreakStrip({
  progress,
  done,
  activeIso,
}: {
  /** Share of today's stories read, 0–1. */
  progress: number;
  /** True once the day counts towards the streak. */
  done: boolean;
  /** ISO date of the brief on screen — the dot that fills. */
  activeIso: string;
}) {
  const { lang, t } = useSettings();
  const { currentStreak, week } = useStreak();

  const [celebrate, setCelebrate] = useState(false);
  const wasDone = useRef(done);
  useEffect(() => {
    if (done && !wasDone.current) {
      haptic();
      setCelebrate(true);
      const id = window.setTimeout(() => setCelebrate(false), 900);
      wasDone.current = done;
      return () => window.clearTimeout(id);
    }
    wasDone.current = done;
  }, [done]);

  const tier = streakLevelIndex(Math.max(1, currentStreak));
  const starter = currentStreak === 0 && !done;
  const weekday = (iso: string) =>
    new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'short' }).format(new Date(`${iso}T00:00:00`));

  return (
    <div
      className={`streakbar${starter ? ' is-starter' : ''}${celebrate ? ' is-celebrate' : ''}`}
      data-tier={tier}
      role="status"
    >
      <Icon name="cup" className="streakbar__icon" size={18} />
      <span className="streakbar__text">
        <span className="streakbar__count">
          {starter ? t.streakStart : streakLabel(currentStreak, lang)}
        </span>
        {!starter && <span className="streakbar__tier">{t.streakLevels[tier]}</span>}
      </span>
      <span className="streakbar__week" aria-hidden="true">
        {week.map((d) => {
          const active = d.iso === activeIso;
          const cls = d.done || (active && done)
            ? ' is-done'
            : active
              ? ' is-progress'
              : d.isFuture
                ? ' is-future'
                : ' is-missed';
          return (
            <span
              key={d.iso}
              className={`streakbar__dot${cls}${active ? ' is-active' : ''}`}
              title={weekday(d.iso)}
              style={active && !done ? ({ ['--tp' as string]: progress } as object) : undefined}
            />
          );
        })}
      </span>
    </div>
  );
}
