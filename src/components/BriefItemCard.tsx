import { useEffect, useRef, useState } from 'react';
import type { BriefItem, ThreadRef } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { useSaved } from '../providers/SavedProvider';
import { useNav } from '../providers/NavProvider';
import { shareItem } from '../lib/share';
import { toast } from '../lib/toast';
import { capitalizeFirst, daysAgo, formatShortDate } from '../lib/format';
import { CategoryChip } from './CategoryChip';
import { SourceList } from './SourceList';
import { VerifiedBadge } from './VerifiedBadge';
import { SwipeToReveal } from './SwipeToReveal';
import { GlossaryText } from './GlossaryText';
import { Icon } from './Icon';

// Keep in sync with the `item-exit` animation duration in index.css.
const EXIT_MS = 220;

/** "Follows up on …" link back to an earlier story; tappable while still archived. */
function ThreadLink({ thread }: { thread: ThreadRef }) {
  const { lang, t } = useSettings();
  const { openBriefDate } = useNav();
  const age = daysAgo(thread.date);
  const reachable = age >= 0 && age < 7; // matches the 7-day archive window
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

export function BriefItemCard({ item, plain = false }: { item: BriefItem; plain?: boolean }) {
  const { lang, t } = useSettings();
  const { isRead, toggle } = useRead();
  const { isSaved, toggle: toggleSaved } = useSaved();
  // `plain` (archive browse) ignores the read state entirely — no dim, no
  // read-toggle — so past days always show every story.
  const read = plain ? false : isRead(item.id);
  const saved = isSaved(item.id);

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
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Un-reading, or reduced motion: apply immediately with no animation.
    if (read || reduce) {
      toggle(item.id);
      return;
    }
    // Marking read: brief fade-out, then move it to the read pile.
    setExiting(true);
    timeoutRef.current = window.setTimeout(() => toggle(item.id), EXIT_MS);
  }

  return (
    <SwipeToReveal
      right={{ label: t.shareLabel, icon: 'share', onAction: () => void shareItem(item, lang) }}
      left={{
        label: saved ? t.removeLabel : t.saveLabel,
        icon: saved ? 'bookmarkFilled' : 'bookmark',
        onAction: handleSave,
      }}
    >
      <article
        className={`item${showTop ? ' item--highlight' : ''}${read ? ' item--read' : ''}${
          exiting ? ' item--exiting' : ''
        }`}
      >
        <div className="item__meta">
          <CategoryChip id={item.category} />
          {showTop && <span className="item__top">{t.topStory}</span>}
          <div className="item__meta-right">
            {read && <span className="item__readtag">{t.read}</span>}
            <button
              type="button"
              className={`card-save${saved ? ' is-saved' : ''}`}
              aria-label={saved ? t.removeLabel : t.saveLabel}
              aria-pressed={saved}
              onClick={handleSave}
            >
              <Icon name={saved ? 'bookmarkFilled' : 'bookmark'} size={17} />
            </button>
            <button
              type="button"
              className="card-share"
              aria-label={t.shareLabel}
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
        <h3 className="item__title">{item.title[lang]}</h3>
        <p className="item__summary">
          <GlossaryText text={item.summary[lang]} />
        </p>
        {item.followsUp && <ThreadLink thread={item.followsUp} />}
        <div className="item__footer">
          <SourceList sources={item.sources} />
          {item.verified && <VerifiedBadge />}
        </div>
      </article>
    </SwipeToReveal>
  );
}
