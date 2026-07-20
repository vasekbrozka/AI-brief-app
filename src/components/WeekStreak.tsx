import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../providers/SettingsProvider';
import { useStreak } from '../providers/StreakProvider';
import { streakLabel, streakLevelIndex } from '../lib/format';
import { haptic } from '../lib/haptics';
import { Icon } from './Icon';

const LOCALE = { cs: 'cs-CZ', en: 'en-US' } as const;
const BEANS = [0, 1, 2, 3, 4, 5, 6, 7]; // celebration particles

function cap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/**
 * The reading-streak reward: a consecutive-day count, the current week as a
 * chain of dots (today's dot fills with the day's progress), tier title, and a
 * one-shot celebration when the shot is pulled. Colour escalates with the tier.
 */
export function WeekStreak({ todayProgress, done }: { todayProgress: number; done: boolean }) {
  const { lang, t } = useSettings();
  const { currentStreak, week } = useStreak();

  const [celebrate, setCelebrate] = useState(false);
  const wasDone = useRef(done);
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (done && !wasDone.current) {
      haptic();
      if (!reduce) {
        setCelebrate(true);
        const id = window.setTimeout(() => setCelebrate(false), 1600);
        wasDone.current = done;
        return () => window.clearTimeout(id);
      }
    }
    wasDone.current = done;
  }, [done, reduce]);

  const tier = streakLevelIndex(Math.max(1, currentStreak));
  const starter = currentStreak === 0 && !done;
  const milestone = done && currentStreak > 0 && currentStreak % 7 === 0;
  const wd = (iso: string) =>
    cap(new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'short' }).format(new Date(`${iso}T00:00:00`)));

  return (
    <div
      className={`streakcard${starter ? ' is-starter' : ''}${celebrate ? ' is-celebrate' : ''}${
        milestone ? ' is-milestone' : ''
      }`}
      data-tier={tier}
    >
      {celebrate && !reduce && (
        <div className="sc__beans" aria-hidden="true">
          {BEANS.map((i) => (
            <span key={i} style={{ ['--i' as string]: i }} />
          ))}
        </div>
      )}

      <div className="sc__head">
        {!starter && (
          <span key={currentStreak} className="sc__num">
            {currentStreak}
          </span>
        )}
        <span className="sc__meta">
          <span className="sc__title">
            {starter ? t.streakStart : t.streakLevels[tier]}
          </span>
          {!starter && (
            <span className="sc__sub">
              {done ? streakLabel(currentStreak, lang) : t.streakTodayLeft}
            </span>
          )}
        </span>
      </div>

      <div className="sc__week" role="img" aria-label={`${currentStreak}`}>
        {week.map((d, i) => {
          const todayDone = d.isToday && (done || d.done);
          const chain = d.done && i < 6 && week[i + 1].done;
          const cls = d.isToday
            ? todayDone
              ? 'is-done is-today'
              : 'is-progress is-today'
            : d.done
              ? 'is-done'
              : d.isFuture
                ? 'is-future'
                : 'is-missed';
          return (
            <div key={d.iso} className={`sc__day${chain ? ' has-chain' : ''}`}>
              <span
                className={`sc__dot ${cls}`}
                style={d.isToday && !todayDone ? ({ ['--tp' as string]: todayProgress } as object) : undefined}
              >
                {todayDone && <Icon name="check" size={15} />}
                {d.done && !d.isToday && <Icon name="check" size={13} />}
              </span>
              <small className={d.isToday ? 'is-today' : undefined}>{wd(d.iso)}</small>
            </div>
          );
        })}
      </div>

      {milestone && (
        <div className="sc__banner">☕️ {streakLabel(currentStreak, lang)}!</div>
      )}
    </div>
  );
}
