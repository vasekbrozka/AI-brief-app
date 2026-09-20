import { useEffect, useMemo } from 'react';
import type { Brief } from '../lib/types';
import { hiddenCountLabel } from '../lib/format';
import { shareBrief } from '../lib/share';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { useStreak } from '../providers/StreakProvider';
import { useVotes } from '../providers/VotesProvider';
import { VoteButtons } from './VoteButtons';
import { BriefItemCard } from './BriefItemCard';
import { TermOfDay } from './TermOfDay';
import { RadarSection } from './RadarSection';
import { WeekStreak } from './WeekStreak';
import { Icon } from './Icon';

export function BriefView({ brief, isToday = false }: { brief: Brief; isToday?: boolean }) {
  const { lang, t, hideRead, mutedCategories, gamification } = useSettings();
  const { isRead } = useRead();
  const { currentStreak, markFinished } = useStreak();
  // One thumb for the whole day, counted under "<date>-brief".
  const dayId = `${brief.date}-brief`;
  const dayVote = useVotes().voteFor(dayId);

  // Muted categories drop out of the brief — but the day's top story always
  // stays, so muting never silently swallows the single highlight.
  const muted = useMemo(() => new Set(mutedCategories), [mutedCategories]);
  const shown = useMemo(
    () => brief.items.filter((item) => item.highlight || !muted.has(item.category)),
    [brief, muted],
  );
  const hiddenCount = brief.items.length - shown.length;

  const readShownCount = shown.filter((item) => isRead(item.id)).length;
  // Read cards fold to their title and stay in place; "hide read" drops them.
  const listed = hideRead ? shown.filter((item) => !isRead(item.id)) : shown;

  // The streak: a day counts as soon as one story of that day's brief is read;
  // the card's dot keeps filling until every story is read. Shown once there
  // is something to track — never greets a fresh morning with 0.
  const progress = shown.length ? readShownCount / shown.length : 0;
  const started = readShownCount > 0;
  const allRead = shown.length > 0 && readShownCount === shown.length;
  const showCard = isToday && gamification && shown.length > 0 && (started || currentStreak > 0);

  useEffect(() => {
    if (isToday && gamification && started) markFinished(brief.date);
  }, [isToday, gamification, started, brief.date, markFinished]);

  // Below the stories: the day's dates ahead (in the archive only — on Today
  // they live under "this week's top shots"), then the rating and sharing.
  const extras = (
    <>
      {!isToday && brief.radar && brief.radar.length > 0 && <RadarSection radar={brief.radar} />}
      <div className="panel rate">
        <span className="rate__label">
          {dayVote ? t.voteThanks : isToday ? t.rateTodayLabel : t.rateBriefLabel}
        </span>
        <VoteButtons id={dayId} />
      </div>
      <div className="share-brief-wrap">
        <button type="button" className="share-brief" onClick={() => void shareBrief(brief, lang)}>
          <Icon name="share" size={16} />
          {isToday ? t.shareBriefLabel : t.shareBriefArchiveLabel}
        </button>
      </div>
    </>
  );

  return (
    <div className="brief">

      {!isToday ? (
        // Archive is a read-only browse: every story is shown, the read state
        // is ignored (never hide or dim), so a past day never collapses to
        // "all caught up". The streak is unaffected — it's driven by Today.
        <>
          {shown.length > 0 && (
            <div className="items">
              {shown.map((item) => (
                <BriefItemCard key={item.id} item={item} plain />
              ))}
            </div>
          )}
          {extras}
        </>
      ) : (
        <>
          {listed.length > 0 && (
            <div className="items">
              {listed.map((item) => (
                <BriefItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* The streak card is the reward for the reading, so it follows the
              cards directly — its celebration must not fire off-screen. */}
          {showCard && (
            <>
              <div className="streak-divider">
                <span>{t.streakSectionLabel}</span>
              </div>
              <WeekStreak
                todayProgress={progress}
                done={allRead}
                started={started}
                activeIso={brief.date}
              />
            </>
          )}

          {/* After the stories: a term to learn, then the rating and sharing. */}
          <TermOfDay date={brief.date} />

          {extras}
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
