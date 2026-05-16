import { describe, expect, it } from 'vitest';
import { filterCommands, isEditableShortcutTarget, type CommandAction } from '../utils/commandPalette';

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
});
