import { useEffect, useRef, useState } from 'react';
import { isTip, type BriefItem, type ThreadRef } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { useSaved } from '../providers/SavedProvider';
import { todoFromStory, useTodo } from '../providers/TodoProvider';
import { useNav } from '../providers/NavProvider';
import { shareItem } from '../lib/share';
import { toast } from '../lib/toast';
import { haptic } from '../lib/haptics';
import { capitalizeFirst, daysAgo, formatDayMonth, formatShortDate } from '../lib/format';
import { ARCHIVE_DAYS } from '../lib/archive';
import { CategoryChip } from './CategoryChip';
import { SourceList } from './SourceList';
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
 * One story, read top to bottom: category → title → summary → why it matters
 * → sources, closed by a single action row of icon buttons — thumbs (the one
 * signal the generator gets back), save, share, and the ring that marks it
 * read, at the end of the reading where the thumb already is. Every action is
 * a visible button; swiping stays a shortcut. A read card keeps its place and
 * folds to its title (the body slides shut); the check in its header un-reads
 * it, which opens it again. With "hide read" on, the card fades out instead.
 */
export function BriefItemCard({ item, plain = false }: { item: BriefItem; plain?: boolean }) {
  const { lang, t, hideRead, todoEnabled } = useSettings();
  const { isRead, toggle } = useRead();
  const { isSaved, toggle: toggleSaved } = useSaved();
  const todo = useTodo();
  // `plain` (archive browse) ignores the read state entirely — no dim, no
  // fold, no read-toggle — so past days always show every story.
  const read = plain ? false : isRead(item.id);
  const saved = isSaved(item.id);
  const tip = isTip(item);
  const why = item.why?.[lang];
  const title = item.title[lang];
  // A read card is folded, full stop; un-reading it is what opens it.
  const folded = read;

  function handleSave() {
    const wasSaved = saved;
    toggleSaved(item);
    toast(wasSaved ? t.unsavedToast : t.savedToast);
  }

  // To do (optional): keep the story for later, or drop it again.
  const todoKey = todoFromStory(item).key;
  const inTodo = todoEnabled && todo.has(todoKey);
  function handleTodo() {
    haptic();
    if (todo.has(todoKey)) {
      todo.remove(todoKey);
      toast(t.todoRemovedToast);
    } else {
      todo.add(todoFromStory(item));
      toast(t.todoAddedToast);
    }
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
          {read && (
            <button
              type="button"
              className="item__stamp"
              aria-pressed="true"
              aria-label={t.markUnread}
              title={t.read}
              onClick={handleToggle}
            >
              <Icon name="check" size={14} />
            </button>
          )}
        </div>
        <h3 className="item__title">{title}</h3>
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
            </div>
            {/* Left: the small stuff (thumbs, To do, save, share). Right, on
                its own: the one primary action, marking the story read. */}
            <div className="item__bar">
              <div className="item__bar-left">
                <div className="item__bar-votes" role="group" aria-label={t.voteLabel} title={t.voteLabel}>
                  <VoteButtons id={item.id} />
                </div>
                {todoEnabled && (
                  <button
                    type="button"
                    className={`iconbtn${inTodo ? ' is-todo' : ''}`}
                    aria-pressed={inTodo}
                    aria-label={`${inTodo ? t.todoRemoveLabel : t.todoAddLabel} „${title}“`}
                    title={inTodo ? t.todoRemoveLabel : t.todoAddLabel}
                    onClick={handleTodo}
                  >
                    <Icon name={inTodo ? 'listCheck' : 'listPlus'} size={17} />
                  </button>
                )}
                <button
                  type="button"
                  className={`iconbtn${saved ? ' is-saved' : ''}`}
                  aria-label={`${saved ? t.removeSavedLabel : t.saveStoryLabel} „${title}“`}
                  aria-pressed={saved}
                  onClick={handleSave}
                >
                  <Icon name={saved ? 'bookmarkFilled' : 'bookmark'} size={17} />
                </button>
                <button
                  type="button"
                  className="iconbtn"
                  aria-label={`${t.shareStoryLabel} „${title}“`}
                  onClick={() => void shareItem(item, lang)}
                >
                  <Icon name="share" size={17} />
                </button>
              </div>
              {!plain && (
                <button
                  type="button"
                  className={`read-cta${checked ? ' is-read' : ''}`}
                  aria-pressed={checked}
                  aria-label={read ? t.markUnread : t.markRead}
                  title={t.read}
                  onClick={handleToggle}
                >
                  <Icon name="check" size={22} />
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    </SwipeToReveal>
  );
}
