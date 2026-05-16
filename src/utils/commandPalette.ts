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
