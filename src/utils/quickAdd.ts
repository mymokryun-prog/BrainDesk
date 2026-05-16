import type { Category, ItemFilters, ItemInput, ItemType } from '../types/item';

export function createQuickItemInput(
  title: string,
  category: ItemFilters['category'],
  type: ItemType,
): ItemInput | undefined {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return undefined;

  return {
    title: trimmedTitle,
    category: resolveQuickAddCategory(category),
    type,
  };
}

function resolveQuickAddCategory(category: ItemFilters['category']): Category {
  return category === 'All' ? 'Personal' : category;
}
