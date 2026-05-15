import type { BackupPayload, Item, Relationship } from '../types/item';
import { nowIso } from './dates';

export function exportBackup(items: Item[], relationships: Relationship[]): string {
  const payload: BackupPayload = {
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

  return JSON.stringify(payload, null, 2);
}

export function importBackup(json: string): Pick<BackupPayload, 'items' | 'relationships'> {
  const parsed = JSON.parse(json) as unknown;

  if (!isBackupPayload(parsed)) {
    throw new Error('Invalid backup payload.');
  }

  return {
    items: parsed.items,
    relationships: parsed.relationships,
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
