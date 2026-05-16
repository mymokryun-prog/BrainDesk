import { Braces, CalendarDays, Command, Download, Focus, List, Network, Scan, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../common/Button';
import { useItemStore } from '../../store/itemStore';
import { exportBackupZip, importBackupFile } from '../../utils/importExport';
import { createBackupStatus, type ToolbarStatus } from '../../utils/toolbarStatus';

export function BottomToolbar() {
  const [toolbarStatus, setToolbarStatus] = useState<ToolbarStatus | undefined>();
  const itemsById = useItemStore((state) => state.items);
  const relationshipsById = useItemStore((state) => state.relationships);
  const viewMode = useItemStore((state) => state.viewMode);
  const isFocusMode = useItemStore((state) => state.isFocusMode);
  const replaceWorkspace = useItemStore((state) => state.replaceWorkspace);
  const setViewMode = useItemStore((state) => state.setViewMode);
  const toggleFocusMode = useItemStore((state) => state.toggleFocusMode);
  const arrangeItems = useItemStore((state) => state.arrangeItems);
  const items = Object.values(itemsById);
  const relationships = Object.values(relationshipsById);

  async function handleExport() {
    try {
      const backup = await exportBackupZip(items, relationships);
      const url = URL.createObjectURL(backup);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `neurotask-canvas-${new Date().toISOString().slice(0, 10)}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      setToolbarStatus(createBackupStatus('export-success'));
    } catch (error) {
      setToolbarStatus(createBackupStatus('export-error', error));
    }
  }

  async function handleImport(file: File) {
    try {
      const backup = await importBackupFile(file);
      replaceWorkspace(backup.items, backup.relationships);
      setToolbarStatus(createBackupStatus('import-success'));
    } catch (error) {
      setToolbarStatus(createBackupStatus('import-error', error));
    }
  }

  return (
    <div className="absolute bottom-5 left-1/2 z-20 flex max-w-[calc(100%-2rem)] -translate-x-1/2 flex-col items-center gap-2">
      {toolbarStatus && (
        <div
          className={`rounded-md border bg-white px-3 py-2 text-xs font-medium shadow-panel ${
            toolbarStatus.kind === 'success' ? 'border-fern/30 text-fern' : 'border-coral/30 text-coral'
          }`}
          role="status"
        >
          {toolbarStatus.message}
        </div>
      )}
      <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-lg border border-white/70 bg-white/88 p-2 shadow-panel backdrop-blur">
        <Button
          title="Fit view"
          icon={<Scan size={16} />}
          onClick={() => window.dispatchEvent(new Event('neurotask:fit'))}
        />
        <Button
          title="Arrange brain"
          icon={<Network size={16} />}
          onClick={() => {
            arrangeItems();
            window.dispatchEvent(new Event('neurotask:fit'));
          }}
        />
        <Button
          title="Focus mode"
          icon={<Focus size={16} />}
          variant={isFocusMode ? 'primary' : 'secondary'}
          onClick={toggleFocusMode}
        />
        <Button
          title="List view"
          icon={<List size={16} />}
          variant={viewMode === 'list' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('list')}
        />
        <Button
          title="Agenda view"
          icon={<CalendarDays size={16} />}
          variant={viewMode === 'agenda' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('agenda')}
        />
        <Button
          title="Brain view"
          icon={<Braces size={16} />}
          variant={viewMode === 'brain' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('brain')}
        />
        <Button title="Export full ZIP backup" icon={<Download size={16} />} onClick={() => void handleExport()} />
        <label>
          <input
            className="hidden"
            type="file"
            accept="application/json,.json,application/zip,.zip"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImport(file);
              event.currentTarget.value = '';
            }}
          />
          <span className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-graphite/15 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-mist">
            <Upload size={16} />
          </span>
        </label>
        <Button
          title="Command palette"
          icon={<Command size={16} />}
          onClick={() => window.dispatchEvent(new Event('neurotask:open-command-palette'))}
        />
      </div>
    </div>
  );
}
