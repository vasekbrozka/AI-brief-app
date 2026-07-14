import type { BriefItem } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { CategoryChip } from './CategoryChip';
import { SourceList } from './SourceList';
import { VerifiedBadge } from './VerifiedBadge';
import { Icon } from './Icon';

export function BriefItemCard({ item }: { item: BriefItem }) {
  const { lang, t } = useSettings();
  const { isRead, toggle } = useRead();
  const read = isRead(item.id);
  const showTop = Boolean(item.highlight) && !read;

  return (
    <article
      className={`item${showTop ? ' item--highlight' : ''}${read ? ' item--read' : ''}`}
    >
      <div className="item__meta">
        <CategoryChip id={item.category} />
        {showTop && <span className="item__top">{t.topStory}</span>}
        <div className="item__meta-right">
          {read && <span className="item__readtag">{t.read}</span>}
          <button
            type="button"
            className={`read-toggle${read ? ' is-read' : ''}`}
            aria-pressed={read}
            aria-label={read ? t.markUnread : t.markRead}
            onClick={() => toggle(item.id)}
          >
            <span className="read-toggle__circle">
              {read && <Icon name="check" size={13} />}
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
