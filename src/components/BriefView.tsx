import { useEffect, useMemo } from 'react';
import { WIDE_QUERY, useMediaQuery } from '../hooks/useMedia';
import { useScrollFade } from '../hooks/useScrollFade';
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
import { CategoryChip } from './CategoryChip';
import { WeekRail } from './WeekRail';
import { TermOfDay } from './TermOfDay';
import { RadarSection } from './RadarSection';
import { PlanColumn } from './PlanColumn';
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
  const { lang, t, hideRead, mutedCategories, mutedKinds, gamification } = useSettings();
  // Wide enough for four columns: the month ahead becomes the right-hand one
  // and takes the streak and the sharing with it.
  const wide = useMediaQuery(WIDE_QUERY);
  // The week's column ends in the term of the day, so it fades its last
  // cards out while there are more of them above it than fit.
  const sideScroll = useScrollFade<HTMLDivElement>();
  // The stories scroll behind the column's bottom edge, so they fade out
  // there too rather than ending on a card sliced in half.
  const mainScroll = useScrollFade<HTMLDivElement>();
  const { isRead } = useRead();
  const { currentStreak, markFinished } = useStreak();
  // One thumb for the whole day, counted under "<date>-brief".
  const dayId = `${brief.date}-brief`;
  const dayVote = useVotes().voteFor(dayId);

  // Muted categories drop out of the brief — but the day's top story always
  // stays, so muting never silently swallows the single highlight.
  const shown = useMemo(
    () => visibleItems(brief.items, mutedCategories, mutedKinds),
    [brief, mutedCategories, mutedKinds],
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

  // What follows the reading: the dates ahead (in the archive only — on Today
  // they live under "this week's top shots"), the rating and sharing. On a
  // desktop the streak and the rating move into their own column beside the
  // story; on a phone they all stack under it, in this order.
  const ratePanel = (
    <div className="panel rate">
      <span className="rate__label">
        {dayVote ? t.voteThanks : isToday ? t.rateTodayLabel : t.rateBriefLabel}
      </span>
      <VoteButtons id={dayId} />
    </div>
  );

  const shareBlock = (
    <div className="share-brief-wrap">
      <button type="button" className="share-brief" onClick={() => void shareBrief(brief, lang)}>
        <Icon name="share" size={16} />
        {isToday ? t.shareBriefLabel : t.shareBriefArchiveLabel}
      </button>
    </div>
  );

  // Archive is a read-only browse: every story is shown, the read state is
  // ignored (never hide or dim), so a past day never collapses to "all caught
  // up". The streak is unaffected — it's driven by Today.
  const cards = isToday ? listed : shown;

  const tips = focus ? shown.filter(isTip) : [];

  const streakBlock = isToday && showCard && (
    <>
      {/* The desktop's columns label nothing: a card says what it is. */}
      {!focus && (
        <div className="streak-divider">
          <span>{t.streakSectionLabel}</span>
        </div>
      )}
      <WeekStreak
        todayProgress={progress}
        done={allRead}
        started={started}
        activeIso={brief.date}
      />
    </>
  );

  // Sharing and the day's thumbs on one line, under the streak. Whichever
  // column is at the right edge carries them.
  const footBlock = (
    <>
      {streakBlock}
      <div className="footbar">
        <button
          type="button"
          className="share-brief"
          onClick={() => void shareBrief(brief, lang)}
        >
          <Icon name="share" size={16} />
          {t.shareLabel}
        </button>
        <div
          className="footbar__votes"
          role="group"
          aria-label={isToday ? t.rateTodayLabel : t.rateBriefLabel}
        >
          <VoteButtons id={dayId} />
        </div>
      </div>
    </>
  );

  // Off the reader, the foot of this column is where the phone's sharing sits.
  // The reader has nothing to pin there.

  // The week is the first thing to go when the window narrows: the month ahead
  // and the filters are what stay beside the stories.
  const showSide = !focus || wide;

  // Two blocks: the stories, and what follows the reading (streak, term of the
  // day, rating, sharing). On a phone they stack in this order; on a desktop
  // the second block becomes a right rail beside the columns of cards.
  return (
    <div className={`brief${focus ? ' brief--focus' : ''}`}>
      <div
        className={`brief__main${mainScroll.more ? ' has-more' : ''}`}
        ref={mainScroll.ref}
      >
        {cards.length > 0 && (
          <div className="items">
            {cards.map((item) => (
              <BriefItemCard key={item.id} item={item} plain={!isToday} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop's right-hand column, the one every desktop has room for: the
          month ahead, the category filters beside the stories they hide, and
          the streak and sharing pinned under them. */}
      {focus && <PlanColumn today={brief.date} radar={brief.radar} foot={footBlock} />}

      {showSide && (
      <aside className="brief__side">
        {/* The term of the day heads this column and stays put: the week runs
            on under it and off the bottom of the page, like the stories. It is
            never moved into the tinted panel when this column has to go — it
            would push the filters out of view — so on a narrower window it is
            simply not on the desktop at all. */}
        {focus && isToday && (
          <div className="side__head">
            <TermOfDay date={brief.date} />
          </div>
        )}
        <div
          className={`side__scroll${sideScroll.more ? ' has-more' : ''}`}
          ref={sideScroll.ref}
        >
        {/* The desktop's second column: the week beside the day, so a wide
            screen needs no switch between them. */}
        {focus && isToday && <WeekRail />}

        {/* Desktop only: the day's practical tips, as a way into them — the
            list version marks them with a badge in place. */}
        {tips.length > 0 && (
          <>
            <div className="section-divider">
              <span>
                {t.tipsRailLabel} · {tipCountLabel(tips.length, lang)}
              </span>
            </div>
            <div className="panel">
              {tips.map((tipItem) => (
                <a key={tipItem.id} className="railrow" href={`#${tipItem.id}`}>
                  <CategoryChip id={tipItem.category} />
                  <span className="railrow__title">{tipItem.title[lang]}</span>
                </a>
              ))}
            </div>
          </>
        )}

        {/* The streak card is the reward for the reading, so it follows the
            cards directly — its celebration must not fire off-screen. */}
        {!focus && streakBlock}

        {/* A term to learn, there from the start rather than as a reward for
            finishing. The phone's only, for now — the desktop's columns have
            no room to spare for it. */}
        {!focus && isToday && <TermOfDay date={brief.date} />}

        {!isToday && brief.radar && brief.radar.length > 0 && <RadarSection radar={brief.radar} />}
        {!focus && ratePanel}
        </div>
        {/* The streak, sharing and the day's thumbs stay at the foot of the
            column while the week scrolls above them — until the window is wide
            enough for the month ahead to become the right-hand column and take
            them over. */}
        {!focus && <div className="side__foot">{shareBlock}</div>}
      </aside>
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
