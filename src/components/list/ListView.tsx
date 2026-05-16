import { useMemo } from 'react';
import { CheckCircle2, CircleDot, FileText, Paperclip } from 'lucide-react';
import { getFilteredItems, useItemStore } from '../../store/itemStore';
import type { Item } from '../../types/item';

const priorityStyles: Record<Item['priority'], string> = {
  low: 'bg-skyglass/55 text-graphite',
  medium: 'bg-fern/10 text-fern',
  high: 'bg-brass/15 text-brass',
  urgent: 'bg-coral/15 text-coral',
};

export function ListView() {
  const items = useItemStore((state) => state.items);
  const filters = useItemStore((state) => state.filters);
  const selectedItemId = useItemStore((state) => state.selectedItemId);
  const selectItem = useItemStore((state) => state.selectItem);
  const filteredItems = useMemo(() => getFilteredItems({ items, filters }), [filters, items]);

  return (
    <div className="h-full overflow-hidden bg-mist px-8 py-7">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-graphite/55">List View</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">All visible items</h2>
        </div>
        <div className="rounded-md border border-white bg-white/80 px-3 py-2 text-sm font-medium text-graphite shadow-panel">
          {filteredItems.length} items
        </div>
      </div>

      <div className="h-[calc(100%-76px)] overflow-hidden rounded-lg border border-white/80 bg-white shadow-panel">
        <div className="grid grid-cols-[minmax(260px,1.6fr)_130px_130px_120px_110px_120px] border-b border-graphite/10 bg-mist/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-graphite/55">
          <span>Item</span>
          <span>Category</span>
          <span>Type</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Due</span>
        </div>
        <div className="h-[calc(100%-43px)] overflow-auto">
          {filteredItems.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-graphite/60">
              No items match the current filters.
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                className={`grid w-full grid-cols-[minmax(260px,1.6fr)_130px_130px_120px_110px_120px] items-center border-b border-graphite/8 px-4 py-3 text-left transition hover:bg-mist ${
                  selectedItemId === item.id ? 'bg-skyglass/40' : 'bg-white'
                }`}
                onClick={() => selectItem(item.id)}
              >
                <span className="min-w-0">
                  <span className="flex min-w-0 items-center gap-2">
                    {item.status === 'done' ? (
                      <CheckCircle2 size={16} className="shrink-0 text-fern" />
                    ) : (
                      <CircleDot size={16} className="shrink-0 text-graphite/45" />
                    )}
                    <span className="truncate text-sm font-semibold text-ink">{item.title}</span>
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-graphite/55">
                    <FileText size={13} />
                    <span className="truncate">{item.description || 'No description'}</span>
                    {item.attachments.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Paperclip size={12} />
                        {item.attachments.length}
                      </span>
                    )}
                  </span>
                </span>
                <span className="text-sm text-graphite">{item.category}</span>
                <span className="text-sm text-graphite">{item.type}</span>
                <span className="text-sm text-graphite">{item.status}</span>
                <span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${priorityStyles[item.priority]}`}>
                    {item.priority}
                  </span>
                </span>
                <span className="text-sm text-graphite/70">{item.dueDate || '-'}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
