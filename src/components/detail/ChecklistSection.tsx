import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import type { Item } from '../../types/item';

interface ChecklistSectionProps {
  selectedItem: Item;
  addChecklistItem: (itemId: string, label: string) => void;
  toggleChecklistItem: (itemId: string, checklistItemId: string) => void;
  updateChecklistItem: (itemId: string, checklistItemId: string, label: string) => void;
  deleteChecklistItem: (itemId: string, checklistItemId: string) => void;
}

export function ChecklistSection({
  selectedItem,
  addChecklistItem,
  toggleChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
}: ChecklistSectionProps) {
  const [newChecklistLabel, setNewChecklistLabel] = useState('');
  const completedChecklistCount = selectedItem.checklist.filter((entry) => entry.completed).length;
  const checklistProgress =
    selectedItem.checklist.length > 0 ? Math.round((completedChecklistCount / selectedItem.checklist.length) * 100) : 0;

  function addNewChecklistItem() {
    addChecklistItem(selectedItem.id, newChecklistLabel);
    setNewChecklistLabel('');
  }

  return (
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
              addNewChecklistItem();
            }
          }}
        />
        <Button icon={<Plus size={16} />} onClick={addNewChecklistItem} />
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
  );
}
