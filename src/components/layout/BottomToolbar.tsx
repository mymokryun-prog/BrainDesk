import { Braces, Command, Download, Focus, List, Scan, Upload } from 'lucide-react';
import { Button } from '../common/Button';
import { useItemStore } from '../../store/itemStore';
import { exportBackup, importBackup } from '../../utils/importExport';

export function BottomToolbar() {
  const items = useItemStore((state) => Object.values(state.items));
  const relationships = useItemStore((state) => Object.values(state.relationships));
  const replaceWorkspace = useItemStore((state) => state.replaceWorkspace);

  function handleExport() {
    const json = exportBackup(items, relationships);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `neurotask-canvas-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    const text = await file.text();
    const backup = importBackup(text);
    replaceWorkspace(backup.items, backup.relationships);
  }

  return (
    <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-white/70 bg-white/88 p-2 shadow-panel backdrop-blur">
      <Button title="Fit view" icon={<Scan size={16} />} onClick={() => window.dispatchEvent(new Event('neurotask:fit'))} />
      <Button title="Focus mode" icon={<Focus size={16} />} />
      <Button title="List view" icon={<List size={16} />} />
      <Button title="Brain view" icon={<Braces size={16} />} />
      <Button title="Export data" icon={<Download size={16} />} onClick={handleExport} />
      <label>
        <input
          className="hidden"
          type="file"
          accept="application/json"
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
      <Button title="Command palette" icon={<Command size={16} />} />
    </div>
  );
}
