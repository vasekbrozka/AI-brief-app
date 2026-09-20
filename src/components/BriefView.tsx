import { useEffect, useMemo, useState } from 'react';
import { isTip, type Brief } from '../lib/types';
import { hiddenCountLabel, tipCountLabel } from '../lib/format';
import { visibleItems } from '../lib/briefStats';
import { shareBrief } from '../lib/share';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { useStreak } from '../providers/StreakProvider';
import { useVotes } from '../providers/VotesProvider';
import { VoteButtons } from './VoteButtons';
import { BriefItemCard } from './BriefItemCard';
import { BriefFocus } from './BriefFocus';
import { CategoryChip } from './CategoryChip';
import { TermOfDay } from './TermOfDay';
import { RatePrompt } from './RatePrompt';
import { RadarSection } from './RadarSection';
import { WeekStreak } from './WeekStreak';
import { Icon } from './Icon';

export function BriefView({
  brief,
  isToday = false,
  focus = false,
}: {
  brief: Brief;
  isToday?: boolean;
  /** Desktop: one story at a time instead of a list of cards. */
  focus?: boolean;
}) {
  const { lang, t, hideRead, mutedCategories, gamification } = useSettings();
  const { isRead } = useRead();
  const { currentStreak, markFinished } = useStreak();
  // One thumb for the whole day, counted under "<date>-brief".
  const dayId = `${brief.date}-brief`;
  const dayVote = useVotes().voteFor(dayId);

  // Muted categories drop out of the brief — but the day's top story always
  // stays, so muting never silently swallows the single highlight.
  const shown = useMemo(() => visibleItems(brief.items, mutedCategories), [brief, mutedCategories]);
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

  // Archive is a read-only browse: every story is shown, the read state is
  // ignored (never hide or dim), so a past day never collapses to "all caught
  // up". The streak is unaffected — it's driven by Today.
  const cards = isToday ? listed : shown;

  // Which story the desktop reader has open. It starts on the first unread one
  // and then only moves when the reader moves it — "hide read" is a list
  // setting and has no say here, where the strip is the table of contents.
  const [focusId, setFocusId] = useState<string | null>(null);
  useEffect(() => {
    setFocusId((current) => {
      if (current && shown.some((item) => item.id === current)) return current;
      const first = shown.find((item) => !isRead(item.id)) ?? shown[0];
      return first ? first.id : null;
    });
    // Only when the day's stories change: picking up the read state here would
    // move the story out from under the reader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  const tips = focus ? shown.filter(isTip) : [];

  // Two blocks: the stories, and what follows the reading (streak, term of the
  // day, rating, sharing). On a phone they stack in this order; on a desktop
  // the second block becomes a right rail beside the columns of cards.
  return (
    <div className="brief">
      <div className="brief__main">
        {focus ? (
          <BriefFocus items={shown} focusId={focusId} onFocus={setFocusId} />
        ) : (
          cards.length > 0 && (
            <div className="items">
              {cards.map((item) => (
                <BriefItemCard key={item.id} item={item} plain={!isToday} />
              ))}
            </div>
          )
        )}
      </div>

      <aside className="brief__side">
        {/* Desktop only: the day's practical tips, as a way into them — the
            list version marks them with a badge in place. */}
        {tips.length > 0 && (
          <section className="railcard">
            <div className="railcard__label">{t.tipsRailLabel}</div>
            <div className="railcard__title">{tipCountLabel(tips.length, lang)}</div>
            <div className="railcard__rows">
              {tips.map((tipItem) => (
                <button
                  key={tipItem.id}
                  type="button"
                  className="railrow"
                  onClick={() => setFocusId(tipItem.id)}
                >
                  <CategoryChip id={tipItem.category} />
                  <span className="railrow__title">{tipItem.title[lang]}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* The streak card is the reward for the reading, so it follows the
            cards directly — its celebration must not fire off-screen. */}
        {isToday && showCard && (
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

        {/* Once everything is read: a term to learn, then the rating and sharing. */}
        {isToday && allRead && <TermOfDay date={brief.date} />}

        {extras}
      </aside>

      {/* The moment the last story is read, one gentle ask for the day's rating. */}
      {isToday && <RatePrompt dayId={dayId} date={brief.date} allRead={allRead} />}

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
