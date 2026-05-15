import { describe, expect, it } from 'vitest';
import { exportBackup, importBackup } from '../utils/importExport';
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
});
