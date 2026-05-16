import type { BackupPayload, Item, Relationship } from '../types/item';
import { nowIso } from './dates';

interface ZipEntryInput {
  name: string;
  data: Uint8Array;
}

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

function createZip(entries: ZipEntryInput[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = new TextEncoder().encode(entry.name);
    const crc = crc32(entry.data);
    const localHeader = new Uint8Array(30 + name.length);
    const localView = new DataView(localHeader.buffer);
    writeHeader(localView, 0x04034b50, 20, 0, 0, crc, entry.data.length, name.length);
    localHeader.set(name, 30);
    localParts.push(localHeader, entry.data);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    writeCentralHeader(centralView, crc, entry.data.length, name.length, offset);
    centralView.setUint32(42, offset, true);
    centralHeader.set(name, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + entry.data.length;
  }

  const centralOffset = offset;
  const centralSize = byteLength(centralParts);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);

  return concatUint8Arrays([...localParts, ...centralParts, end]);
}

function readZip(zip: Uint8Array): Map<string, Uint8Array> {
  const entries = new Map<string, Uint8Array>();
  let offset = 0;
  const decoder = new TextDecoder();

  while (offset + 30 <= zip.length) {
    const view = new DataView(zip.buffer, zip.byteOffset + offset);
    const signature = view.getUint32(0, true);
    if (signature !== 0x04034b50) break;

    const compression = view.getUint16(8, true);
    if (compression !== 0) throw new Error('Compressed ZIP backups are not supported yet.');

    const compressedSize = view.getUint32(18, true);
    const fileNameLength = view.getUint16(26, true);
    const extraLength = view.getUint16(28, true);
    const nameStart = offset + 30;
    const dataStart = nameStart + fileNameLength + extraLength;
    const dataEnd = dataStart + compressedSize;
    const name = decoder.decode(zip.slice(nameStart, nameStart + fileNameLength));

    if (dataEnd > zip.length) throw new Error('Invalid ZIP backup.');
    entries.set(name, zip.slice(dataStart, dataEnd));
    offset = dataEnd;
  }

  return entries;
}

function writeHeader(
  view: DataView,
  signature: number,
  versionMadeBy: number,
  versionNeeded: number,
  flags: number,
  crc: number,
  size: number,
  nameLength: number,
): void {
  view.setUint32(0, signature, true);
  view.setUint16(4, versionMadeBy, true);
  view.setUint16(6, versionNeeded, true);
  view.setUint16(8, flags, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, nameLength, true);
  view.setUint16(28, 0, true);
}

function writeCentralHeader(view: DataView, crc: number, size: number, nameLength: number, localOffset: number): void {
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, nameLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localOffset, true);
}

function concatUint8Arrays(parts: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(byteLength(parts));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function byteLength(parts: Uint8Array[]): number {
  return parts.reduce((total, part) => total + part.length, 0);
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
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
