import { CATEGORIES } from '../lib/categories';
import type { CategoryId } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';

export function CategoryChip({ id }: { id: CategoryId }) {
  const { lang } = useSettings();
  const category = CATEGORIES[id];
  return <span className={`chip chip--${category.tint}`}>{category.label[lang]}</span>;
}
