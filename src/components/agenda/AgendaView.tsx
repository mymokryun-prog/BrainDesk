import { useMemo } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, CircleDot } from 'lucide-react';
import { getFilteredItems, useItemStore } from '../../store/itemStore';
import type { Item } from '../../types/item';
import { groupAgendaItems } from '../../utils/agenda';

const priorityStyles: Record<Item['priority'], string> = {
  low: 'bg-skyglass/55 text-graphite',
  medium: 'bg-fern/10 text-fern',
  high: 'bg-brass/15 text-brass',
  urgent: 'bg-coral/15 text-coral',
};

export function AgendaView() {
  const items = useItemStore((state) => state.items);
  const filters = useItemStore((state) => state.filters);
  const selectedItemId = useItemStore((state) => state.selectedItemId);
  const selectItem = useItemStore((state) => state.selectItem);
  const filteredItems = useMemo(() => getFilteredItems({ items, filters }), [filters, items]);
  const agendaGroups = useMemo(() => groupAgendaItems(filteredItems), [filteredItems]);
  const scheduledCount = agendaGroups.reduce((count, group) => count + group.items.length, 0);

  return (
    <div className="h-full overflow-hidden bg-mist px-8 py-7">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-graphite/55">Agenda View</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">Due dates and next actions</h2>
        </div>
        <div className="rounded-md border border-white bg-white/80 px-3 py-2 text-sm font-medium text-graphite shadow-panel">
          {scheduledCount} visible items
        </div>
      </div>

      <div className="grid h-[calc(100%-76px)] grid-cols-5 gap-4 overflow-hidden">
        {agendaGroups.map((group) => (
          <section key={group.id} className="flex min-w-0 flex-col rounded-lg border border-white/80 bg-white shadow-panel">
            <div className="border-b border-graphite/10 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">{group.title}</h3>
                <span className="rounded-full bg-mist px-2 py-1 text-xs font-semibold text-graphite/65">
                  {group.items.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-graphite/55">{group.description}</p>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
              {group.items.length === 0 ? (
                <div className="grid h-32 place-items-center rounded-md border border-dashed border-graphite/15 text-center text-xs text-graphite/45">
                  Clear
                </div>
              ) : (
                group.items.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full rounded-md border px-3 py-3 text-left transition hover:bg-mist ${
                      selectedItemId === item.id ? 'border-teal bg-skyglass/35' : 'border-graphite/10 bg-white'
                    }`}
                    onClick={() => selectItem(item.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          {group.id === 'overdue' ? (
                            <AlertTriangle size={15} className="shrink-0 text-coral" />
                          ) : item.status === 'done' ? (
                            <CheckCircle2 size={15} className="shrink-0 text-fern" />
                          ) : (
                            <CircleDot size={15} className="shrink-0 text-graphite/45" />
                          )}
                          <span className="truncate text-sm font-semibold text-ink">{item.title}</span>
                        </span>
                        <span className="mt-2 flex items-center gap-1 text-xs text-graphite/55">
                          <CalendarDays size={13} />
                          {item.dueDate || 'No date'}
                        </span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${priorityStyles[item.priority]}`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-graphite/55">
                      <span>{item.category}</span>
                      <span>{item.status}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
