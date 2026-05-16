import { useEffect, useMemo, useRef, useState } from 'react';
import { Command, Search } from 'lucide-react';
import { Button } from '../common/Button';
import { filterCommands, type CommandAction } from '../../utils/commandPalette';
import { useItemStore } from '../../store/itemStore';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const filters = useItemStore((state) => state.filters);
  const selectedItemId = useItemStore((state) => state.selectedItemId);
  const isFocusMode = useItemStore((state) => state.isFocusMode);
  const createItem = useItemStore((state) => state.createItem);
  const deleteItem = useItemStore((state) => state.deleteItem);
  const selectItem = useItemStore((state) => state.selectItem);
  const setFilters = useItemStore((state) => state.setFilters);
  const setFocusMode = useItemStore((state) => state.setFocusMode);
  const setViewMode = useItemStore((state) => state.setViewMode);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  const commands = useMemo<CommandAction[]>(
    () => [
      {
        id: 'create-note',
        title: 'Create note',
        description: 'Add a new note to the current canvas.',
        keywords: ['new', 'item', 'note'],
        shortcut: 'N',
        run: () => {
          const item = createItem({
            title: 'Untitled note',
            category: filters.category === 'All' ? 'Personal' : filters.category,
            type: 'note',
          });
          selectItem(item.id);
        },
      },
      {
        id: 'create-task',
        title: 'Create task',
        description: 'Add a new task with medium priority.',
        keywords: ['new', 'todo', 'task'],
        run: () => {
          const item = createItem({
            title: 'Untitled task',
            category: filters.category === 'All' ? 'Top Priority' : filters.category,
            type: 'task',
            priority: 'medium',
          });
          selectItem(item.id);
        },
      },
      {
        id: 'focus-search',
        title: 'Focus search',
        description: 'Jump to the sidebar search field.',
        keywords: ['find', 'filter', 'sidebar'],
        shortcut: '/',
        run: () => window.dispatchEvent(new Event('neurotask:focus-search')),
      },
      {
        id: 'fit-view',
        title: 'Fit brain view',
        description: 'Center the visible graph on screen.',
        keywords: ['zoom', 'canvas', 'fit'],
        run: () => window.dispatchEvent(new Event('neurotask:fit')),
      },
      {
        id: 'toggle-focus-mode',
        title: isFocusMode ? 'Exit focus mode' : 'Enter focus mode',
        description: selectedItemId
          ? 'Show only the selected item and directly linked nodes.'
          : 'Select an item before using focus mode.',
        keywords: ['focus', 'selected', 'connections'],
        run: () => {
          if (selectedItemId) setFocusMode(!isFocusMode);
        },
      },
      {
        id: 'show-list-view',
        title: 'Show list view',
        description: 'Review visible items in a table.',
        keywords: ['table', 'items', 'rows'],
        run: () => setViewMode('list'),
      },
      {
        id: 'show-brain-view',
        title: 'Show brain view',
        description: 'Return to the brain-shaped canvas.',
        keywords: ['canvas', 'graph', 'brain'],
        run: () => setViewMode('brain'),
      },
      {
        id: 'top-priority',
        title: 'Show Top Priority',
        description: 'Filter the canvas to the top priority category.',
        keywords: ['priority', 'urgent', 'focus'],
        run: () => setFilters({ category: 'Top Priority' }),
      },
      {
        id: 'clear-filters',
        title: 'Clear filters',
        description: 'Show all items and clear the search query.',
        keywords: ['reset', 'all', 'search'],
        run: () =>
          setFilters({
            query: '',
            category: 'All',
            type: 'All',
            status: 'All',
            priority: 'All',
          }),
      },
      {
        id: 'delete-selected',
        title: 'Delete selected item',
        description: selectedItemId ? 'Remove the currently selected item.' : 'Select an item before deleting.',
        keywords: ['remove', 'trash', 'delete'],
        run: () => {
          if (selectedItemId) deleteItem(selectedItemId);
        },
      },
    ],
    [createItem, deleteItem, filters.category, isFocusMode, selectItem, selectedItemId, setFilters, setFocusMode, setViewMode],
  );

  const filteredCommands = filterCommands(commands, query);

  function runCommand(command: CommandAction) {
    command.run();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/28 px-4 pt-[12vh] backdrop-blur-sm">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-lg border border-white/70 bg-white shadow-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-3 border-b border-graphite/10 px-4 py-3">
          <Command size={18} className="text-graphite/55" />
          <input
            ref={inputRef}
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-graphite/45"
            value={query}
            placeholder="Run a command or search actions"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && filteredCommands[0]) {
                event.preventDefault();
                runCommand(filteredCommands[0]);
              }
            }}
          />
          <Search size={16} className="text-graphite/45" />
        </div>
        <div className="max-h-[48vh] overflow-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-graphite/60">No matching commands.</div>
          ) : (
            filteredCommands.map((command) => (
              <button
                key={command.id}
                className="flex w-full items-center justify-between gap-4 rounded-md px-3 py-3 text-left hover:bg-mist"
                onClick={() => runCommand(command)}
              >
                <span>
                  <span className="block text-sm font-semibold text-ink">{command.title}</span>
                  <span className="mt-0.5 block text-xs text-graphite/60">{command.description}</span>
                </span>
                {command.shortcut && (
                  <span className="rounded-md border border-graphite/10 bg-white px-2 py-1 text-xs font-semibold text-graphite/65">
                    {command.shortcut}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-graphite/10 px-4 py-3 text-xs text-graphite/55">
          <span>Enter to run</span>
          <Button variant="ghost" onClick={onClose}>
            Esc
          </Button>
        </div>
      </div>
    </div>
  );
}
