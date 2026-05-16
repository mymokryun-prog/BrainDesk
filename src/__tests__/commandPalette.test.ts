import { describe, expect, it } from 'vitest';
import {
  createItemInputFromCommandQuery,
  filterCommands,
  isEditableShortcutTarget,
  type CommandAction,
} from '../utils/commandPalette';

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
    expect(createItemInputFromCommandQuery('task 계약서 확인', 'Company')).toMatchObject({
      title: '계약서 확인',
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
});
