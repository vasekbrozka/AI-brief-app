import { useEffect, useMemo, useState } from 'react';
import type { Brief, CategoryId } from '../lib/types';
import { CATEGORIES, CATEGORY_ORDER } from '../lib/categories';
import { hiddenCountLabel, streakLabel, streakLevelIndex } from '../lib/format';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { useStreak } from '../providers/StreakProvider';
import { BriefItemCard } from './BriefItemCard';
import { FillingCup } from './FillingCup';
import { Icon } from './Icon';

type Filter = CategoryId | 'all';

export function BriefView({ brief, isToday = false }: { brief: Brief; isToday?: boolean }) {
  const { lang, t, hideRead, showCategories, mutedCategories, gamification } = useSettings();
  const { isRead } = useRead();
  const { currentStreak, markFinished } = useStreak();
  const [filter, setFilter] = useState<Filter>('all');

  // Muted categories drop out of the brief — but the day's top story always
  // stays, so muting never silently swallows the single highlight.
  const muted = useMemo(() => new Set(mutedCategories), [mutedCategories]);
  const shown = useMemo(
    () => brief.items.filter((item) => item.highlight || !muted.has(item.category)),
    [brief, muted],
  );
  const hiddenCount = brief.items.length - shown.length;

  const presentCategories = useMemo(
    () => CATEGORY_ORDER.filter((c) => shown.some((item) => item.category === c)),
    [shown],
  );

  const visible =
    filter === 'all' ? shown : shown.filter((item) => item.category === filter);
  const unread = visible.filter((item) => !isRead(item.id));
  const read = visible.filter((item) => isRead(item.id));

  // The cup fills with today's reading progress; full cup = day finished.
  const readShownCount = shown.filter((item) => isRead(item.id)).length;
  const done = shown.length > 0 && readShownCount === shown.length;
  const showCup = isToday && gamification && shown.length > 0;

  useEffect(() => {
    if (showCup && done) markFinished();
  }, [showCup, done, markFinished]);

  return (
    <div className="brief">
      {brief.intro?.[lang] && (
        <section className="gist">
          <div className="gist__label">{t.gistLabel}</div>
          <p className="gist__text">{brief.intro[lang]}</p>
        </section>
      )}

      {showCategories && presentCategories.length > 1 && (
        <div className="filters" role="group" aria-label={t.allCategories}>
          <button
            type="button"
            className={`filter${filter === 'all' ? ' is-active' : ''}`}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            {t.allCategories}
          </button>
          {presentCategories.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter${filter === c ? ' is-active' : ''}`}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {CATEGORIES[c].label[lang]}
            </button>
          ))}
        </div>
      )}

      {unread.length > 0 && (
        <div className="items">
          {unread.map((item) => (
            <BriefItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {!showCup && hideRead && unread.length === 0 && read.length > 0 && (
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

      {showCup && (
        <div className={`ritual${done ? ' ritual--done' : ''}`}>
          <span className="ritual__cup">
            <FillingCup fraction={readShownCount / shown.length} size={30} />
          </span>
          {done ? (
            <>
              <span className="ritual__title">
                {t.streakLevels[streakLevelIndex(Math.max(1, currentStreak))]}
              </span>
              <span className="ritual__streak">
                {streakLabel(Math.max(1, currentStreak), lang)}
              </span>
            </>
          ) : (
            <span className="ritual__count">
              {readShownCount} / {shown.length}
            </span>
          )}
        </div>
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
