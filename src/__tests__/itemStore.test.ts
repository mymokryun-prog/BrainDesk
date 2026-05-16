import { describe, expect, it } from 'vitest';
import { createInitialItems, createItemStore } from '../store/itemStore';

describe('item store', () => {
  it('creates, updates, deletes, and persists node positions', () => {
    const store = createItemStore({ seed: false, persist: false });

    const item = store.createItem({
      title: 'Board review',
      category: 'Company',
      type: 'meeting memo',
      position: { x: 120, y: 160 },
    });

    store.updateItem(item.id, {
      title: 'Board review follow-up',
      priority: 'high',
    });
    store.updateItemPosition(item.id, { x: 240, y: 320 });

    expect(store.getState().items[item.id]).toMatchObject({
      title: 'Board review follow-up',
      priority: 'high',
      position: { x: 240, y: 320 },
    });

    store.deleteItem(item.id);

    expect(store.getState().items[item.id]).toBeUndefined();
  });

  it('creates relationships between existing items', () => {
    const store = createItemStore({ seed: false, persist: false });
    const source = store.createItem({ title: 'Risk', category: 'Top Priority', type: 'risk' });
    const target = store.createItem({ title: 'Decision', category: 'Company', type: 'decision' });

    const relationship = store.createRelationship(source.id, target.id, {
      label: 'drives',
      strength: 4,
    });

    expect(store.getState().relationships[relationship.id]).toMatchObject({
      sourceItemId: source.id,
      targetItemId: target.id,
      label: 'drives',
      strength: 4,
    });
  });

  it('does not duplicate an existing relationship between the same two items', () => {
    const store = createItemStore({ seed: false, persist: false });
    const source = store.createItem({ title: 'Risk', category: 'Top Priority', type: 'risk' });
    const target = store.createItem({ title: 'Decision', category: 'Company', type: 'decision' });

    const firstRelationship = store.createRelationship(source.id, target.id, { label: 'drives' });
    const secondRelationship = store.createRelationship(target.id, source.id, { label: 'duplicate' });

    expect(secondRelationship.id).toBe(firstRelationship.id);
    expect(Object.values(store.getState().relationships)).toHaveLength(1);
    expect(store.getState().relationships[firstRelationship.id].label).toBe('drives');
  });

  it('updates relationship labels and strength', () => {
    const store = createItemStore({ seed: false, persist: false });
    const source = store.createItem({ title: 'Risk', category: 'Top Priority', type: 'risk' });
    const target = store.createItem({ title: 'Decision', category: 'Company', type: 'decision' });
    const relationship = store.createRelationship(source.id, target.id, { label: 'related', strength: 2 });

    store.getState().updateRelationship(relationship.id, { label: 'blocks', strength: 5 });

    expect(store.getState().relationships[relationship.id]).toMatchObject({
      label: 'blocks',
      strength: 5,
    });
  });

  it('adds and deletes attachments on an item', () => {
    const store = createItemStore({ seed: false, persist: false });
    const item = store.createItem({ title: 'Screenshot memo', category: 'Personal', type: 'screenshot' });
    const attachment = store.getState().addAttachment(item.id, new Blob(['image'], { type: 'image/png' }), 'memo.png');

    expect(store.getState().items[item.id].attachments).toHaveLength(1);

    store.getState().deleteAttachment(item.id, attachment.id);

    expect(store.getState().items[item.id].attachments).toHaveLength(0);
  });

  it('normalizes invalid imported attachment blobs when replacing the workspace', () => {
    const store = createItemStore({ seed: false, persist: false });
    const item = store.createItem({ title: 'Imported legacy item', category: 'Personal', type: 'image' });

    store.getState().replaceWorkspace(
      [
        {
          ...item,
          attachments: [
            {
              id: 'legacy-att',
              itemId: item.id,
              fileName: 'legacy.png',
              fileType: 'image/png',
              fileSize: 100,
              blob: {} as Blob,
              previewUrl: 'blob:legacy',
              createdAt: '2026-05-15T00:00:00.000Z',
            },
          ],
        },
      ],
      [],
    );

    const attachment = store.getState().items[item.id].attachments[0];
    expect(attachment.blob).toBeInstanceOf(Blob);
    expect(attachment.previewUrl).toBeUndefined();
  });

  it('updates, completes, and deletes checklist items', () => {
    const store = createItemStore({ seed: false, persist: false });
    const item = store.createItem({ title: 'Checklist memo', category: 'Company', type: 'task' });

    store.getState().addChecklistItem(item.id, 'Draft agenda');
    const checklistItem = store.getState().items[item.id].checklist[0];

    store.getState().updateChecklistItem(item.id, checklistItem.id, 'Send agenda');
    store.getState().toggleChecklistItem(item.id, checklistItem.id);

    expect(store.getState().items[item.id].checklist[0]).toMatchObject({
      label: 'Send agenda',
      completed: true,
    });

    store.getState().deleteChecklistItem(item.id, checklistItem.id);

    expect(store.getState().items[item.id].checklist).toHaveLength(0);
  });

  it('switches between brain and list view modes', () => {
    const store = createItemStore({ seed: false, persist: false });

    expect(store.getState().viewMode).toBe('brain');

    store.getState().setViewMode('list');

    expect(store.getState().viewMode).toBe('list');

    store.getState().setViewMode('agenda');

    expect(store.getState().viewMode).toBe('agenda');
  });

  it('enables focus mode in brain view', () => {
    const store = createItemStore({ seed: false, persist: false });
    store.getState().setViewMode('list');

    store.getState().setFocusMode(true);

    expect(store.getState().isFocusMode).toBe(true);
    expect(store.getState().viewMode).toBe('brain');
  });

  it('starts with useful sample nodes when seeded', () => {
    const items = createInitialItems();

    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(items.map((item) => item.category)).toContain('Top Priority');
  });
});
