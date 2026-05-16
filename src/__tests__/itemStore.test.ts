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

  it('adds and deletes attachments on an item', () => {
    const store = createItemStore({ seed: false, persist: false });
    const item = store.createItem({ title: 'Screenshot memo', category: 'Personal', type: 'screenshot' });
    const attachment = store.getState().addAttachment(item.id, new Blob(['image'], { type: 'image/png' }), 'memo.png');

    expect(store.getState().items[item.id].attachments).toHaveLength(1);

    store.getState().deleteAttachment(item.id, attachment.id);

    expect(store.getState().items[item.id].attachments).toHaveLength(0);
  });

  it('switches between brain and list view modes', () => {
    const store = createItemStore({ seed: false, persist: false });

    expect(store.getState().viewMode).toBe('brain');

    store.getState().setViewMode('list');

    expect(store.getState().viewMode).toBe('list');
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
