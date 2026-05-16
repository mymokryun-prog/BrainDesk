import { Braces, CalendarDays, Command, Download, Focus, List, Network, Scan, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { useItemStore } from '../../store/itemStore';
import { exportBackupZip, importBackupFile } from '../../utils/importExport';
import { createBackupStatus, type ToolbarStatus } from '../../utils/toolbarStatus';

const LAST_BACKUP_STORAGE_KEY = 'neurotask:lastBackupAt';
const STALE_BACKUP_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

function readLastBackupAt(): string | undefined {
  try {
    return localStorage.getItem(LAST_BACKUP_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function formatBackupTime(isoDate: string): string {
  return isoDate.slice(0, 16).replace('T', ' ');
}

function getBackupAgeDays(isoDate: string): number {
  const backupTime = new Date(isoDate).getTime();
  if (Number.isNaN(backupTime)) return 0;

  return Math.floor((Date.now() - backupTime) / DAY_MS);
}

export function BottomToolbar() {
  const [toolbarStatus, setToolbarStatus] = useState<ToolbarStatus | undefined>();
  const [lastBackupAt, setLastBackupAt] = useState<string | undefined>(() => readLastBackupAt());
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
  const backupAgeDays = lastBackupAt ? getBackupAgeDays(lastBackupAt) : 0;
  const isBackupStale = backupAgeDays >= STALE_BACKUP_DAYS;

  useEffect(() => {
    if (!toolbarStatus) return;

    const timeoutId = window.setTimeout(() => setToolbarStatus(undefined), 4500);

    return () => window.clearTimeout(timeoutId);
  }, [toolbarStatus]);

  function recordBackupTime() {
    const backupAt = new Date().toISOString();
    setLastBackupAt(backupAt);
    try {
      localStorage.setItem(LAST_BACKUP_STORAGE_KEY, backupAt);
    } catch {
      // The timestamp is helpful metadata, but export/import should still succeed if storage is blocked.
    }
  }

  async function handleExport() {
    try {
      const backup = await exportBackupZip(items, relationships);
      const url = URL.createObjectURL(backup);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `neurotask-canvas-${new Date().toISOString().slice(0, 10)}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      recordBackupTime();
      setToolbarStatus(createBackupStatus('export-success'));
    } catch (error) {
      setToolbarStatus(createBackupStatus('export-error', error));
    }
  }

  async function handleImport(file: File) {
    const shouldImport = window.confirm('Importing a backup will replace the current workspace. Continue?');
    if (!shouldImport) return;

    try {
      const backup = await importBackupFile(file);
      replaceWorkspace(backup.items, backup.relationships);
      recordBackupTime();
      setToolbarStatus(createBackupStatus('import-success'));
    } catch (error) {
      setToolbarStatus(createBackupStatus('import-error', error));
    }
  }

  return (
    <div className="absolute bottom-5 left-1/2 z-20 flex max-w-[calc(100%-2rem)] -translate-x-1/2 flex-col items-center gap-2">
      {toolbarStatus && (
        <div
          className={`flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs font-medium shadow-panel ${
            toolbarStatus.kind === 'success' ? 'border-fern/30 text-fern' : 'border-coral/30 text-coral'
          }`}
          role="status"
        >
          <span>{toolbarStatus.message}</span>
          <button
            aria-label="Dismiss status"
            className="rounded p-0.5 text-current opacity-70 transition hover:bg-graphite/5 hover:opacity-100"
            type="button"
            onClick={() => setToolbarStatus(undefined)}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}
      {lastBackupAt && (
        <>
          <div className="rounded-md border border-graphite/10 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-graphite shadow-soft backdrop-blur">
            Last backup: {formatBackupTime(lastBackupAt)}
          </div>
          {isBackupStale && (
            <div className="rounded-md border border-gold/30 bg-gold/10 px-3 py-1.5 text-[11px] font-medium text-graphite shadow-soft backdrop-blur">
              Backup is {backupAgeDays} days old. Export a fresh copy soon.
            </div>
          )}
        </>
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
