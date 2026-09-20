import { useCallback, useEffect } from 'react';
import type { BriefItem } from '../lib/types';
import { formatDayMonth } from '../lib/format';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { BriefItemCard } from './BriefItemCard';
import { CategoryChip } from './CategoryChip';
import { Icon } from './Icon';

/** Two-digit story number, the way the strip counts them. */
function storyNo(i: number): string {
  return String(i + 1).padStart(2, '0');
}

/**
 * The desktop brief: the same story card the phone shows, one at a time and
 * the full width of the column, with the rest of the day waiting in a
 * numbered strip below it. Only the arrangement is new — the card, its check
 * and its action row are the app's own components.
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
  const { lang, t } = useSettings();
  const { isRead, toggle } = useRead();

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

  // Arrow keys walk the brief; a story stays unread until the button says so.
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

  const lastOne = index === items.length - 1 && items.every((i) => isRead(i.id));

  return (
    <div className="focus">
      <BriefItemCard key={item.id} item={item} keepInPlace />

      <div className="focus__next">
        <button type="button" className="btn focus__nextbtn" onClick={next} disabled={lastOne}>
          {t.nextStory}
          <Icon name="chevronRight" size={17} />
        </button>
      </div>

      {items.length > 1 && (
        <section className="strip" aria-label={t.moreInBrief}>
          <div className="section-divider">
            <span>{t.moreInBrief}</span>
          </div>
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
