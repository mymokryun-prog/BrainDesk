import type { Item, Relationship } from '../types/item';

export interface RelationshipSuggestion {
  item: Item;
  score: number;
  reason: string;
}

const stopWords = new Set([
  'and',
  'the',
  'for',
  'with',
  'from',
  'this',
  'that',
  'item',
  'note',
  'task',
]);

export function suggestRelationships(
  selectedItem: Item,
  items: Item[],
  relationships: Relationship[],
  limit = 3,
): RelationshipSuggestion[] {
  const linkedItemIds = new Set(
    relationships.flatMap((relationship) => {
      if (relationship.sourceItemId === selectedItem.id) return [relationship.targetItemId];
      if (relationship.targetItemId === selectedItem.id) return [relationship.sourceItemId];
      return [];
    }),
  );
  const selectedTags = new Set(selectedItem.tags.map(normalize));
  const selectedKeywords = getKeywords(selectedItem);

  return items
    .filter((item) => item.id !== selectedItem.id && item.status !== 'archived' && !linkedItemIds.has(item.id))
    .map((item) => {
      const sharedTags = item.tags.map(normalize).filter((tag) => selectedTags.has(tag));
      const sharedKeywords = Array.from(getKeywords(item)).filter((keyword) => selectedKeywords.has(keyword));
      const sameCategory = item.category === selectedItem.category;
      const score = sharedTags.length * 4 + sharedKeywords.length * 2 + (sameCategory ? 1 : 0);

      return {
        item,
        score,
        reason: getSuggestionReason(sharedTags.length, sharedKeywords.length, sameCategory),
      };
    })
    .filter((suggestion) => suggestion.score > 0)
    .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title))
    .slice(0, limit);
}

function getSuggestionReason(sharedTagCount: number, sharedKeywordCount: number, sameCategory: boolean): string {
  const reasons: string[] = [];
  if (sharedTagCount > 0) reasons.push(`${sharedTagCount} shared tag${sharedTagCount === 1 ? '' : 's'}`);
  if (sharedKeywordCount > 0) {
    reasons.push(`${sharedKeywordCount} matching keyword${sharedKeywordCount === 1 ? '' : 's'}`);
  }
  if (sameCategory) reasons.push('same category');
  return reasons.join(', ');
}

function getKeywords(item: Item): Set<string> {
  return new Set(
    `${item.title} ${item.description}`
      .toLowerCase()
      .split(/[^a-z0-9가-힣]+/i)
      .map((word) => word.trim())
      .filter((word) => word.length >= 3 && !stopWords.has(word)),
  );
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}
