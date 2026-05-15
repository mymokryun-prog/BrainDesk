import Dexie, { type Table } from 'dexie';
import type { Item, Relationship } from '../types/item';

class NeuroTaskDatabase extends Dexie {
  items!: Table<Item, string>;
  relationships!: Table<Relationship, string>;

  constructor() {
    super('neurotask-canvas');

    this.version(1).stores({
      items: 'id, category, type, status, priority, updatedAt',
      relationships: 'id, sourceItemId, targetItemId, createdAt',
    });
  }
}

export const db = new NeuroTaskDatabase();
