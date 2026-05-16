import { describe, expect, it } from 'vitest';
import { createBackupStatus } from '../utils/toolbarStatus';

describe('createBackupStatus', () => {
  it('creates export and import success messages', () => {
    expect(createBackupStatus('export-success')).toEqual({
      kind: 'success',
      message: 'Backup ZIP exported.',
    });
    expect(createBackupStatus('import-success')).toEqual({
      kind: 'success',
      message: 'Backup imported.',
    });
  });

  it('creates failure messages from errors', () => {
    expect(createBackupStatus('export-error', new Error('Disk full'))).toEqual({
      kind: 'error',
      message: 'Disk full',
    });
    expect(createBackupStatus('import-error')).toEqual({
      kind: 'error',
      message: 'Could not import backup.',
    });
  });
});
