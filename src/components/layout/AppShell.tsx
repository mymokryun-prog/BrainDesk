import { useEffect, useState } from 'react';
import { BrainCanvas } from '../canvas/BrainCanvas';
import { LeftSidebar } from './LeftSidebar';
import { RightDetailPanel } from './RightDetailPanel';
import { BottomToolbar } from './BottomToolbar';
import { useItemStore } from '../../store/itemStore';
import { CommandPalette } from '../command/CommandPalette';
import { isEditableShortcutTarget } from '../../utils/commandPalette';
import { ListView } from '../list/ListView';

export function AppShell() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const loadPersistedWorkspace = useItemStore((state) => state.loadPersistedWorkspace);
  const isReady = useItemStore((state) => state.isReady);
  const error = useItemStore((state) => state.error);
  const filters = useItemStore((state) => state.filters);
  const viewMode = useItemStore((state) => state.viewMode);
  const createItem = useItemStore((state) => state.createItem);
  const selectItem = useItemStore((state) => state.selectItem);

  useEffect(() => {
    void loadPersistedWorkspace();
  }, [loadPersistedWorkspace]);

  useEffect(() => {
    function openCommandPalette() {
      setIsCommandPaletteOpen(true);
    }

    function handleKeyDown(event: KeyboardEvent) {
      const isCommandShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isCommandShortcut) {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      if (isEditableShortcutTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        const item = createItem({
          title: 'Untitled note',
          category: filters.category === 'All' ? 'Personal' : filters.category,
          type: 'note',
        });
        selectItem(item.id);
      }

      if (event.key === '/') {
        event.preventDefault();
        window.dispatchEvent(new Event('neurotask:focus-search'));
      }
    }

    window.addEventListener('neurotask:open-command-palette', openCommandPalette);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('neurotask:open-command-palette', openCommandPalette);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [createItem, filters.category, selectItem]);

  return (
    <div className="flex h-screen min-h-[720px] bg-mist text-ink">
      <LeftSidebar />
      <main className="relative min-w-0 flex-1 border-x border-white/80">
        {!isReady && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-mist/80 text-sm font-medium text-graphite">
            Loading local canvas
          </div>
        )}
        {error && (
          <div className="absolute left-1/2 top-5 z-30 -translate-x-1/2 rounded-md border border-coral/30 bg-white px-4 py-2 text-sm text-coral shadow-panel">
            {error}
          </div>
        )}
        {viewMode === 'brain' ? <BrainCanvas /> : <ListView />}
        <BottomToolbar />
      </main>
      <RightDetailPanel />
      <CommandPalette open={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
}
