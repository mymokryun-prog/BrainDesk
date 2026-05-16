import { describe, expect, it } from 'vitest';
import { suggestRelationships } from '../utils/relationshipSuggestions';
import type { Item, Relationship } from '../types/item';

const baseItem: Item = {
  id: 'base',
  title: 'Base item',
  description: '',
  type: 'note',
  category: 'Company',
  status: 'active',
  priority: 'medium',
  dueDate: '',
  tags: [],
  position: { x: 0, y: 0 },
  attachments: [],
  checklist: [],
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
};

function item(input: Partial<Item> & Pick<Item, 'id' | 'title'>): Item {
  return { ...baseItem, ...input };
}

function relationship(sourceItemId: string, targetItemId: string): Relationship {
  return {
    id: `${sourceItemId}-${targetItemId}`,
    sourceItemId,
    targetItemId,
    label: 'related',
    strength: 2,
    createdAt: '2026-05-16T00:00:00.000Z',
  };
}

describe('relationship suggestions', () => {
  it('ranks unlinked items by shared tags and keywords', () => {
    const selected = item({
      id: 'selected',
      title: 'Pricing risk',
      description: 'Review margin exposure',
      tags: ['pricing', 'risk'],
    });

    const suggestions = suggestRelationships(
      selected,
      [
        selected,
        item({ id: 'tag-match', title: 'Supplier risk', tags: ['risk'] }),
        item({ id: 'keyword-match', title: 'Pricing memo', category: 'Family' }),
        item({ id: 'linked', title: 'Existing pricing link', tags: ['pricing'] }),
        item({ id: 'archived', title: 'Old risk', status: 'archived', tags: ['risk'] }),
      ],
      [relationship('selected', 'linked')],
    );

    expect(suggestions.map((suggestion) => suggestion.item.id)).toEqual(['tag-match', 'keyword-match']);
    expect(suggestions[0].reason).toContain('tag');
  });
});
