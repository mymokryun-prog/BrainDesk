import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BottomToolbar } from '../components/layout/BottomToolbar';
import { exportBackupZip } from '../utils/importExport';

vi.mock('../utils/importExport', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/importExport')>();
  return {
    ...actual,
    exportBackupZip: vi.fn(),
  };
});

describe('BottomToolbar', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(exportBackupZip).mockResolvedValue(new Blob(['backup'], { type: 'application/zip' }));
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:backup');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows and manually dismisses backup export status', async () => {
    render(<BottomToolbar />);

    fireEvent.click(screen.getByTitle('Export full ZIP backup'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole('status')).toHaveTextContent('Backup ZIP exported.');

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss status' }));

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  it('auto dismisses backup export status', async () => {
    let dismissStatus: (() => void) | undefined;
    vi.spyOn(window, 'setTimeout').mockImplementation(((handler: TimerHandler) => {
      dismissStatus = typeof handler === 'function' ? (handler as () => void) : undefined;
      return 1 as unknown as ReturnType<typeof setTimeout>;
    }) as unknown as typeof setTimeout);
    vi.spyOn(window, 'clearTimeout').mockImplementation(() => {});

    render(<BottomToolbar />);

    fireEvent.click(screen.getByTitle('Export full ZIP backup'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole('status')).toHaveTextContent('Backup ZIP exported.');
    expect(window.setTimeout).toHaveBeenCalledWith(expect.any(Function), 4500);

    act(() => dismissStatus?.());

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('records and shows the last backup time after export', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-17T01:23:00.000Z'));
    render(<BottomToolbar />);

    fireEvent.click(screen.getByTitle('Export full ZIP backup'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Last backup: 2026-05-17 01:23')).toBeInTheDocument();
    expect(localStorage.getItem('neurotask:lastBackupAt')).toBe('2026-05-17T01:23:00.000Z');
  });
});
