import { useEffect, useMemo, useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '../common/Button';
import { categories, itemTypes, priorities, statuses, type Category } from '../../types/item';
import { getFilteredItems, useItemStore } from '../../store/itemStore';

export function LeftSidebar() {
  const searchRef = useRef<HTMLInputElement>(null);
  const filters = useItemStore((state) => state.filters);
  const items = useItemStore((state) => state.items);
  const setFilters = useItemStore((state) => state.setFilters);
  const createItem = useItemStore((state) => state.createItem);
  const selectItem = useItemStore((state) => state.selectItem);
  const filteredItems = useMemo(() => getFilteredItems({ items, filters }), [filters, items]);
  const tags = useMemo(() => Array.from(new Set(Object.values(items).flatMap((item) => item.tags))).sort(), [items]);

  function handleCreate(category?: Category) {
    const item = createItem({
      title: 'Untitled item',
      category: category ?? (filters.category === 'All' ? 'Personal' : filters.category),
      type: 'note',
    });
    selectItem(item.id);
  }

  useEffect(() => {
    function focusSearch() {
      searchRef.current?.focus();
      searchRef.current?.select();
    }

    window.addEventListener('neurotask:focus-search', focusSearch);
    return () => window.removeEventListener('neurotask:focus-search', focusSearch);
  }, []);

  return (
    <aside className="flex h-full w-[292px] flex-col bg-white/90 px-4 py-5 shadow-panel">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-graphite/55">NeuroTask</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Canvas</h1>
      </div>

      <Button className="mt-5 w-full" icon={<Plus size={16} />} variant="primary" onClick={() => handleCreate()}>
        Add item
      </Button>

      <label className="mt-5 flex items-center gap-2 rounded-md border border-graphite/10 bg-mist px-3 py-2">
        <Search size={16} className="text-graphite/60" />
        <input
          ref={searchRef}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-graphite/45"
          value={filters.query}
          placeholder="Search notes, tags, tasks"
          onChange={(event) => setFilters({ query: event.target.value })}
        />
      </label>

      <section className="mt-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-graphite/55">Quick access</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
                filters.category === category
                  ? 'border-fern bg-fern text-white'
                  : 'border-graphite/10 bg-white text-graphite hover:bg-mist'
              }`}
              onClick={() => setFilters({ category })}
              onDoubleClick={() => handleCreate(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 space-y-3">
        <FilterSelect label="Category" value={filters.category} onChange={(value) => setFilters({ category: value })}>
          <option>All</option>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </FilterSelect>
        <FilterSelect label="Type" value={filters.type} onChange={(value) => setFilters({ type: value })}>
          <option>All</option>
          {itemTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </FilterSelect>
        <FilterSelect label="Status" value={filters.status} onChange={(value) => setFilters({ status: value })}>
          <option>All</option>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </FilterSelect>
        <FilterSelect label="Priority" value={filters.priority} onChange={(value) => setFilters({ priority: value })}>
          <option>All</option>
          {priorities.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </FilterSelect>
      </section>

      <section className="mt-5 min-h-0 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-graphite/55">Items</h2>
          <span className="text-xs text-graphite/55">{filteredItems.length}</span>
        </div>
        <div className="mt-2 max-h-[30vh] space-y-2 overflow-auto pr-1">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              className="w-full rounded-md border border-graphite/10 bg-white px-3 py-2 text-left hover:bg-mist"
              onClick={() => selectItem(item.id)}
            >
              <div className="truncate text-sm font-semibold">{item.title}</div>
              <div className="mt-1 text-xs text-graphite/60">{item.category}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-graphite/55">Tags</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.slice(0, 12).map((tag) => (
            <button
              key={tag}
              className="rounded-full bg-ink/5 px-2 py-1 text-xs text-graphite hover:bg-ink/10"
              onClick={() => setFilters({ query: tag })}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  children: React.ReactNode;
  onChange: (value: never) => void;
}

function FilterSelect({ label, value, children, onChange }: FilterSelectProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-graphite/65">{label}</span>
      <select
        className="w-full rounded-md border border-graphite/10 bg-white px-3 py-2 text-sm outline-none focus:border-fern"
        value={value}
        onChange={(event) => onChange(event.target.value as never)}
      >
        {children}
      </select>
    </label>
  );
}
