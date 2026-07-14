import { useEffect, useRef, useState } from 'react';
import type { BriefItem } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { CategoryChip } from './CategoryChip';
import { SourceList } from './SourceList';
import { VerifiedBadge } from './VerifiedBadge';
import { Icon } from './Icon';

// Keep in sync with the `item-exit` animation duration in index.css.
const EXIT_MS = 220;

export function BriefItemCard({ item }: { item: BriefItem }) {
  const { lang, t } = useSettings();
  const { isRead, toggle } = useRead();
  const read = isRead(item.id);

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
            className={`read-toggle${checked ? ' is-read' : ''}`}
            aria-pressed={checked}
            aria-label={read ? t.markUnread : t.markRead}
            onClick={handleToggle}
          >
            <span className="read-toggle__circle">
              {checked && <Icon name="check" size={13} />}
            </span>
          </button>
        </div>
      </div>
      <h3 className="item__title">{item.title[lang]}</h3>
      <p className="item__summary">{item.summary[lang]}</p>
      <div className="item__footer">
        <SourceList sources={item.sources} />
        {item.verified && <VerifiedBadge />}
      </div>
    </article>
  );
}
