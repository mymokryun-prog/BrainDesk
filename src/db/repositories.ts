import type { Item, Relationship } from '../types/item';
import { db } from './db';

export async function loadWorkspace(): Promise<{ items: Item[]; relationships: Relationship[] }> {
  const [items, relationships] = await Promise.all([db.items.toArray(), db.relationships.toArray()]);

  return { items, relationships };
}

export async function persistWorkspace(items: Item[], relationships: Relationship[]): Promise<void> {
  await db.transaction('rw', db.items, db.relationships, async () => {
    await db.items.clear();
    await db.relationships.clear();
    await db.items.bulkPut(items);
    await db.relationships.bulkPut(relationships);
  });
}
