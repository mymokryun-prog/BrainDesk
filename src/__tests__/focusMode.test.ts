import { describe, expect, it } from 'vitest';
import { getFocusedItemIds } from '../utils/focusMode';
import type { Item, Relationship } from '../types/item';

const baseItem: Item = {
  id: 'item-a',
  title: 'A',
  description: '',
  type: 'note',
  category: 'Personal',
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

function item(id: string): Item {
  return { ...baseItem, id, title: id };
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

describe('focus mode', () => {
  it('returns selected item and directly connected neighbors', () => {
    const ids = getFocusedItemIds(
      'a',
      [item('a'), item('b'), item('c'), item('d')],
      [relationship('a', 'b'), relationship('c', 'a')],
    );

    expect(Array.from(ids).sort()).toEqual(['a', 'b', 'c']);
  });

  it('falls back to all visible items when nothing is selected', () => {
    const ids = getFocusedItemIds(undefined, [item('a'), item('b')], []);

    expect(Array.from(ids).sort()).toEqual(['a', 'b']);
  });
});
