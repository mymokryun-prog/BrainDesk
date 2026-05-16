import type { BackupPayload, Item, Relationship } from '../types/item';
import { nowIso } from './dates';
import { createZip, readZip, type ZipEntryInput } from './zip';

export function exportBackup(items: Item[], relationships: Relationship[]): string {
  return JSON.stringify(createBackupPayload(items, relationships), null, 2);
}

export async function exportBackupZip(items: Item[], relationships: Relationship[]): Promise<Blob> {
  const payload = createBackupPayload(items, relationships);
  const entries: ZipEntryInput[] = [
    {
      name: 'backup.json',
      data: new TextEncoder().encode(JSON.stringify(payload, null, 2)),
    },
  ];

  for (const item of items) {
    for (const attachment of item.attachments) {
      entries.push({
        name: getAttachmentEntryName(attachment.id),
        data: await blobToUint8Array(attachment.blob),
      });
    }
  }

  return new Blob([createZip(entries)], { type: 'application/zip' });
}

export async function importBackupFile(file: File): Promise<Pick<BackupPayload, 'items' | 'relationships'>> {
  if (file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip') {
    return importBackupZip(file);
  }

  return importBackup(await file.text());
}

export async function importBackupZip(blob: Blob): Promise<Pick<BackupPayload, 'items' | 'relationships'>> {
  const entries = readZip(await blobToUint8Array(blob));
  const backupJson = entries.get('backup.json');
  if (!backupJson) throw new Error('ZIP backup is missing backup.json.');

  const backup = importBackup(new TextDecoder().decode(backupJson));

  return {
    items: backup.items.map((item) => ({
      ...item,
      attachments: item.attachments.map((attachment) => {
        const data = entries.get(getAttachmentEntryName(attachment.id));
        return {
          ...attachment,
          blob: data ? new Blob([data], { type: attachment.fileType }) : new Blob(),
          previewUrl: undefined,
        };
      }),
    })),
    relationships: backup.relationships,
  };
}

function createBackupPayload(items: Item[], relationships: Relationship[]): BackupPayload {
  return {
    version: 1,
    exportedAt: nowIso(),
    items: items.map((item) => ({
      ...item,
      attachments: item.attachments.map((attachment) => ({
        ...attachment,
        blob: new Blob(),
        previewUrl: undefined,
      })),
    })),
    relationships,
  };
}

export function importBackup(json: string): Pick<BackupPayload, 'items' | 'relationships'> {
  const parsed = JSON.parse(json) as unknown;

  if (!isBackupPayload(parsed)) {
    throw new Error('Invalid backup payload.');
  }

  return {
    items: parsed.items.map(normalizeImportedItem),
    relationships: parsed.relationships,
  };
}

function normalizeImportedItem(item: Item): Item {
  return {
    ...item,
    attachments: item.attachments.map((attachment) => ({
      ...attachment,
      blob: isBlobLike(attachment.blob) ? attachment.blob : new Blob([], { type: attachment.fileType }),
      previewUrl: undefined,
    })),
  };
}

function isBackupPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as BackupPayload;

  return (
    candidate.version === 1 &&
    Array.isArray(candidate.items) &&
    Array.isArray(candidate.relationships) &&
    candidate.items.every(isItemLike) &&
    candidate.relationships.every(isRelationshipLike)
  );
}

function isItemLike(value: unknown): value is Item {
  if (!value || typeof value !== 'object') return false;
  const item = value as Item;

  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.type === 'string' &&
    typeof item.category === 'string' &&
    typeof item.status === 'string' &&
    typeof item.priority === 'string' &&
    Array.isArray(item.tags) &&
    typeof item.position?.x === 'number' &&
    typeof item.position?.y === 'number' &&
    Array.isArray(item.attachments) &&
    Array.isArray(item.checklist) &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string'
  );
}

function isRelationshipLike(value: unknown): value is Relationship {
  if (!value || typeof value !== 'object') return false;
  const relationship = value as Relationship;

  return (
    typeof relationship.id === 'string' &&
    typeof relationship.sourceItemId === 'string' &&
    typeof relationship.targetItemId === 'string' &&
    typeof relationship.label === 'string' &&
    typeof relationship.strength === 'number' &&
    typeof relationship.createdAt === 'string'
  );
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

function getAttachmentEntryName(attachmentId: string): string {
  return `attachments/${attachmentId}`;
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === 'function') {
    return new Uint8Array(await blob.arrayBuffer());
  }

  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read attachment blob.'));
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.readAsArrayBuffer(blob);
    });
  }

  return new TextEncoder().encode(await blob.text());
}
