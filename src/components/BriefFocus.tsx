import { useCallback, useEffect } from 'react';
import type { BriefItem } from '../lib/types';
import { isTip } from '../lib/types';
import { capitalizeFirst, formatDayMonth, formatShortDate } from '../lib/format';
import { shareItem } from '../lib/share';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { useSaved } from '../providers/SavedProvider';
import { todoFromStory, useTodo } from '../providers/TodoProvider';
import { toast } from '../lib/toast';
import { CategoryChip } from './CategoryChip';
import { GlossaryText } from './GlossaryText';
import { SourceList } from './SourceList';
import { VoteButtons } from './VoteButtons';
import { Icon } from './Icon';

/** Two-digit story number, the way the strip and the badge count them. */
export function storyNo(i: number): string {
  return String(i + 1).padStart(2, '0');
}

/**
 * The desktop brief: one story at a time. The screen is wide enough to read a
 * whole story without scrolling, so it shows the current one in full, its
 * actions under it, and the rest of the day as a numbered strip along the
 * bottom. The primary button reads "done, next up" — it checks the story off
 * and moves to the next unread one, which is the whole loop of the app.
 */
export function BriefFocus({
  items,
  focusId,
  onFocus,
}: {
  items: BriefItem[];
  focusId: string | null;
  onFocus: (id: string) => void;
}) {
  const { lang, t, todoEnabled } = useSettings();
  const { isRead, toggle } = useRead();
  const { isSaved, toggle: toggleSaved } = useSaved();
  const todo = useTodo();

  const found = items.findIndex((item) => item.id === focusId);
  const index = found < 0 ? 0 : found;
  const item = items[index];

  const next = useCallback(() => {
    if (!item) return;
    if (!isRead(item.id)) toggle(item.id);
    const after =
      items.slice(index + 1).find((i) => !isRead(i.id)) ??
      items.slice(0, index).find((i) => !isRead(i.id)) ??
      items[index + 1];
    if (after) onFocus(after.id);
  }, [item, items, index, isRead, toggle, onFocus]);

  const step = useCallback(
    (by: number) => {
      const target = items[index + by];
      if (target) onFocus(target.id);
    },
    [items, index, onFocus],
  );

  // Arrow keys walk the brief; the story stays unread until the button says so.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName))) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  if (!item) return null;

  const title = item.title[lang];
  const why = item.why?.[lang];
  const read = isRead(item.id);
  const saved = isSaved(item.id);
  const tip = isTip(item);
  const todoKey = todoFromStory(item).key;
  const inTodo = todo.has(todoKey);
  const highlight = Boolean(item.highlight);
  const rest = items.filter((_, i) => i !== index);
  const lastOne = index === items.length - 1 && items.every((i) => isRead(i.id));

  function handleSave() {
    const wasSaved = saved;
    toggleSaved(item);
    toast(wasSaved ? t.unsavedToast : t.savedToast);
  }

  function handleTodo() {
    if (inTodo) {
      todo.remove(todoKey);
      toast(t.todoRemovedToast);
    } else {
      todo.add(todoFromStory(item));
      toast(t.todoAddedToast);
    }
  }

  return (
    <div className="focus">
      <article
        className={`hero${read ? ' is-read' : ''}${tip ? ' hero--tip' : ''}${
          highlight ? ' hero--highlight' : ''
        }`}
      >
        <div className="hero__head">
          <CategoryChip id={item.category} />
          {highlight && <span className="item__top">{t.topStory}</span>}
          {tip && (
            <span className="item__kind">
              <Icon name="sparkle" size={12} />
              {t.tipBadge}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`hero__no${read ? ' is-read' : ''}`}
          aria-pressed={read}
          aria-label={read ? t.markUnread : t.markRead}
          title={read ? t.markUnread : t.markRead}
          onClick={() => toggle(item.id)}
        >
          {read ? <Icon name="check" size={34} /> : storyNo(index)}
        </button>
        <h2 className="hero__title">{title}</h2>
        <p className="hero__summary">
          <GlossaryText text={item.summary[lang]} />
        </p>
        <div className="hero__grid">
          {why && (
            <div className="item__why hero__why">
              <span className="item__why-label">{tip ? t.howToTryLabel : t.whyLabel}</span>
              <p className="item__why-text">
                <GlossaryText text={why} />
              </p>
            </div>
          )}
          <div className="hero__meta">
            {item.eventDate && (
              <span className="hero__date">
                {capitalizeFirst(formatShortDate(item.eventDate, lang))}
              </span>
            )}
            <SourceList sources={item.sources} />
          </div>
        </div>
      </article>

      <div className="heroactions">
        <button type="button" className="heroaction" onClick={handleSave} aria-pressed={saved}>
          <Icon name={saved ? 'bookmarkFilled' : 'bookmark'} size={17} />
          {saved ? t.removeLabel : t.saveLabel}
        </button>
        {todoEnabled && (
          <button type="button" className="heroaction" onClick={handleTodo} aria-pressed={inTodo}>
            <Icon name={inTodo ? 'listCheck' : 'listPlus'} size={17} />
            {inTodo ? t.todoRemoveLabel : t.todoAddLabel}
          </button>
        )}
        <button
          type="button"
          className="heroaction"
          onClick={() => void shareItem(item, lang)}
        >
          <Icon name="share" size={17} />
          {t.shareLabel}
        </button>
        <div className="heroactions__vote">
          <span className="heroactions__votelabel">{t.voteLabel}</span>
          <VoteButtons id={item.id} />
        </div>
        <button type="button" className="heronext" onClick={next} disabled={lastOne}>
          {t.nextStory}
          <Icon name="chevronRight" size={18} />
        </button>
      </div>

      {rest.length > 0 && (
        <section className="strip" aria-label={t.moreInBrief}>
          <div className="strip__label">{t.moreInBrief}</div>
          <div className="strip__row">
            {items.map((other, i) =>
              i === index ? null : (
                <button
                  key={other.id}
                  type="button"
                  className={`stripcard${isRead(other.id) ? ' is-read' : ''}`}
                  onClick={() => onFocus(other.id)}
                >
                  <span className="stripcard__head">
                    <span className="stripcard__no">
                      {isRead(other.id) ? <Icon name="check" size={13} /> : storyNo(i)}
                    </span>
                    <CategoryChip id={other.category} />
                  </span>
                  <span className="stripcard__title">{other.title[lang]}</span>
                  {other.eventDate && (
                    <span className="stripcard__date">{formatDayMonth(other.eventDate, lang)}</span>
                  )}
                </button>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}
