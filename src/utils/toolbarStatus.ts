export interface ToolbarStatus {
  kind: 'success' | 'error';
  message: string;
}

type BackupStatusEvent = 'export-success' | 'import-success' | 'export-error' | 'import-error';

export function createBackupStatus(event: BackupStatusEvent, error?: unknown): ToolbarStatus {
  if (event === 'export-success') {
    return { kind: 'success', message: 'Backup ZIP exported.' };
  }

  if (event === 'import-success') {
    return { kind: 'success', message: 'Backup imported.' };
  }

  return {
    kind: 'error',
    message: getErrorMessage(error, event === 'export-error' ? 'Could not export backup.' : 'Could not import backup.'),
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
