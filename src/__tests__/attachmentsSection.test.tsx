import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentsSection } from '../components/detail/AttachmentsSection';
import type { Item } from '../types/item';

describe('AttachmentsSection', () => {
  it('opens and closes a large preview for image attachments', async () => {
    const user = userEvent.setup();
    const item = createItemWithImageAttachment();

    render(
      <AttachmentsSection
        selectedItem={item}
        addAttachment={vi.fn()}
        deleteAttachment={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Preview screenshot.png' }));

    expect(screen.getByRole('dialog', { name: 'screenshot.png preview' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'screenshot.png large preview' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close preview' }));

    expect(screen.queryByRole('dialog', { name: 'screenshot.png preview' })).not.toBeInTheDocument();
  });
});

function createItemWithImageAttachment(): Item {
  return {
    id: 'item-1',
    title: 'Screenshot memo',
    description: '',
    type: 'screenshot',
    category: 'Personal',
    status: 'active',
    priority: 'medium',
    dueDate: '',
    tags: [],
    position: { x: 0, y: 0 },
    checklist: [],
    attachments: [
      {
        id: 'att-1',
        itemId: 'item-1',
        fileName: 'screenshot.png',
        fileType: 'image/png',
        fileSize: 2048,
        blob: new Blob(['image'], { type: 'image/png' }),
        previewUrl: 'blob:screenshot',
        createdAt: '2026-05-16T00:00:00.000Z',
      },
    ],
    createdAt: '2026-05-16T00:00:00.000Z',
    updatedAt: '2026-05-16T00:00:00.000Z',
  };
}
