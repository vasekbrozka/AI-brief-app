import { useEffect, useRef, useState } from 'react';
import { isTip, type BriefItem, type ThreadRef } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { useSaved } from '../providers/SavedProvider';
import { useVotes } from '../providers/VotesProvider';
import { useNav } from '../providers/NavProvider';
import { shareItem } from '../lib/share';
import { toast } from '../lib/toast';
import { haptic } from '../lib/haptics';
import { capitalizeFirst, daysAgo, formatDayMonth, formatShortDate } from '../lib/format';
import { ARCHIVE_DAYS } from '../lib/archive';
import { CategoryChip } from './CategoryChip';
import { SourceList } from './SourceList';
import { VerifiedBadge } from './VerifiedBadge';
import { SwipeToReveal } from './SwipeToReveal';
import { GlossaryText } from './GlossaryText';
import { VoteButtons } from './VoteButtons';
import { Icon } from './Icon';

// Keep in sync with the `item-exit` animation duration in index.css.
const EXIT_MS = 220;

/** "Follows up on …" link back to an earlier story; tappable while still archived. */
function ThreadLink({ thread }: { thread: ThreadRef }) {
  const { lang, t } = useSettings();
  const { openBriefDate } = useNav();
  const age = daysAgo(thread.date);
  const reachable = age >= 0 && age < ARCHIVE_DAYS;
  const date = capitalizeFirst(formatShortDate(thread.date, lang));

  const inner = (
    <>
      <Icon name="thread" className="thread__icon" size={15} />
      <span className="thread__label">{t.threadLabel}</span>
      <span className="thread__title">{thread.title[lang]}</span>
      <span className="thread__date">· {date}</span>
    </>
  );

  if (!reachable) return <div className="thread thread--static">{inner}</div>;
  return (
    <button type="button" className="thread" onClick={() => openBriefDate(thread.date)}>
      {inner}
    </button>
  );
}

/**
 * One story. Marking it read keeps it in place but folds it to its title (the
 * body slides shut); tapping the title unfolds it again. With "hide read" on,
 * the card fades out and leaves the list instead.
 */
export function BriefItemCard({ item, plain = false }: { item: BriefItem; plain?: boolean }) {
  const { lang, t, hideRead } = useSettings();
  const { isRead, toggle } = useRead();
  const { isSaved, toggle: toggleSaved } = useSaved();
  const myVote = useVotes().voteFor(item.id);
  // `plain` (archive browse) ignores the read state entirely — no dim, no
  // fold, no read-toggle — so past days always show every story.
  const read = plain ? false : isRead(item.id);
  const saved = isSaved(item.id);
  const tip = isTip(item);
  const why = item.why?.[lang];

  // A read card is folded unless the reader unfolds it; unreading resets that.
  const [unfolded, setUnfolded] = useState(false);
  useEffect(() => {
    if (!read) setUnfolded(false);
  }, [read]);
  const folded = read && !unfolded;

  function handleSave() {
    const wasSaved = saved;
    toggleSaved(item);
    toast(wasSaved ? t.unsavedToast : t.savedToast);
  }

  const [exiting, setExiting] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  // Show the checkmark the instant it's tapped, before the card animates away.
  const checked = read || exiting;
  const showTop = Boolean(item.highlight) && !read;

  function handleToggle() {
    haptic();
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Unreading, folding in place, or reduced motion: apply immediately — the
    // fold itself is a CSS transition. Only a card that leaves the list
    // (hide-read on) gets the short fade-out first.
    if (read || !hideRead || reduce) {
      toggle(item.id);
      return;
    }
    setExiting(true);
    timeoutRef.current = window.setTimeout(() => toggle(item.id), EXIT_MS);
  }

  const cls = [
    'item',
    showTop ? 'item--highlight' : '',
    tip ? 'item--tip' : '',
    read ? 'item--read' : '',
    folded ? 'item--folded' : '',
    exiting ? 'item--exiting' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <SwipeToReveal
      right={{ label: t.shareLabel, icon: 'share', onAction: () => void shareItem(item, lang) }}
      left={{
        label: saved ? t.removeLabel : t.saveLabel,
        icon: saved ? 'bookmarkFilled' : 'bookmark',
        onAction: handleSave,
      }}
    >
      <article className={cls}>
        <div className="item__meta">
          <CategoryChip id={item.category} />
          {showTop && <span className="item__top">{t.topStory}</span>}
          {tip && (
            <span className="item__kind">
              <Icon name="sparkle" size={12} />
              {t.tipBadge}
            </span>
          )}
          <div className="item__meta-right">
            {read && <span className="item__readtag">{t.read}</span>}
            <button
              type="button"
              className={`card-save${saved ? ' is-saved' : ''}`}
              aria-label={`${saved ? t.removeSavedLabel : t.saveStoryLabel} „${item.title[lang]}“`}
              aria-pressed={saved}
              onClick={handleSave}
            >
              <Icon name={saved ? 'bookmarkFilled' : 'bookmark'} size={17} />
            </button>
            <button
              type="button"
              className="card-share"
              aria-label={`${t.shareStoryLabel} „${item.title[lang]}“`}
              onClick={() => void shareItem(item, lang)}
            >
              <Icon name="share" size={17} />
            </button>
            {!plain && (
              <button
                type="button"
                className={`read-toggle${checked ? ' is-read' : ''}`}
                aria-pressed={checked}
                aria-label={read ? t.markUnread : t.markRead}
                onClick={handleToggle}
              >
                <span className="read-toggle__circle">
                  {checked && <Icon name="check" size={13} />}
                </span>
              </button>
            )}
          </div>
        </div>
        {read ? (
          <button
            type="button"
            className="item__title item__title--btn"
            aria-expanded={!folded}
            aria-label={folded ? t.unfoldLabel : t.foldLabel}
            onClick={() => {
              haptic();
              setUnfolded((v) => !v);
            }}
          >
            <span>{item.title[lang]}</span>
            <Icon name="chevronRight" className="item__fold-chevron" size={16} />
          </button>
        ) : (
          <h3 className="item__title">{item.title[lang]}</h3>
        )}
        {/* The body folds shut on a read card — a grid-rows transition, so
            no measuring and no jump. */}
        <div className="item__body" data-open={folded ? 'false' : 'true'} aria-hidden={folded}>
          <div className="item__body-inner">
            <p className="item__summary">
              <GlossaryText text={item.summary[lang]} />
            </p>
            {why && (
              <div className="item__why">
                <span className="item__why-label">{tip ? t.howToTryLabel : t.whyLabel}</span>
                <p className="item__why-text">
                  <GlossaryText text={why} />
                </p>
              </div>
            )}
            {item.followsUp && <ThreadLink thread={item.followsUp} />}
            <div className="item__footer">
              {item.eventDate && (
                <span
                  className="item__date"
                  title={capitalizeFirst(formatShortDate(item.eventDate, lang))}
                >
                  {formatDayMonth(item.eventDate, lang)}
                </span>
              )}
              <SourceList sources={item.sources} />
              {item.verified && <VerifiedBadge />}
            </div>
            {/* Anonymous thumbs: the one signal the generator gets back from readers. */}
            <div className="item__vote">
              <span className="item__vote-label">{myVote ? t.voteThanks : t.voteLabel}</span>
              <VoteButtons id={item.id} />
            </div>
          </div>
        </div>
      </article>
    </SwipeToReveal>
  );
}
