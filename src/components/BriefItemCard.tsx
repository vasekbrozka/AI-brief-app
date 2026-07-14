import type { BriefItem } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { CategoryChip } from './CategoryChip';
import { SourceList } from './SourceList';
import { VerifiedBadge } from './VerifiedBadge';

export function BriefItemCard({ item }: { item: BriefItem }) {
  const { lang, t } = useSettings();

  return (
    <article className={`item${item.highlight ? ' item--highlight' : ''}`}>
      <div className="item__meta">
        <CategoryChip id={item.category} />
        {item.highlight && <span className="item__top">{t.topStory}</span>}
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
