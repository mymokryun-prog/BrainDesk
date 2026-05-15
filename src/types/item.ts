export const categories = ['Company', 'Family', 'Personal', 'Top Priority'] as const;
export const itemTypes = [
  'note',
  'task',
  'project',
  'idea',
  'meeting memo',
  'file',
  'image',
  'screenshot',
  'person',
  'decision',
  'risk',
  'follow-up',
] as const;
export const statuses = ['active', 'waiting', 'done', 'archived'] as const;
export const priorities = ['low', 'medium', 'high', 'urgent'] as const;

export type Category = (typeof categories)[number];
export type ItemType = (typeof itemTypes)[number];
export type ItemStatus = (typeof statuses)[number];
export type Priority = (typeof priorities)[number];

export interface Position {
  x: number;
  y: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  createdAt: string;
}

export interface Attachment {
  id: string;
  itemId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  blob: Blob;
  previewUrl?: string;
  createdAt: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  category: Category;
  status: ItemStatus;
  priority: Priority;
  dueDate?: string;
  tags: string[];
  position: Position;
  attachments: Attachment[];
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  sourceItemId: string;
  targetItemId: string;
  label: string;
  strength: number;
  createdAt: string;
}

export type ItemInput = Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'checklist'>> & {
  title: string;
};

export interface ItemFilters {
  query: string;
  category: Category | 'All';
  type: ItemType | 'All';
  status: ItemStatus | 'All';
  priority: Priority | 'All';
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  items: Item[];
  relationships: Relationship[];
}
