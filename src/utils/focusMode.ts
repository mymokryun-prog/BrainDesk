import type { Item, Relationship } from '../types/item';

export function getFocusedItemIds(
  selectedItemId: string | undefined,
  items: Item[],
  relationships: Relationship[],
): Set<string> {
  if (!selectedItemId || !items.some((item) => item.id === selectedItemId)) {
    return new Set(items.map((item) => item.id));
  }

  const focusedIds = new Set([selectedItemId]);

  relationships.forEach((relationship) => {
    if (relationship.sourceItemId === selectedItemId) focusedIds.add(relationship.targetItemId);
    if (relationship.targetItemId === selectedItemId) focusedIds.add(relationship.sourceItemId);
  });

  return focusedIds;
}
