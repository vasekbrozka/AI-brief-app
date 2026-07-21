import { useEffect, useMemo } from 'react';
import type { Brief } from '../lib/types';
import { hiddenCountLabel } from '../lib/format';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { useStreak } from '../providers/StreakProvider';
import { BriefItemCard } from './BriefItemCard';
import { WeekStreak } from './WeekStreak';
import { Icon } from './Icon';

export function BriefView({ brief, isToday = false }: { brief: Brief; isToday?: boolean }) {
  const { lang, t, hideRead, mutedCategories, gamification } = useSettings();
  const { isRead } = useRead();
  const { currentStreak, markFinished } = useStreak();

  // Muted categories drop out of the brief — but the day's top story always
  // stays, so muting never silently swallows the single highlight.
  const muted = useMemo(() => new Set(mutedCategories), [mutedCategories]);
  const shown = useMemo(
    () => brief.items.filter((item) => item.highlight || !muted.has(item.category)),
    [brief, muted],
  );
  const hiddenCount = brief.items.length - shown.length;

  const unread = shown.filter((item) => !isRead(item.id));
  const read = shown.filter((item) => isRead(item.id));

  // Today's reading progress drives the streak card; all read = day finished.
  const readShownCount = read.length;
  const todayProgress = shown.length ? readShownCount / shown.length : 0;
  const done = shown.length > 0 && readShownCount === shown.length;
  // Show once there's something to track — never greet a fresh morning with 0.
  const showCard =
    isToday && gamification && shown.length > 0 && (readShownCount > 0 || currentStreak > 0);

  useEffect(() => {
    if (isToday && gamification && done) markFinished();
  }, [isToday, gamification, done, markFinished]);

  return (
    <div className="brief">
      {brief.intro?.[lang] && <p className="lede">{brief.intro[lang]}</p>}

      {!isToday ? (
        // Archive is a read-only browse: every story is shown, the read state
        // is ignored (never hide or dim), so a past day never collapses to
        // "all caught up". The streak is unaffected — it's driven by Today.
        shown.length > 0 && (
          <div className="items">
            {shown.map((item) => (
              <BriefItemCard key={item.id} item={item} plain />
            ))}
          </div>
        )
      ) : (
        <>
          {unread.length > 0 && (
            <div className="items">
              {unread.map((item) => (
                <BriefItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {!showCard && hideRead && unread.length === 0 && read.length > 0 && (
            <div className="caught-up">
              <Icon name="sparkles" size={24} />
              <span>{t.allCaughtUp}</span>
            </div>
          )}

          {!hideRead && read.length > 0 && (
            <>
              <div className="read-divider">
                <span>{t.read}</span>
              </div>
              <div className="items items--read">
                {read.map((item) => (
                  <BriefItemCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}

          {showCard && (
            <>
              <div className="streak-divider">
                <span>{t.streakSectionLabel}</span>
              </div>
              <WeekStreak todayProgress={todayProgress} done={done} />
            </>
          )}
        </>
      )}

      {hiddenCount > 0 && <p className="filtered-note">{hiddenCountLabel(hiddenCount, lang)}</p>}

      {brief.sample && (
        <p className="sample-note">
          <span className="sample-note__badge">{t.sampleBadge}</span>
          {t.sampleNote}
        </p>
      )}
    </div>
  );
}
