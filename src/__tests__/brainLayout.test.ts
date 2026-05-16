import { describe, expect, it } from 'vitest';
import { arrangeItemsInBrain } from '../utils/brainLayout';
import type { Item } from '../types/item';

describe('arrangeItemsInBrain', () => {
  it('places categories into stable brain regions', () => {
    const arranged = arrangeItemsInBrain([
      createItem('company', 'Company Strategy', 'Company'),
      createItem('family', 'Family Plan', 'Family'),
      createItem('personal', 'Personal Growth', 'Personal'),
      createItem('priority', 'Top Priority', 'Top Priority'),
    ]);

    expect(arranged.priority.y).toBeLessThan(arranged.personal.y);
    expect(arranged.company.x).toBeLessThan(arranged.family.x);
    expect(arranged.priority.x).toBeGreaterThan(arranged.company.x);
    expect(arranged.priority.x).toBeLessThan(arranged.family.x);
  });
});

function createItem(id: string, title: string, category: Item['category']): Item {
  return {
    id,
    title,
    category,
    description: '',
    type: 'note',
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
}
