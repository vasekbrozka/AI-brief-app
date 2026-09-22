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
import { RatePrompt } from './RatePrompt';
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
  const { lang, t, hideRead, mutedCategories, gamification } = useSettings();
  // Wide enough for four columns: the month ahead becomes the right-hand one
  // and takes the streak and the sharing with it.
  const wide = useMediaQuery(WIDE_QUERY);
  // The week's column ends in the term of the day, so it fades its last
  // cards out while there are more of them above it than fit.
  const sideScroll = useScrollFade<HTMLDivElement>();
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

  // What sits at the foot of the week's column: the term of the day, pinned
  // there so it is reachable without scrolling the week, and — until the month
  // ahead's column takes them over — the streak and the sharing.
  const sideFoot = (
    <>
      {focus && isToday && <TermOfDay date={brief.date} />}
      {!(wide && focus) && (focus ? footBlock : shareBlock)}
    </>
  );

  // Two blocks: the stories, and what follows the reading (streak, term of the
  // day, rating, sharing). On a phone they stack in this order; on a desktop
  // the second block becomes a right rail beside the columns of cards.
  return (
    <div className={`brief${focus ? ' brief--focus' : ''}`}>
      <div className="brief__main">
        {cards.length > 0 && (
          <div className="items">
            {cards.map((item) => (
              <BriefItemCard key={item.id} item={item} plain={!isToday} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop's right-hand column: the month ahead, the category filters
          beside the stories they hide, and the streak and sharing under them. */}
      {focus && (
        <PlanColumn
          today={brief.date}
          radar={brief.radar}
          foot={wide ? footBlock : undefined}
        />
      )}

      <aside className="brief__side">
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
            finishing. On a desktop it is pinned to the foot of this column. */}
        {!focus && isToday && <TermOfDay date={brief.date} />}

        {!isToday && brief.radar && brief.radar.length > 0 && <RadarSection radar={brief.radar} />}
        {!focus && ratePanel}
        </div>
        {/* The streak, sharing and the day's thumbs stay at the foot of the
            column while the week scrolls above them — until the window is wide
            enough for the month ahead to become the right-hand column and take
            them over. */}
        <div className="side__foot">{sideFoot}</div>
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
