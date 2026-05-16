import type { ItemFilters, ItemInput, ItemType } from '../types/item';
import { createQuickItemInput } from './quickAdd';

export interface CommandAction {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  shortcut?: string;
  run: () => void;
}

export function filterCommands(commands: CommandAction[], query: string): CommandAction[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return commands;

  return commands.filter((command) => {
    const haystack = [command.title, command.description, ...command.keywords].join(' ').toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable === true;
}

export function createItemInputFromCommandQuery(
  query: string,
  activeCategory: ItemFilters['category'],
): ItemInput | undefined {
  const match = query.trim().match(/^(note|task)\s+(.+)$/i);
  if (!match) return undefined;

  const [, type, title] = match;
  return createQuickItemInput(title, activeCategory, type.toLowerCase() as ItemType);
}
