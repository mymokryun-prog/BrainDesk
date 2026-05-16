import { describe, expect, it } from 'vitest';
import {
  createItemInputFromCommandQuery,
  createItemSearchCommands,
  filterCommands,
  getNextCommandIndex,
  isEditableShortcutTarget,
  type CommandAction,
} from '../utils/commandPalette';
import type { Item } from '../types/item';

const commands: CommandAction[] = [
  {
    id: 'create-note',
    title: 'Create note',
    description: 'Add a new note.',
    keywords: ['new', 'item'],
    run: () => {},
  },
  {
    id: 'fit-view',
    title: 'Fit brain view',
    description: 'Center the canvas.',
    keywords: ['zoom', 'canvas'],
    run: () => {},
  },
];

describe('command palette utilities', () => {
  it('filters commands by title, description, and keyword', () => {
    expect(filterCommands(commands, 'note').map((command) => command.id)).toEqual(['create-note']);
    expect(filterCommands(commands, 'canvas').map((command) => command.id)).toEqual(['fit-view']);
    expect(filterCommands(commands, '').map((command) => command.id)).toEqual(['create-note', 'fit-view']);
  });

  it('detects editable shortcut targets', () => {
    expect(isEditableShortcutTarget(document.createElement('input'))).toBe(true);
    expect(isEditableShortcutTarget(document.createElement('textarea'))).toBe(true);
    expect(isEditableShortcutTarget(document.createElement('button'))).toBe(false);
  });

  it('creates item input from note and task command queries', () => {
    expect(createItemInputFromCommandQuery('task contract review', 'Company')).toMatchObject({
      title: 'contract review',
      type: 'task',
      category: 'Company',
    });
    expect(createItemInputFromCommandQuery('note meeting memo', 'All')).toMatchObject({
      title: 'meeting memo',
      type: 'note',
      category: 'Personal',
    });
    expect(createItemInputFromCommandQuery('task', 'Company')).toBeUndefined();
  });

  it('creates searchable item selection commands', () => {
    const selectedIds: string[] = [];
    const itemCommands = createItemSearchCommands(
      [
        createItem('item-1', 'Board Review', ['finance']),
        createItem('item-2', 'Family Plan', ['home']),
      ],
      (id) => selectedIds.push(id),
    );

    expect(filterCommands(itemCommands, 'finance').map((command) => command.id)).toEqual(['open-item-item-1']);

    itemCommands[0].run();

    expect(selectedIds).toEqual(['item-1']);
  });

  it('cycles command selection with arrow navigation', () => {
    expect(getNextCommandIndex(0, 3, 'down')).toBe(1);
    expect(getNextCommandIndex(2, 3, 'down')).toBe(0);
    expect(getNextCommandIndex(0, 3, 'up')).toBe(2);
    expect(getNextCommandIndex(0, 0, 'down')).toBe(0);
  });
});

function createItem(id: string, title: string, tags: string[]): Item {
  return {
    id,
    title,
    tags,
    description: 'Searchable item',
    type: 'note',
    category: 'Company',
    status: 'active',
    priority: 'medium',
    dueDate: '',
    position: { x: 0, y: 0 },
    attachments: [],
    checklist: [],
    createdAt: '2026-05-16T00:00:00.000Z',
    updatedAt: '2026-05-16T00:00:00.000Z',
  };
}
