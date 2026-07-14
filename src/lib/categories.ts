import type { CategoryId, Lang, Localized } from './types';

export interface CategoryMeta {
  id: CategoryId;
  label: Localized;
  /** Tint name — maps to a `.chip--{tint}` class in the stylesheet. */
  tint: 'indigo' | 'teal' | 'blue' | 'orange' | 'pink' | 'green';
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  models: { id: 'models', label: { cs: 'Modely', en: 'Models' }, tint: 'indigo' },
  research: { id: 'research', label: { cs: 'Výzkum', en: 'Research' }, tint: 'teal' },
  business: { id: 'business', label: { cs: 'Byznys', en: 'Business' }, tint: 'blue' },
  tools: { id: 'tools', label: { cs: 'Nástroje', en: 'Tools' }, tint: 'orange' },
  policy: { id: 'policy', label: { cs: 'Regulace', en: 'Policy' }, tint: 'pink' },
  opensource: {
    id: 'opensource',
    label: { cs: 'Open source', en: 'Open Source' },
    tint: 'green',
  },
};

export const CATEGORY_ORDER: CategoryId[] = [
  'models',
  'research',
  'business',
  'tools',
  'policy',
  'opensource',
];

export function categoryLabel(id: CategoryId, lang: Lang): string {
  return CATEGORIES[id]?.label[lang] ?? id;
}
