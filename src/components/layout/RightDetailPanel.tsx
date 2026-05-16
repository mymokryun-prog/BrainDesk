import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { MarkdownPreview } from '../markdown/MarkdownPreview';
import { AttachmentsSection } from '../detail/AttachmentsSection';
import { ChecklistSection } from '../detail/ChecklistSection';
import { LinkedItemsSection } from '../detail/LinkedItemsSection';
import { categories, itemTypes, priorities, statuses, type Item } from '../../types/item';
import { useItemStore } from '../../store/itemStore';

export function RightDetailPanel() {
  const items = useItemStore((state) => state.items);
  const relationshipsById = useItemStore((state) => state.relationships);
  const selectedItemId = useItemStore((state) => state.selectedItemId);
  const updateItem = useItemStore((state) => state.updateItem);
  const deleteItem = useItemStore((state) => state.deleteItem);
  const addAttachment = useItemStore((state) => state.addAttachment);
  const deleteAttachment = useItemStore((state) => state.deleteAttachment);
  const addChecklistItem = useItemStore((state) => state.addChecklistItem);
  const toggleChecklistItem = useItemStore((state) => state.toggleChecklistItem);
  const updateChecklistItem = useItemStore((state) => state.updateChecklistItem);
  const deleteChecklistItem = useItemStore((state) => state.deleteChecklistItem);
  const createRelationship = useItemStore((state) => state.createRelationship);
  const updateRelationship = useItemStore((state) => state.updateRelationship);
  const deleteRelationship = useItemStore((state) => state.deleteRelationship);
  const selectedItem = selectedItemId ? items[selectedItemId] : undefined;
  const [descriptionMode, setDescriptionMode] = useState<'edit' | 'preview'>('edit');
  const relationships = useMemo(() => Object.values(relationshipsById), [relationshipsById]);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      if (!selectedItem) return;
      const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith('image/'));
      files.forEach((file, index) => {
        addAttachment(selectedItem.id, file, file.name || `Pasted screenshot ${index + 1}.png`);
      });
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addAttachment, selectedItem]);

  if (!selectedItem) {
    return (
      <aside className="flex h-full w-[356px] flex-col bg-white px-5 py-5 shadow-panel">
        <div className="grid flex-1 place-items-center text-center text-sm text-graphite/60">
          Select or create an item to edit its details.
        </div>
      </aside>
    );
  }

  function updateSelected(updates: Partial<Item>) {
    if (selectedItem) updateItem(selectedItem.id, updates);
  }

  return (
    <aside className="flex h-full w-[380px] flex-col overflow-hidden bg-white px-5 py-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite/55">Detail</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">Selected item</h2>
        </div>
        <Button
          title="Delete item"
          icon={<Trash2 size={16} />}
          variant="danger"
          onClick={() => deleteItem(selectedItem.id)}
        />
      </div>

      <div className="mt-5 min-h-0 flex-1 space-y-4 overflow-auto pr-1">
        <Field label="Title">
          <input
            className="field-input"
            value={selectedItem.title}
            onChange={(event) => updateSelected({ title: event.target.value })}
          />
        </Field>

        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="block text-xs font-medium text-graphite/65">Description</span>
            <div className="flex rounded-md border border-graphite/10 bg-mist p-0.5">
              {(['edit', 'preview'] as const).map((mode) => (
                <button
                  key={mode}
                  className={`rounded px-2 py-1 text-xs font-medium capitalize transition ${
                    descriptionMode === mode ? 'bg-white text-ink shadow-sm' : 'text-graphite/65 hover:text-ink'
                  }`}
                  type="button"
                  onClick={() => setDescriptionMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          {descriptionMode === 'edit' ? (
            <textarea
              className="field-input min-h-28 resize-none"
              value={selectedItem.description}
              onChange={(event) => updateSelected({ description: event.target.value })}
            />
          ) : (
            <div className="min-h-28 rounded-md border border-graphite/10 bg-white px-3 py-2">
              <MarkdownPreview value={selectedItem.description} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select
              className="field-input"
              value={selectedItem.type}
              onChange={(event) => updateSelected({ type: event.target.value as Item['type'] })}
            >
              {itemTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select
              className="field-input"
              value={selectedItem.category}
              onChange={(event) => updateSelected({ category: event.target.value as Item['category'] })}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className="field-input"
              value={selectedItem.status}
              onChange={(event) => updateSelected({ status: event.target.value as Item['status'] })}
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              className="field-input"
              value={selectedItem.priority}
              onChange={(event) => updateSelected({ priority: event.target.value as Item['priority'] })}
            >
              {priorities.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Due date">
          <input
            className="field-input"
            type="date"
            value={selectedItem.dueDate ?? ''}
            onChange={(event) => updateSelected({ dueDate: event.target.value })}
          />
        </Field>

        <Field label="Tags">
          <input
            className="field-input"
            value={selectedItem.tags.join(', ')}
            onChange={(event) =>
              updateSelected({
                tags: event.target.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>

        <LinkedItemsSection
          items={items}
          relationships={relationships}
          selectedItem={selectedItem}
          createRelationship={createRelationship}
          updateRelationship={updateRelationship}
          deleteRelationship={deleteRelationship}
        />

        <AttachmentsSection
          selectedItem={selectedItem}
          addAttachment={addAttachment}
          deleteAttachment={deleteAttachment}
        />

        <ChecklistSection
          selectedItem={selectedItem}
          addChecklistItem={addChecklistItem}
          toggleChecklistItem={toggleChecklistItem}
          updateChecklistItem={updateChecklistItem}
          deleteChecklistItem={deleteChecklistItem}
        />
      </div>

      <div className="mt-4 border-t border-graphite/10 pt-4 text-xs text-graphite/55">
        <div>Created {formatDate(selectedItem.createdAt)}</div>
        <div>Updated {formatDate(selectedItem.updatedAt)}</div>
      </div>
    </aside>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-graphite/65">{label}</span>
      {children}
    </label>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
