import { useMemo, useState } from 'react';
import { Link2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import type { Item, Relationship } from '../../types/item';
import { suggestRelationships } from '../../utils/relationshipSuggestions';

interface LinkedItemsSectionProps {
  items: Record<string, Item>;
  relationships: Relationship[];
  selectedItem: Item;
  createRelationship: (
    sourceItemId: string,
    targetItemId: string,
    input?: Partial<Pick<Relationship, 'label' | 'strength'>>,
  ) => Relationship;
  deleteRelationship: (id: string) => void;
}

export function LinkedItemsSection({
  items,
  relationships,
  selectedItem,
  createRelationship,
  deleteRelationship,
}: LinkedItemsSectionProps) {
  const [linkTargetId, setLinkTargetId] = useState('');
  const linkedRelationships = useMemo(
    () =>
      relationships.filter(
        (relationship) =>
          relationship.sourceItemId === selectedItem.id || relationship.targetItemId === selectedItem.id,
      ),
    [relationships, selectedItem.id],
  );
  const relationshipSuggestions = useMemo(
    () => suggestRelationships(selectedItem, Object.values(items), relationships),
    [items, relationships, selectedItem],
  );
  const linkedItemIds = useMemo(
    () =>
      new Set(
        linkedRelationships.map((relationship) =>
          relationship.sourceItemId === selectedItem.id ? relationship.targetItemId : relationship.sourceItemId,
        ),
      ),
    [linkedRelationships, selectedItem.id],
  );
  const linkOptions = useMemo(
    () => Object.values(items).filter((item) => item.id !== selectedItem.id && !linkedItemIds.has(item.id)),
    [items, linkedItemIds, selectedItem.id],
  );

  return (
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
          {linkOptions.map((item) => (
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
            <div key={relationship.id} className="flex items-center justify-between gap-2 rounded-md bg-mist px-3 py-2 text-sm">
              <span className="truncate">{items[otherId]?.title ?? 'Missing item'}</span>
              <button className="text-coral" onClick={() => deleteRelationship(relationship.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
        {linkedRelationships.length === 0 && (
          <p className="rounded-md bg-mist px-3 py-2 text-sm text-graphite/60">No linked items yet.</p>
        )}
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
  );
}
