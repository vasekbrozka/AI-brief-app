import { useMemo, useState } from 'react';
import type { Brief, CategoryId } from '../lib/types';
import { CATEGORIES, CATEGORY_ORDER } from '../lib/categories';
import { useSettings } from '../providers/SettingsProvider';
import { BriefItemCard } from './BriefItemCard';
import { Icon } from './Icon';

type Filter = CategoryId | 'all';

export function BriefView({ brief }: { brief: Brief }) {
  const { lang, t } = useSettings();
  const [filter, setFilter] = useState<Filter>('all');

  const presentCategories = useMemo(
    () => CATEGORY_ORDER.filter((c) => brief.items.some((item) => item.category === c)),
    [brief],
  );

  const items =
    filter === 'all' ? brief.items : brief.items.filter((item) => item.category === filter);

  return (
    <div className="brief">
      {brief.intro?.[lang] && (
        <section className="gist">
          <div className="gist__label">
            <Icon name="sparkle" className="gist__icon" size={16} />
            {t.gistLabel}
          </div>
          <p className="gist__text">{brief.intro[lang]}</p>
        </section>
      )}

      {presentCategories.length > 1 && (
        <div className="filters" role="group" aria-label={t.allCategories}>
          <button
            type="button"
            className={`filter${filter === 'all' ? ' is-active' : ''}`}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            {t.allCategories}
          </button>
          {presentCategories.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter${filter === c ? ' is-active' : ''}`}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {CATEGORIES[c].label[lang]}
            </button>
          ))}
        </div>
      )}

      <div className="items">
        {items.map((item) => (
          <BriefItemCard key={item.id} item={item} />
        ))}
      </div>

      {brief.sample && (
        <p className="sample-note">
          <span className="sample-note__badge">{t.sampleBadge}</span>
          {t.sampleNote}
        </p>
      )}
    </div>
  );
}
