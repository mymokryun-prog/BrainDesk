import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type {
  Attachment,
  Category,
  Item,
  ItemFilters,
  ItemInput,
  ItemType,
  Position,
  Priority,
  Relationship,
} from '../types/item';
import { loadWorkspace, persistWorkspace } from '../db/repositories';
import { nowIso } from '../utils/dates';
import { createId } from '../utils/ids';
import { createInitialItems, createInitialRelationships } from '../utils/seedData';

export { createInitialItems } from '../utils/seedData';

export type ViewMode = 'brain' | 'list';

interface ItemState {
  items: Record<string, Item>;
  relationships: Record<string, Relationship>;
  selectedItemId?: string;
  filters: ItemFilters;
  viewMode: ViewMode;
  isReady: boolean;
  error?: string;
  createItem: (input: ItemInput) => Item;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  updateItemPosition: (id: string, position: Position) => void;
  selectItem: (id?: string) => void;
  createRelationship: (
    sourceItemId: string,
    targetItemId: string,
    input?: Partial<Pick<Relationship, 'label' | 'strength'>>,
  ) => Relationship;
  deleteRelationship: (id: string) => void;
  setFilters: (filters: Partial<ItemFilters>) => void;
  setViewMode: (viewMode: ViewMode) => void;
  addAttachment: (itemId: string, file: File | Blob, fileName?: string) => Attachment;
  deleteAttachment: (itemId: string, attachmentId: string) => void;
  toggleChecklistItem: (itemId: string, checklistItemId: string) => void;
  addChecklistItem: (itemId: string, label: string) => void;
  replaceWorkspace: (items: Item[], relationships: Relationship[]) => void;
  loadPersistedWorkspace: () => Promise<void>;
}

interface StoreOptions {
  seed?: boolean;
  persist?: boolean;
}

const defaultFilters: ItemFilters = {
  query: '',
  category: 'All',
  type: 'All',
  status: 'All',
  priority: 'All',
};

type ItemStoreApi = StoreApi<ItemState> & {
  createItem: ItemState['createItem'];
  updateItem: ItemState['updateItem'];
  deleteItem: ItemState['deleteItem'];
  updateItemPosition: ItemState['updateItemPosition'];
  createRelationship: ItemState['createRelationship'];
  getFilteredItems: () => Item[];
};

export function createItemStore(options: StoreOptions = { seed: true }): ItemStoreApi {
  const persistEnabled = options.persist ?? true;
  const initialItems = options.seed === false ? [] : createInitialItems();
  const initialRelationships = options.seed === false ? [] : createInitialRelationships();

  const store = createStore<ItemState>((set, get) => ({
    items: toRecord(initialItems),
    relationships: toRecord(initialRelationships),
    selectedItemId: initialItems[0]?.id,
    filters: defaultFilters,
    viewMode: 'brain',
    isReady: options.seed !== false,
    createItem: (input) => {
      const timestamp = nowIso();
      const item: Item = {
        id: createId('item'),
        title: input.title,
        description: input.description ?? '',
        type: input.type ?? 'note',
        category: input.category ?? 'Personal',
        status: input.status ?? 'active',
        priority: input.priority ?? 'medium',
        dueDate: input.dueDate ?? '',
        tags: input.tags ?? [],
        position: input.position ?? { x: 420 + Math.random() * 180, y: 240 + Math.random() * 160 },
        attachments: [],
        checklist: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      set((state) => ({
        items: { ...state.items, [item.id]: item },
        selectedItemId: item.id,
      }));
      persistCurrent(get, persistEnabled);
      return item;
    },
    updateItem: (id, updates) => {
      set((state) => {
        const item = state.items[id];
        if (!item) return state;

        return {
          items: {
            ...state.items,
            [id]: {
              ...item,
              ...updates,
              id,
              updatedAt: nowIso(),
            },
          },
        };
      });
      persistCurrent(get, persistEnabled);
    },
    deleteItem: (id) => {
      set((state) => {
        const { [id]: _deleted, ...items } = state.items;
        const relationships = Object.fromEntries(
          Object.entries(state.relationships).filter(
            ([, relationship]) => relationship.sourceItemId !== id && relationship.targetItemId !== id,
          ),
        );

        return {
          items,
          relationships,
          selectedItemId: state.selectedItemId === id ? Object.keys(items)[0] : state.selectedItemId,
        };
      });
      persistCurrent(get, persistEnabled);
    },
    updateItemPosition: (id, position) => {
      get().updateItem(id, { position });
    },
    selectItem: (id) => set({ selectedItemId: id }),
    createRelationship: (sourceItemId, targetItemId, input = {}) => {
      const timestamp = nowIso();
      const relationship: Relationship = {
        id: createId('rel'),
        sourceItemId,
        targetItemId,
        label: input.label ?? 'related',
        strength: input.strength ?? 2,
        createdAt: timestamp,
      };

      if (!get().items[sourceItemId] || !get().items[targetItemId] || sourceItemId === targetItemId) {
        throw new Error('Relationships require two different existing items.');
      }

      set((state) => ({
        relationships: { ...state.relationships, [relationship.id]: relationship },
      }));
      persistCurrent(get, persistEnabled);
      return relationship;
    },
    deleteRelationship: (id) => {
      set((state) => {
        const { [id]: _deleted, ...relationships } = state.relationships;
        return { relationships };
      });
      persistCurrent(get, persistEnabled);
    },
    setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
    setViewMode: (viewMode) => set({ viewMode }),
    addAttachment: (itemId, file, fileName) => {
      const item = get().items[itemId];
      if (!item) throw new Error('Select an item before attaching a file.');
      if (file.size > 25 * 1024 * 1024) throw new Error('Attachments must be 25 MB or smaller.');

      const timestamp = nowIso();
      const attachment: Attachment = {
        id: createId('att'),
        itemId,
        fileName: fileName ?? ('name' in file ? file.name : 'Pasted image'),
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        blob: file,
        previewUrl: createAttachmentPreviewUrl(file),
        createdAt: timestamp,
      };

      get().updateItem(itemId, {
        attachments: [...item.attachments, attachment],
      });
      return attachment;
    },
    deleteAttachment: (itemId, attachmentId) => {
      const item = get().items[itemId];
      if (!item) return;

      const attachment = item.attachments.find((entry) => entry.id === attachmentId);
      if (attachment?.previewUrl) revokeAttachmentPreviewUrl(attachment.previewUrl);

      get().updateItem(itemId, {
        attachments: item.attachments.filter((entry) => entry.id !== attachmentId),
      });
    },
    toggleChecklistItem: (itemId, checklistItemId) => {
      const item = get().items[itemId];
      if (!item) return;

      get().updateItem(itemId, {
        checklist: item.checklist.map((entry) =>
          entry.id === checklistItemId ? { ...entry, completed: !entry.completed } : entry,
        ),
      });
    },
    addChecklistItem: (itemId, label) => {
      const item = get().items[itemId];
      const trimmed = label.trim();
      if (!item || !trimmed) return;

      get().updateItem(itemId, {
        checklist: [
          ...item.checklist,
          {
            id: createId('check'),
            label: trimmed,
            completed: false,
            createdAt: nowIso(),
          },
        ],
      });
    },
    replaceWorkspace: (items, relationships) => {
      set({
        items: toRecord(items),
        relationships: toRecord(relationships),
        selectedItemId: items[0]?.id,
      });
      persistCurrent(get, persistEnabled);
    },
    loadPersistedWorkspace: async () => {
      try {
        const workspace = await loadWorkspace();
        const hasData = workspace.items.length > 0;
        const items = hasData ? workspace.items : createInitialItems();
        const relationships = hasData ? workspace.relationships : createInitialRelationships();

        set({
          items: toRecord(items.map(restoreAttachmentPreviews)),
          relationships: toRecord(relationships),
          selectedItemId: items[0]?.id,
          isReady: true,
          error: undefined,
        });

        if (!hasData) {
          await persistWorkspace(items, relationships);
        }
      } catch (error) {
        set({
          isReady: true,
          error: error instanceof Error ? error.message : 'Could not load local data.',
        });
      }
    },
  }));

  return Object.assign(store, {
    createItem: (...args: Parameters<ItemState['createItem']>) => store.getState().createItem(...args),
    updateItem: (...args: Parameters<ItemState['updateItem']>) => store.getState().updateItem(...args),
    deleteItem: (...args: Parameters<ItemState['deleteItem']>) => store.getState().deleteItem(...args),
    updateItemPosition: (...args: Parameters<ItemState['updateItemPosition']>) =>
      store.getState().updateItemPosition(...args),
    createRelationship: (...args: Parameters<ItemState['createRelationship']>) =>
      store.getState().createRelationship(...args),
    getFilteredItems: () => getFilteredItems(store.getState()),
  });
}

export const itemStore = createItemStore();

export function useItemStore<T>(selector: (state: ItemState) => T): T {
  return useStore(itemStore, selector);
}

export function getFilteredItems(state: Pick<ItemState, 'items' | 'filters'>): Item[] {
  const query = state.filters.query.trim().toLowerCase();

  return Object.values(state.items).filter((item) => {
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some((tag) => tag.toLowerCase().includes(query));

    return (
      matchesQuery &&
      matchesFilter(item.category, state.filters.category) &&
      matchesFilter(item.type, state.filters.type) &&
      matchesFilter(item.status, state.filters.status) &&
      matchesFilter(item.priority, state.filters.priority)
    );
  });
}

function matchesFilter<T extends string>(value: T, filter: T | 'All'): boolean {
  return filter === 'All' || value === filter;
}

function toRecord<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function persistCurrent(get: () => ItemState, persistEnabled: boolean): void {
  if (!persistEnabled) return;

  const state = get();
  void persistWorkspace(Object.values(state.items), Object.values(state.relationships)).catch((error) => {
    console.error('Could not persist workspace', error);
  });
}

function restoreAttachmentPreviews(item: Item): Item {
  return {
    ...item,
    attachments: item.attachments.map((attachment) => ({
      ...attachment,
      previewUrl: createAttachmentPreviewUrl(attachment.blob),
    })),
  };
}

function createAttachmentPreviewUrl(blob: Blob): string | undefined {
  if (!blob.type.startsWith('image/') || typeof URL.createObjectURL !== 'function') {
    return undefined;
  }

  return URL.createObjectURL(blob);
}

function revokeAttachmentPreviewUrl(url: string): void {
  if (typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
}
