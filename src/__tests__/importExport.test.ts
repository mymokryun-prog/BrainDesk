import { describe, expect, it } from 'vitest';
import { exportBackup, exportBackupZip, importBackup, importBackupZip } from '../utils/importExport';
import type { Item, Relationship } from '../types/item';

describe('import and export backup', () => {
  it('round-trips items and relationships as JSON', () => {
    const item: Item = {
      id: 'item-1',
      title: 'Launch plan',
      description: 'Executive rollout checklist',
      type: 'project',
      category: 'Company',
      status: 'active',
      priority: 'high',
      dueDate: '2026-06-01',
      tags: ['launch'],
      position: { x: 100, y: 200 },
      attachments: [],
      checklist: [],
      createdAt: '2026-05-15T00:00:00.000Z',
      updatedAt: '2026-05-15T00:00:00.000Z',
    };
    const relationship: Relationship = {
      id: 'rel-1',
      sourceItemId: 'item-1',
      targetItemId: 'item-2',
      label: 'depends on',
      strength: 3,
      createdAt: '2026-05-15T00:00:00.000Z',
    };

    const json = exportBackup([item], [relationship]);
    const imported = importBackup(json);

    expect(imported.items).toEqual([item]);
    expect(imported.relationships).toEqual([relationship]);
  });

  it('rejects invalid backup payloads', () => {
    expect(() => importBackup('{"items": "nope"}')).toThrow(/Invalid backup/i);
  });

  it('round-trips attachment blobs in ZIP backups', async () => {
    const attachmentBlob = new Blob(['image bytes'], { type: 'image/png' });
    const item: Item = {
      id: 'item-zip',
      title: 'Screenshot note',
      description: '',
      type: 'screenshot',
      category: 'Personal',
      status: 'active',
      priority: 'medium',
      dueDate: '',
      tags: [],
      position: { x: 20, y: 40 },
      attachments: [
        {
          id: 'att-1',
          itemId: 'item-zip',
          fileName: 'screen.png',
          fileType: 'image/png',
          fileSize: attachmentBlob.size,
          blob: attachmentBlob,
          previewUrl: 'blob:local-preview',
          createdAt: '2026-05-15T00:00:00.000Z',
        },
      ],
      checklist: [],
      createdAt: '2026-05-15T00:00:00.000Z',
      updatedAt: '2026-05-15T00:00:00.000Z',
    };

    const zip = await exportBackupZip([item], []);
    const imported = await importBackupZip(zip);
    const importedAttachment = imported.items[0].attachments[0];

    expect(imported.items[0].title).toBe('Screenshot note');
    expect(importedAttachment.fileName).toBe('screen.png');
    expect(importedAttachment.previewUrl).toBeUndefined();
    await expect(readBlobText(importedAttachment.blob)).resolves.toBe('image bytes');
  });
});

async function readBlobText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') return blob.text();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read blob.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });
}
