import type { Item, Relationship } from '../types/item';
import { nowIso } from './dates';

const createdAt = nowIso();

export function createInitialItems(): Item[] {
  return [
    {
      id: 'seed-top-priority',
      title: 'Top Priority',
      description: 'The executive focus area for the week.',
      type: 'project',
      category: 'Top Priority',
      status: 'active',
      priority: 'urgent',
      dueDate: '',
      tags: ['focus'],
      position: { x: 500, y: 170 },
      attachments: [],
      checklist: [],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'seed-company',
      title: 'Company Strategy',
      description: 'Notes, decisions, and follow-ups from work streams.',
      type: 'note',
      category: 'Company',
      status: 'active',
      priority: 'high',
      dueDate: '',
      tags: ['strategy'],
      position: { x: 310, y: 300 },
      attachments: [],
      checklist: [],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'seed-family',
      title: 'Family Commitments',
      description: 'Important family tasks and plans.',
      type: 'task',
      category: 'Family',
      status: 'waiting',
      priority: 'medium',
      dueDate: '',
      tags: ['home'],
      position: { x: 650, y: 320 },
      attachments: [],
      checklist: [],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'seed-personal',
      title: 'Personal Growth',
      description: 'Ideas, reading, and habits to revisit.',
      type: 'idea',
      category: 'Personal',
      status: 'active',
      priority: 'medium',
      dueDate: '',
      tags: ['self'],
      position: { x: 480, y: 460 },
      attachments: [],
      checklist: [],
      createdAt,
      updatedAt: createdAt,
    },
  ];
}

export function createInitialRelationships(): Relationship[] {
  return [
    {
      id: 'seed-rel-company-priority',
      sourceItemId: 'seed-top-priority',
      targetItemId: 'seed-company',
      label: 'focus',
      strength: 4,
      createdAt,
    },
    {
      id: 'seed-rel-priority-personal',
      sourceItemId: 'seed-top-priority',
      targetItemId: 'seed-personal',
      label: 'balance',
      strength: 2,
      createdAt,
    },
  ];
}
