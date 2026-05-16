import type { Attachment, ChecklistItem, Item, ItemInput, Relationship } from '../types/item';
import { nowIso } from '../utils/dates';
import { createId } from '../utils/ids';

const maxAttachmentSize = 25 * 1024 * 1024;

export function createItemFromInput(input: ItemInput): Item {
  const timestamp = nowIso();

  return {
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
}

export function createRelationshipRecord(
  sourceItemId: string,
  targetItemId: string,
  input: Partial<Pick<Relationship, 'label' | 'strength'>> = {},
): Relationship {
  return {
    id: createId('rel'),
    sourceItemId,
    targetItemId,
    label: input.label ?? 'related',
    strength: input.strength ?? 2,
    createdAt: nowIso(),
  };
}

export function findRelationshipBetween(
  relationships: Record<string, Relationship>,
  sourceItemId: string,
  targetItemId: string,
): Relationship | undefined {
  return Object.values(relationships).find(
    (relationship) =>
      (relationship.sourceItemId === sourceItemId && relationship.targetItemId === targetItemId) ||
      (relationship.sourceItemId === targetItemId && relationship.targetItemId === sourceItemId),
  );
}

export function removeRelationshipsForItem(
  relationships: Record<string, Relationship>,
  itemId: string,
): Record<string, Relationship> {
  return Object.fromEntries(
    Object.entries(relationships).filter(
      ([, relationship]) => relationship.sourceItemId !== itemId && relationship.targetItemId !== itemId,
    ),
  );
}

export function createAttachmentRecord(itemId: string, file: File | Blob, fileName?: string): Attachment {
  if (file.size > maxAttachmentSize) throw new Error('Attachments must be 25 MB or smaller.');

  return {
    id: createId('att'),
    itemId,
    fileName: fileName ?? ('name' in file ? file.name : 'Pasted image'),
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    blob: file,
    previewUrl: createAttachmentPreviewUrl(file),
    createdAt: nowIso(),
  };
}

export function createChecklistEntry(label: string): ChecklistItem | undefined {
  const trimmed = label.trim();
  if (!trimmed) return undefined;

  return {
    id: createId('check'),
    label: trimmed,
    completed: false,
    createdAt: nowIso(),
  };
}

export function toggleChecklistEntry(checklist: ChecklistItem[], checklistItemId: string): ChecklistItem[] {
  return checklist.map((entry) =>
    entry.id === checklistItemId ? { ...entry, completed: !entry.completed } : entry,
  );
}

export function updateChecklistEntryLabel(
  checklist: ChecklistItem[],
  checklistItemId: string,
  label: string,
): ChecklistItem[] {
  return checklist.map((entry) => (entry.id === checklistItemId ? { ...entry, label } : entry));
}

export function deleteChecklistEntry(checklist: ChecklistItem[], checklistItemId: string): ChecklistItem[] {
  return checklist.filter((entry) => entry.id !== checklistItemId);
}

export function restoreAttachmentPreviews(item: Item): Item {
  return {
    ...item,
    attachments: item.attachments.map((attachment) => {
      const blob = normalizeAttachmentBlob(attachment.blob, attachment.fileType);
      return {
        ...attachment,
        blob,
        previewUrl: createAttachmentPreviewUrl(blob),
      };
    }),
  };
}

export function revokeAttachmentPreviewUrl(url: string): void {
  if (typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
}

function createAttachmentPreviewUrl(blob: Blob): string | undefined {
  if (!isBlobLike(blob) || !blob.type.startsWith('image/') || typeof URL.createObjectURL !== 'function') {
    return undefined;
  }

  return URL.createObjectURL(blob);
}

function normalizeAttachmentBlob(blob: Blob, fileType: string): Blob {
  return isBlobLike(blob) ? blob : new Blob([], { type: fileType });
}

function isBlobLike(value: unknown): value is Blob {
  return (
    value instanceof Blob ||
    (typeof value === 'object' &&
      value !== null &&
      typeof (value as Blob).size === 'number' &&
      typeof (value as Blob).type === 'string')
  );
}
