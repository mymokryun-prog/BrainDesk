import { useEffect } from 'react';
import { BrainCanvas } from '../canvas/BrainCanvas';
import { LeftSidebar } from './LeftSidebar';
import { RightDetailPanel } from './RightDetailPanel';
import { BottomToolbar } from './BottomToolbar';
import { useItemStore } from '../../store/itemStore';

export function AppShell() {
  const loadPersistedWorkspace = useItemStore((state) => state.loadPersistedWorkspace);
  const isReady = useItemStore((state) => state.isReady);
  const error = useItemStore((state) => state.error);

  useEffect(() => {
    void loadPersistedWorkspace();
  }, [loadPersistedWorkspace]);

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
        <BrainCanvas />
        <BottomToolbar />
      </main>
      <RightDetailPanel />
    </div>
  );
}
