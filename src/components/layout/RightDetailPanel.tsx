import { useEffect, useMemo, useState } from 'react';
import { Download, Link2, Paperclip, Plus, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { MarkdownPreview } from '../markdown/MarkdownPreview';
import { categories, itemTypes, priorities, statuses, type Item } from '../../types/item';
import { useItemStore } from '../../store/itemStore';
import { suggestRelationships } from '../../utils/relationshipSuggestions';

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
  const deleteRelationship = useItemStore((state) => state.deleteRelationship);
  const selectedItem = selectedItemId ? items[selectedItemId] : undefined;
  const [newChecklistLabel, setNewChecklistLabel] = useState('');
  const [linkTargetId, setLinkTargetId] = useState('');
  const [descriptionMode, setDescriptionMode] = useState<'edit' | 'preview'>('edit');
  const relationships = useMemo(() => Object.values(relationshipsById), [relationshipsById]);
  const completedChecklistCount = selectedItem?.checklist.filter((entry) => entry.completed).length ?? 0;
  const checklistProgress =
    selectedItem && selectedItem.checklist.length > 0
      ? Math.round((completedChecklistCount / selectedItem.checklist.length) * 100)
      : 0;

  const linkedRelationships = useMemo(
    () =>
      selectedItem
        ? relationships.filter(
            (relationship) =>
              relationship.sourceItemId === selectedItem.id || relationship.targetItemId === selectedItem.id,
          )
        : [],
    [relationships, selectedItem],
  );
  const relationshipSuggestions = useMemo(
    () => (selectedItem ? suggestRelationships(selectedItem, Object.values(items), relationships) : []),
    [items, relationships, selectedItem],
  );

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

  function downloadAttachment(attachment: Item['attachments'][number]) {
    const url = URL.createObjectURL(attachment.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = attachment.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
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

        <section className="rounded-lg border border-graphite/10 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Linked items</h3>
            <Link2 size={16} className="text-graphite/55" />
          </div>
          <div className="flex gap-2">
            <select
              className="field-input min-w-0 flex-1"
              value={linkTargetId}
              onChange={(event) => setLinkTargetId(event.target.value)}
            >
              <option value="">Choose item</option>
              {Object.values(items)
                .filter((item) => item.id !== selectedItem.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
            </select>
            <Button
              icon={<Plus size={16} />}
              disabled={!linkTargetId}
              onClick={() => {
                if (!linkTargetId) return;
                createRelationship(selectedItem.id, linkTargetId, { label: 'related', strength: 2 });
                setLinkTargetId('');
              }}
            />
          </div>
          <div className="mt-3 space-y-2">
            {linkedRelationships.map((relationship) => {
              const otherId =
                relationship.sourceItemId === selectedItem.id ? relationship.targetItemId : relationship.sourceItemId;
              return (
                <div
                  key={relationship.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-mist px-3 py-2 text-sm"
                >
                  <span className="truncate">{items[otherId]?.title ?? 'Missing item'}</span>
                  <button className="text-coral" onClick={() => deleteRelationship(relationship.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
          {relationshipSuggestions.length > 0 && (
            <div className="mt-4 border-t border-graphite/10 pt-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-graphite/55">
                Suggested links
              </div>
              <div className="space-y-2">
                {relationshipSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.item.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-teal/15 bg-skyglass/35 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{suggestion.item.title}</span>
                      <span className="block truncate text-xs text-graphite/60">{suggestion.reason}</span>
                    </span>
                    <button
                      className="rounded-md p-1 text-teal hover:bg-white"
                      title="Create suggested relationship"
                      onClick={() =>
                        createRelationship(selectedItem.id, suggestion.item.id, {
                          label: 'suggested',
                          strength: Math.min(5, Math.max(1, suggestion.score)),
                        })
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-graphite/10 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Attachments</h3>
            <Paperclip size={16} className="text-graphite/55" />
          </div>
          <label className="block">
            <input
              className="hidden"
              type="file"
              multiple
              onChange={(event) => {
                Array.from(event.target.files ?? []).forEach((file) => addAttachment(selectedItem.id, file));
                event.currentTarget.value = '';
              }}
            />
            <span className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-graphite/15 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-mist">
              <Paperclip size={16} />
              Attach file
            </span>
          </label>
          <div className="mt-3 space-y-2">
            {selectedItem.attachments.map((attachment) => (
              <div key={attachment.id} className="rounded-md bg-mist p-2 text-sm">
                {attachment.previewUrl && (
                  <img
                    className="mb-2 max-h-32 w-full rounded-md object-cover"
                    src={attachment.previewUrl}
                    alt={attachment.fileName}
                  />
                )}
                <div className="truncate font-medium">{attachment.fileName}</div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="text-xs text-graphite/60">{Math.ceil(attachment.fileSize / 1024)} KB</div>
                  <div className="flex gap-1">
                    <button
                      className="rounded-md p-1 text-graphite/65 hover:bg-white"
                      title="Download attachment"
                      onClick={() => downloadAttachment(attachment)}
                    >
                      <Download size={14} />
                    </button>
                    <button
                      className="rounded-md p-1 text-coral hover:bg-white"
                      title="Delete attachment"
                      onClick={() => deleteAttachment(selectedItem.id, attachment.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-graphite/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Checklist</h3>
            <span className="text-xs text-graphite/60">
              {completedChecklistCount}/{selectedItem.checklist.length} done
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist">
            <div className="h-full bg-teal transition-all" style={{ width: `${checklistProgress}%` }} />
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="field-input min-w-0 flex-1"
              value={newChecklistLabel}
              placeholder="Add checklist item"
              onChange={(event) => setNewChecklistLabel(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  addChecklistItem(selectedItem.id, newChecklistLabel);
                  setNewChecklistLabel('');
                }
              }}
            />
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                addChecklistItem(selectedItem.id, newChecklistLabel);
                setNewChecklistLabel('');
              }}
            />
          </div>
          <div className="mt-3 space-y-2">
            {selectedItem.checklist.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2 rounded-md bg-mist px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={entry.completed}
                  onChange={() => toggleChecklistItem(selectedItem.id, entry.id)}
                />
                <input
                  className={`min-w-0 flex-1 bg-transparent outline-none ${
                    entry.completed ? 'text-graphite/50 line-through' : ''
                  }`}
                  value={entry.label}
                  onChange={(event) => updateChecklistItem(selectedItem.id, entry.id, event.target.value)}
                  onBlur={(event) => {
                    const trimmed = event.currentTarget.value.trim();
                    if (trimmed) {
                      updateChecklistItem(selectedItem.id, entry.id, trimmed);
                    } else {
                      deleteChecklistItem(selectedItem.id, entry.id);
                    }
                  }}
                />
                <button
                  className="rounded-md p-1 text-coral hover:bg-white"
                  title="Delete checklist item"
                  onClick={() => deleteChecklistItem(selectedItem.id, entry.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
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
  children: React.ReactNode;
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
