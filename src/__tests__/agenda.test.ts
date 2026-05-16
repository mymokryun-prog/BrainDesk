import { describe, expect, it } from 'vitest';
import { groupAgendaItems } from '../utils/agenda';
import type { Item } from '../types/item';

const baseItem: Item = {
  id: 'base',
  title: 'Base',
  description: '',
  type: 'task',
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

function item(id: string, dueDate: string, status: Item['status'] = 'active'): Item {
  return { ...baseItem, id, title: id, dueDate, status };
}

describe('agenda grouping', () => {
  it('groups visible work by overdue, today, this week, later, and no due date', () => {
    const groups = groupAgendaItems(
      [
        item('overdue', '2026-05-15'),
        item('today', '2026-05-16'),
        item('week', '2026-05-19'),
        item('later', '2026-05-30'),
        item('noDue', ''),
        item('archived', '2026-05-16', 'archived'),
      ],
      new Date('2026-05-16T00:00:00.000Z'),
    );

    expect(groups.map((group) => [group.id, group.items.map((entry) => entry.id)])).toEqual([
      ['overdue', ['overdue']],
      ['today', ['today']],
      ['week', ['week']],
      ['later', ['later']],
      ['no-due', ['noDue']],
    ]);
  });
});
